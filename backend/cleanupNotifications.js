/**
 * Cleanup script: fix notification targeting bug.
 *
 * PROBLEM:
 * When an admin sent a notification to a single user (Mode 1 in createNotification),
 * the code was inserting rows with BOTH user_id AND target_role set (e.g. user_id=7,
 * target_role='student').  Because getNotifications queries use
 * "WHERE user_id=? OR target_role='student'", those rows matched ALL students,
 * not just the intended recipient.
 *
 * FIX:
 * Clear target_role on every row that has a user_id set.  Only role-broadcast
 * notifications (Mode 2, 3, 4) should have target_role set; single-recipient
 * notifications must have target_role = NULL so they are scoped to that user only.
 *
 * Run with: node cleanupNotifications.js
 */

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
    // Show before/after counts
    const [[before]] = await pool.execute(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN user_id IS NOT NULL AND target_role IS NOT NULL THEN 1 ELSE 0 END) AS bad_rows
       FROM notification`
    );
    console.log(`Before: total=${before.total}, rows with BOTH user_id+target_role=${before.bad_rows}`);

    // Fix: clear target_role on all user-specific rows
    // Rows with NULL user_id are pure role-broadcasts — leave those alone.
    const [result] = await pool.execute(
      `UPDATE notification SET target_role = NULL WHERE user_id IS NOT NULL`
    );
    console.log(`Rows updated: ${result.affectedRows}`);

    // Verify
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
