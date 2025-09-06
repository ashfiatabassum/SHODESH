const mysql = require('mysql2/promise');

async function checkStatusValues() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '202314055',
    database: 'shodesh'
  });
  
  console.log('Connected to MySQL');
  
  try {
    // Get column definition
    const [columns] = await connection.execute('SHOW COLUMNS FROM staff LIKE "status";');
    console.log('Status column definition:', columns[0]);
    
    // Check actual status values in use
    const [rows] = await connection.execute('SELECT staff_id, username, status FROM staff LIMIT 10;');
    console.log('Staff records with status values:');
    console.table(rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

checkStatusValues();
