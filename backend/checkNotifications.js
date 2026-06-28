require('dotenv').config();
const mysql = require('mysql2/promise');

async function check() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    const [rows] = await pool.execute(
      `SELECT notification_id, user_id, target_role, title, type, is_read FROM notification ORDER BY notification_id`
    );
    console.table(rows);
  } finally {
    await pool.end();
  }
}

check().catch(err => { console.error(err.message); process.exit(1); });
