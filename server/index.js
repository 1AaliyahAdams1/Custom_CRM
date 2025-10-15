//NEEDED CONNECTIONS
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const { startEFMSyncScheduler } = require('./utils/scheduler');


//NEEDED PACKAGES
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(cors({

  origin: [
    process.env.SERVER_URL,
    process.env.ALT_SERVER_URL
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization'],       
}));
app.options("*", cors()); 

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
const categoryRoutes = require("./routes/categoryRoutes");
const jobTitleRoutes = require("./routes/jobTitleRoutes");
const priorityLevelRoutes = require("./routes/priorityLevelRoutes");
const stateProvinceRoutes = require("./routes/stateProvinceRoutes");
const productRoutes = require("./routes/productRoutes");
const personRoutes = require('./routes/personRoutes');
const reportRoutes = require("./routes/reportRoutes");
const countryRoutes = require("./routes/countryRoutes")
const authRoutes = require("./routes/auth/authRoutes");
const workRoutes = require('./routes/workRoutes');
const sequenceRoutes = require('./routes/sequenceRoutes');
const attachmentRoutes = require("./routes/attachmentRoutes");
const assignUserRoutes = require("./routes/assignUserRoutes");  
const employeeRoutes = require("./routes/employeeRoutes"); 
const currencyRoutes = require("./routes/currencyRoutes");
const noteRoutes = require("./routes/noteRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

//API ROUTES
const efmvenuesRoute = require('./routes/efm/efmVenueRoute');
const efmeventsRoute = require('./routes/efm/efmEventRoute');
const efmcompaniesRoute = require('./routes/efm/efmCompanyRoute');
const efmownersRoute = require('./routes/efm/efmOwnerRoute');
const efmcountriesRoute = require('./routes/efm/efmCountryRoute');
const efmcitiesRoute = require('./routes/efm/efmCityRoute');
const efmdiscountsRoute = require('./routes/efm/efmDiscountRoute');
const efmSyncRouter = require('./routes/efm/efmSync');

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
app.use("/jobTitles", jobTitleRoutes);
app.use("/prioritylevels", priorityLevelRoutes);
app.use("/states", stateProvinceRoutes);
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);
app.use('/persons', personRoutes);
app.use("/reports", reportRoutes);
app.use("/countries", countryRoutes)
app.use("/auth", authRoutes);
app.use('/work', workRoutes);
app.use('/sequences', sequenceRoutes);
app.use("/attachments", attachmentRoutes);
app.use('/assign', assignUserRoutes);
app.use("/employees", employeeRoutes);
app.use("/notes", noteRoutes);
app.use("/currencies", currencyRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/audit-logs", auditLogRoutes);
app.use("/departments", departmentRoutes);
// Also expose with /api prefix for clients expecting /api/departments
app.use("/api/departments", departmentRoutes);

//API Mounting
app.use('/api/cities', efmcitiesRoute);
app.use('/api/countries', efmcountriesRoute);
app.use('/api/categories', categoryRoutes);
app.use('/api/events', efmeventsRoute);
app.use('/api/venues', efmvenuesRoute);
app.use('/api/companies', efmcompaniesRoute);
app.use('/api/owners', efmownersRoute);
app.use('/api/discounts', efmdiscountsRoute);
app.use('/api/efm-sync', efmSyncRouter);


// Start scheduler [every hour updates info from main site]
startEFMSyncScheduler();


const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";


app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});