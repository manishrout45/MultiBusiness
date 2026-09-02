require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function migrate() {
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
  let sql = fs.readFileSync(schemaPath, 'utf8');
  const dbName = process.env.DB_NAME || 'marketplace_db';

  // Hostinger (and similar) already created the database — skip CREATE/USE.
  sql = sql
    .replace(/CREATE DATABASE IF NOT EXISTS \w+[^;]*;/i, '')
    .replace(/USE \w+\s*;/i, '');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true,
  });

  console.log(`Running schema migration on ${dbName}...`);
  await connection.query(sql);
  await connection.end();
  console.log('Migration completed successfully.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
