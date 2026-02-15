const path = require('path');

/* .env 강제 로드 */
require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const mysql = require('mysql2/promise');

/* 환경변수 체크 */
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error("❌ DB ENV NOT LOADED");
  process.exit(1);
}

console.log("DB ENV CHECK:",
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_NAME
);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+09:00'
});

module.exports = pool;