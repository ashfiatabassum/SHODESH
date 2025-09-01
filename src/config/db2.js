// Dedicated connection (replacement for legacy db.js) - hardcoded creds
const mysql = require('mysql2/promise');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '202314055',
  database: 'shodesh'
});

console.log('🛠 (db2) Using hardcoded DB config: { host: 127.0.0.1, user: root, password: *** , database: shodesh }');

// Test connection
connection.then(conn => {
  console.log('(db2) ✅ Connected to MySQL as root threadId=', conn.threadId);
}).catch(err => {
  console.error('❌ (db2) MySQL connection failed:', err.message);
});

module.exports = connection;
