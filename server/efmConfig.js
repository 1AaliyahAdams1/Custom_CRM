const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

module.exports = {
    baseURL: process.env.EFM_BASE_URL,
    apiKey: process.env.EFM_API_KEY,
};