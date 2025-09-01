const mysql = require('mysql2');

// Create connection pool with promise support for admin functionality
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '202314055',
  database: 'shodesh',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Get promise-based pool
const promisePool = pool.promise();

// Note: We intentionally avoid running a test query here to prevent noisy
// "access denied" logs during development when DB credentials may be missing.
// If you want to verify the admin DB connection, call `promisePool.execute('SELECT 1')`
// from a controlled startup or admin route and handle the error there.

module.exports = promisePool;
