const mysql = require('mysql2/promise');

async function verifyStaffAccount() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '202314055',
    database: 'shodesh'
  });
  
  console.log('Connected to MySQL');
  
  try {
    // Verify a specific staff account for testing
    const username = process.argv[2] || 'teststaff'; // Get username from command line or use default
    console.log(`Attempting to verify staff account: ${username}`);
    
    const [result] = await connection.execute(
      'UPDATE staff SET status = ? WHERE username = ?',
      ['verified', username]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Successfully verified account for user: ${username}`);
    } else {
      console.log(`❌ No account found with username: ${username}`);
    }
    
    // Show all verified accounts
    const [verifiedAccounts] = await connection.execute(
      'SELECT staff_id, username, status FROM staff WHERE status = "verified"'
    );
    
    console.log('\nVerified accounts:');
    console.table(verifiedAccounts);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

verifyStaffAccount();
