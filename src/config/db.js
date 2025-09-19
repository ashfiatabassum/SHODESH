require("dotenv").config({
  path: require("path").resolve(__dirname, "..", "..", ".env"),
});

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST, // 127.0.0.1
  user: process.env.DB_USER, // shodesh_user (or whatever you set)
  password: process.env.DB_PASS, // 202314055
  database: process.env.DB_NAME, // shodesh
  port: Number(process.env.DB_PORT), // 👈 default to 3307
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("DB host:", process.env.DB_HOST, "port:", process.env.DB_PORT);

// Test the connection
(async () => {
  try {
    await pool.getConnection();
    console.log(
      `✅ Connected to MySQL on port ${process.env.DB_PORT || 3307}!`
    );
  } catch (err) {
    console.error("❌ Error connecting to MySQL:", err);
  }
})();

module.exports = pool;
