const mysql = require('mysql2');

// Create connection pool with promise support for admin functionality
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // your MySQL username
  password: 'mirpurdohs832', // replace with your MySQL password
  database: 'shodesh', // replace with your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
