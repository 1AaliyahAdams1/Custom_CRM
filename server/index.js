//NEEDED CONNECTIONS
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });


//NEEDED PACKAGES
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({

  origin: [
    process.env.SERVER_URL,
    process.env.ALT_SERVER_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Allow full set of HTTP methods
  allowedHeaders: ['Content-Type'],                      // Allow JSON headers
}));
app.options("*", cors()); // Handle CORS preflight for PUT/DELETE

app.use(express.json());

//ROUTES
const accountRoutes = require("./routes/accountRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dealRoutes = require("./routes/dealRoutes");
const contactRoutes = require("./routes/contactRoutes");
const cityRoutes = require("./routes/cityRoutes");
const activityTypeRoutes = require("./routes/activityTypeRoutes");
const dealStageRoutes = require("./routes/dealStageRoutes");


// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Mount the route onto a directory
app.use("/account", accountRoutes);
app.use("/activity", activityRoutes);
app.use("/deal", dealRoutes);
app.use("/contact", contactRoutes);
app.use("/city", cityRoutes);
app.use("/activitytype", activityTypeRoutes);
app.use("/dealstage", dealStageRoutes);

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
