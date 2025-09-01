const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '202314055',
  database: 'shodesh'
});

// Test the connection
connection.connect(err => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err);
    return;
  }
  console.log('✅ Successfully connected to MySQL!');
});

module.exports = connection.promise();
