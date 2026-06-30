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
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'module' AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME]);

    if (cols.length > 0) {
      console.log('Column `status` already exists in `module`. Nothing to do.');
      return;
    }

    await pool.query(`
      ALTER TABLE module
      ADD COLUMN status ENUM('draft','published','archived') NOT NULL DEFAULT 'published'
      AFTER sort_order
    `);
    console.log('Added `status` column to `module` table (default: published).');

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
