require('dotenv').config();
const mysql = require('mysql2/promise');

async function cleanup() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const [[before]] = await pool.execute(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN user_id IS NOT NULL AND target_role IS NOT NULL THEN 1 ELSE 0 END) AS bad_rows
       FROM notification`
    );
    console.log(`Before: total=${before.total}, rows with BOTH user_id+target_role=${before.bad_rows}`);

    const [result] = await pool.execute(
      `UPDATE notification SET target_role = NULL WHERE user_id IS NOT NULL`
    );
    console.log(`Rows updated: ${result.affectedRows}`);

    const [[after]] = await pool.execute(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN user_id IS NOT NULL AND target_role IS NOT NULL THEN 1 ELSE 0 END) AS bad_rows
       FROM notification`
    );
    console.log(`After:  total=${after.total}, rows with BOTH user_id+target_role=${after.bad_rows}`);
    console.log('Cleanup complete.');
  } finally {
    await pool.end();
  }
}

cleanup().catch(err => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
