const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',       // your MySQL username
  password: 'mirpurdohs832', // replace with your MySQL password
  database: 'shodesh' // replace with your DB name
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL');
});

module.exports = connection;
