const mysql = require('mysql2');

console.log('Starting MySQL connection test...');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ADGJmptw123@#',
  database: 'shodesh'
});

connection.connect(err => {
  if (err) {
    console.error('Connection error:', err.message);
  } else {
    console.log('Connected!');
  }
  connection.end(() => {
    console.log('Connection closed');
  });
});
