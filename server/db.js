import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MariaDB Connection Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

let pool;

export async function getPool() {
  if (!pool) {
    // First ensure database exists
    const initialConn = await mysql.createConnection(dbConfig);
    await initialConn.query('CREATE DATABASE IF NOT EXISTS shilpikunjo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await initialConn.end();

    // Create pool with database selected
    pool = mysql.createPool({
      ...dbConfig,
      database: 'shilpikunjo',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Connected to MariaDB/MySQL database: shilpikunjo');
  }
  return pool;
}

export async function initDb() {
  const p = await getPool();
  const schemaPath = path.resolve(__dirname, '../backend/mariadb_schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await p.query(schemaSql);
    console.log('MariaDB DDL Schema applied successfully.');
  } else {
    console.warn('mariadb_schema.sql file not found at:', schemaPath);
  }
}

export async function queryAll(sql, params = []) {
  const p = await getPool();
  const [rows] = await p.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function run(sql, params = []) {
  const p = await getPool();
  const [result] = await p.query(sql, params);
  return {
    lastID: result.insertId,
    affectedRows: result.affectedRows
  };
}

export default {
  getPool,
  initDb,
  queryAll,
  queryOne,
  run
};
