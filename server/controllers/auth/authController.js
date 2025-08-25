const authService = require("../../services/auth/authService");
const roleService = require("../../services/auth/roleService");

async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "Email/Username and password are required." });
    }

    console.log("=== Auth Controller Login Debug ===");
    console.log("Login attempt for identifier:", identifier);

    // Use the authService.login which already handles everything
    const loginResult = await authService.login(identifier, password);
    
    console.log("Auth service result:", loginResult);
    console.log("Token from auth service:", loginResult.token);

   
    res.json({
      message: "Login successful",
      token: loginResult.token,
      user: loginResult.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message || "Authentication failed" });
  }
}

module.exports = {
  login,
};