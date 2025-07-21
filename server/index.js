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
const activityTypeRoutes = require("./routes/activityTypeRoutes");
const cityRoutes = require("./routes/cityRoutes");
const contactRoutes = require("./routes/contactRoutes");
const dealRoutes = require("./routes/dealRoutes");
const dealStageRoutes = require("./routes/dealStageRoutes");
const industryRoutes = require("./routes/industryRoutes");
const jobTitleRoutes = require("./routes/jobtitleRoutes");
const priorityLevelRoutes = require("./routes/priorityLevelRoutes");
const stateProvinceRoutes = require("./routes/stateProvinceRoutes");

// Test route
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Mount the route onto a directory
app.use("/accounts", accountRoutes);
app.use("/activities", activityRoutes);
app.use("/activitytypes", activityTypeRoutes);
app.use("/cities", cityRoutes);
app.use("/contacts", contactRoutes);
app.use("/deals", dealRoutes);
app.use("/dealstages", dealStageRoutes);
app.use("/industries", industryRoutes);
app.use("/jobtitles", jobTitleRoutes);
app.use("/prioritylevels", priorityLevelRoutes);
app.use("/states", stateProvinceRoutes);


const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
