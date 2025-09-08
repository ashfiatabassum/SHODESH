const db = require("./db");

(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connection successful!");
    connection.release(); // Release the connection back to the pool
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();