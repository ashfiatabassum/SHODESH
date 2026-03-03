require("dotenv").config();
const mysql = require("mysql2");

const isAzure = (process.env.DB_HOST || "").includes("mysql.database.azure.com");

const pool = mysql.createPool({
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

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  authPlugins: {
    mysql_clear_password: () => () => process.env.DB_PASSWORD,
  },
});

const promisePool = pool.promise();

promisePool
  .execute("SELECT 1")
  .then(() => console.log("✅ Admin DB Connected to MySQL | SSL:", isAzure ? "ON" : "OFF"))
  .catch((err) => console.error("❌ Admin MySQL connection failed:", err));

module.exports = promisePool;