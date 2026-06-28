/**
 * Migration: add `status` column to the `module` table.
 *
 * The student controller's getCourseModules filters on m.status='published',
 * so this column must exist to avoid "Unknown column 'm.status'" errors.
 *
 * Run with: node addModuleStatus.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 5,
  });

  try {
    // 1. Check if column already exists
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'module' AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME]);

    if (cols.length > 0) {
      console.log('Column `status` already exists in `module`. Nothing to do.');
      return;
    }

    // 2. Add the column with DEFAULT 'published' so existing modules are visible
    await pool.query(`
      ALTER TABLE module
      ADD COLUMN status ENUM('draft','published','archived') NOT NULL DEFAULT 'published'
      AFTER sort_order
    `);
    console.log('Added `status` column to `module` table (default: published).');

    // 3. Also fix module_progress — it may be missing a composite primary key,
    //    which can cause duplicate-entry errors on INSERT.
    const [pk] = await pool.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'module_progress'
        AND CONSTRAINT_NAME = 'PRIMARY'
    `, [process.env.DB_NAME]);

    if (pk.length === 0) {
      await pool.query(`
        ALTER TABLE module_progress
        ADD PRIMARY KEY (user_id, module_id)
      `);
      console.log('Added PRIMARY KEY to `module_progress` (user_id, module_id).');
    } else {
      console.log('`module_progress` already has a primary key.');
    }
  } finally {
    await pool.end();
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
