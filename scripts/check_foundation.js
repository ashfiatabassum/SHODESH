const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'mirpurdohs832',
      database: 'shodesh',
      waitForConnections: true,
      connectionLimit: 5
    });

    const conn = await pool.getConnection();
    const [rows] = await conn.execute("SELECT foundation_id, foundation_name, status, email, mobile FROM foundation WHERE LOWER(foundation_name) LIKE ?", ['%ashfia%']);
    console.log('results_count:', rows.length);
    console.log(JSON.stringify(rows, null, 2));
    conn.release();
    await pool.end();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
})();
