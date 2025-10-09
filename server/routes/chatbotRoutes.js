// server/routes/chatbotRoutes.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");

const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Get free API key from: https://makersuite.google.com/app/apikey
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE";

router.post("/", async (req, res) => {
  const { message, userId } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: message }]
          }]
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("Gemini API Error:", text);
      return res.status(response.status).json({ error: "AI service unavailable" });
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response available.";

    // Save chat to SQL Server (optional)
    try {
      const request = new sql.Request();
      await request.query(`
        INSERT INTO ChatHistory (UserId, Message, Response)
        VALUES ('${userId || "guest"}', '${message.replace(/'/g, "''")}', '${aiResponse.replace(/'/g, "''")}')
      `);
    } catch (dbError) {
      console.error("Database error:", dbError);
    }

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ error: "AI chatbot failed to respond." });
  }
});

module.exports = router;