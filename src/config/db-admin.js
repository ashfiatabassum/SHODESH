require('dotenv').config();
const mysql = require('mysql2');

// Create connection pool with promise support for admin functionality
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mirpurdohs832',
  database: process.env.DB_NAME || 'shodesh',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  authPlugins: {
    mysql_clear_password: () => () => process.env.DB_PASSWORD
  }
});

// Get promise-based pool
const promisePool = pool.promise();

// Test connection
promisePool.execute('SELECT 1').then(() => {
  console.log('✅ Admin DB Connected to MySQL');
}).catch((err) => {
  console.error('❌ Admin MySQL connection failed:', err);
});

module.exports = promisePool;
