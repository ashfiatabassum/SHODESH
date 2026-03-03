require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mirpurdohs832',
  database: process.env.DB_NAME || 'shodesh',
  port: process.env.DB_PORT || 3306,
  authPlugins: {
    mysql_clear_password: () => () => process.env.DB_PASSWORD
  }
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    console.error('Connection details:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME
    });
    return;
  }
  console.log('✅ Connected to Database:', process.env.DB_HOST);
});

module.exports = connection;