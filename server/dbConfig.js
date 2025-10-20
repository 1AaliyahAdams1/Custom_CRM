const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });


//Connects to the database using the .env credentials

const sql = require("mssql");

const [host, port] = (process.env.DB_HOST || "").split(",");

const dbConfig = {
  user: process.env.DB_USER || "8589_TEAM16",
  password: process.env.DB_PASS || "InfosysAvengers16!",
  server: host || process.env.HOST_ALT || "mssql6.websitelive.net",
  port: port ? parseInt(port, 10) : 1433,
  database: process.env.DB_NAME || "8589_CRM",
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Debug configuration
console.log("🔍 Database Configuration:");
console.log("Server:", dbConfig.server);
console.log("Database:", dbConfig.database);
console.log("User:", dbConfig.user);
console.log("Port:", dbConfig.port);

// Validate required configuration
if (!dbConfig.server) {
  console.error("❌ Database configuration error: server property is missing!");
} else {
  console.log("✅ Database configuration looks good!");
}

// Create a single pool instance and export a promise that resolves when connected
const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then((pool) => {
    console.log("Connected to MSSQL");
    return pool;
  })
  .catch((err) => {
    console.error("Database Connection Failed! ", err);
    throw err;
  });
  

module.exports = {
  sql,
  dbConfig,
  poolPromise,  // export this for repository use
};
