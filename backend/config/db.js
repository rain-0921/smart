const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Pin every connection to UTC so DATETIME values are written and read
  // unambiguously. Without this, the MySQL session uses its server-local
  // timezone, which silently shifts due_date values away from what the
  // instructor selected in the browser.
  timezone: 'Z',
  dateStrings: false
});

module.exports = pool.promise();