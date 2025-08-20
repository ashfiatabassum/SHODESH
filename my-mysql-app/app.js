const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',
  database: 'your_database'
});

connection.connect((err) => {
  if (err) {
    console.error(' Error connecting: ' + err.stack);
    return;
  }
  console.log(' Connected as ID ' + connection.threadId);

  connection.end();  // Don't forget to close the connection
});
