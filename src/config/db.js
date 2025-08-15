const mysql = require('mysql2');

// Create connection pool with promise support
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
  console.log('✅ Connected to MySQL');
}).catch((err) => {
  console.error('❌ MySQL connection failed:', err);
});

module.exports = promisePool;
