require("dotenv").config();
const mysql = require("mysql2");

const isAzure = (process.env.DB_HOST || "").includes("mysql.database.azure.com");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "shodesh",
  port: Number(process.env.DB_PORT || 3306),

  // ✅ REQUIRED for Azure when require_secure_transport=ON
  ...(isAzure
    ? {
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {}),

  // keep only if you really need it
  authPlugins: {
    mysql_clear_password: () => () => process.env.DB_PASSWORD,
  },
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    console.error("Connection details:", {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      ssl: isAzure ? "enabled" : "disabled",
    });
    return;
  }
  console.log("✅ Connected to Database:", process.env.DB_HOST, "| SSL:", isAzure ? "ON" : "OFF");
});

module.exports = connection;