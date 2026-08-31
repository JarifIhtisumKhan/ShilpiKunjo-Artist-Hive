import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const sqlitePath = path.resolve(__dirname, 'shilpikunjo.db');

// MariaDB Connection Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectTimeout: 2000,
  multipleStatements: true
};

let pool = null;
let useSqlite = false;

function sqliteQueryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqlitePath);
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function sqliteRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqlitePath);
    db.run(sql, params, function (err) {
      db.close();
      if (err) reject(err);
      else resolve({ lastID: this.lastID, affectedRows: this.changes });
    });
  });
}

export async function getPool() {
  if (useSqlite) return null;
  if (!pool) {
    try {
      const initialConn = await mysql.createConnection(dbConfig);
      await initialConn.query('CREATE DATABASE IF NOT EXISTS shilpikunjo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
      await initialConn.end();

      pool = mysql.createPool({
        ...dbConfig,
        database: 'shilpikunjo',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('Connected to MariaDB/MySQL database: shilpikunjo');
    } catch (err) {
      console.warn(`MySQL connection failed (${err.message}). Falling back to SQLite database: ${sqlitePath}`);
      useSqlite = true;
      return null;
    }
  }
  return pool;
}

function sqliteExec(sql) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(sqlitePath);
    db.exec(sql, (err) => {
      db.close();
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function initDb() {
  const p = await getPool();
  if (useSqlite || !p) {
    console.log('Initializing SQLite database schema at:', sqlitePath);
    try {
      const checkCols = await sqliteQueryAll("PRAGMA table_info(Challenges)");
      const hasDesc = checkCols.some(c => c.name === 'description');
      if (!hasDesc && checkCols.length > 0) {
        console.log('Legacy SQLite schema detected. Recreating tables for updated schema...');
        const tables = [
          'Commissions',
          'CourseEnrollments', 'CourseContent', 'Courses', 'ChallengeSubmissions',
          'Challenges', 'ArtworkComments', 'Artworks',
          'ArtistExpertise', 'Artists', 'Admins', 'Users'
        ];
        for (const t of tables) {
          await sqliteRun(`DROP TABLE IF EXISTS ${t}`);
        }
      }
    } catch (e) {
      // Ignore if table doesn't exist
    }

    await sqliteExec(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone_number TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Admins (
        admin_id INTEGER PRIMARY KEY,
        FOREIGN KEY (admin_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Artists (
        artist_id INTEGER PRIMARY KEY,
        bio TEXT,
        portfolio_links TEXT,
        availability_status TEXT DEFAULT 'Available',
        FOREIGN KEY (artist_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ArtistExpertise (
        artist_id INTEGER,
        expertise TEXT NOT NULL,
        PRIMARY KEY (artist_id, expertise),
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Artworks (
        art_id INTEGER PRIMARY KEY AUTOINCREMENT,
        artist_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        media_url TEXT NOT NULL,
        react_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ArtworkComments (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        art_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ArtworkReactions (
        art_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (art_id, user_id),
        FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Challenges (
        challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        start_date DATE NOT NULL,
        deadline DATE NOT NULL,
        banner_url TEXT,
        participation_limit INTEGER,
        status TEXT DEFAULT 'Active',
        FOREIGN KEY (creator_id) REFERENCES Users(user_id)
      );

      CREATE TABLE IF NOT EXISTS ChallengeSubmissions (
        submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        art_id INTEGER NOT NULL,
        artist_id INTEGER NOT NULL,
        vote_count INTEGER DEFAULT 0,
        rank INTEGER,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (challenge_id, art_id),
        FOREIGN KEY (challenge_id) REFERENCES Challenges(challenge_id) ON DELETE CASCADE,
        FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ChallengeVotes (
        submission_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (submission_id, user_id),
        FOREIGN KEY (submission_id) REFERENCES ChallengeSubmissions(submission_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        instructor_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        pricing REAL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS CourseContent (
        content_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content_url TEXT NOT NULL,
        sequence_order INTEGER NOT NULL,
        FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS CourseEnrollments (
        enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        completion_status TEXT DEFAULT 'In Progress',
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (course_id, user_id),
        FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Commissions (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        artist_id INTEGER,
        requirements TEXT NOT NULL,
        description TEXT,
        price_offered REAL NOT NULL,
        deadline DATE NOT NULL,
        current_status TEXT DEFAULT 'Requested',
        media_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES Users(user_id),
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
      );
    `);
    console.log('SQLite DDL Schema applied successfully.');
    return;
  }
  if (p) {
    const schemaPath = path.resolve(__dirname, '../backend/mariadb_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await p.query(schemaSql);
      console.log('MariaDB DDL Schema applied successfully.');
    } else {
      console.warn('mariadb_schema.sql file not found at:', schemaPath);
    }
  }
}

export async function queryAll(sql, params = []) {
  const p = await getPool();
  if (useSqlite || !p) {
    return sqliteQueryAll(sql, params);
  }
  const [rows] = await p.query(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
}

export async function run(sql, params = []) {
  const p = await getPool();
  if (useSqlite || !p) {
    return sqliteRun(sql, params);
  }
  const [result] = await p.query(sql, params);
  return {
    lastID: result.insertId,
    affectedRows: result.affectedRows
  };
}

export function isSqlite() {
  return useSqlite;
}

export default {
  getPool,
  initDb,
  queryAll,
  queryOne,
  run,
  isSqlite,
  sqlitePath
};
