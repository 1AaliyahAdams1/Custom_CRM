const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });


//Connects to the database using the .env credentials

const sql = require("mssql");

const [host, port] = (process.env.DB_HOST || "").split(",");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: host || process.env.HOST_ALT,
  port: port ? parseInt(port, 10) : 1433,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

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
