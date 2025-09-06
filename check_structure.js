const mysql = require('mysql2/promise');

async function showTableStructure() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '202314055',
    database: 'shodesh'
  });
  
  console.log('Connected to MySQL');
  
  try {
    const [rows] = await connection.execute('DESCRIBE staff');
    console.log('Staff table structure:');
    console.table(rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

showTableStructure();
