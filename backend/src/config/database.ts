import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

type DB = Database<sqlite3.Database, sqlite3.Statement>;

let db: DB | null = null;

/**
 * Returns the path for the SQLite database file.
 */
const getDbPath = (): string => {
  if (process.env.NODE_ENV === 'test') {
    return path.resolve(process.env.TEST_DB_PATH || './data/test_car_dealership.sqlite');
  }
  return path.resolve(process.env.DB_PATH || './data/car_dealership.sqlite');
};

/**
 * Initializes and returns the SQLite database connection.
 * Singleton pattern - once initialized, the same instance is returned.
 * For tests, set TEST_DB_PATH env var before calling connectDB().
 */
export const connectDB = async (customPath?: string): Promise<DB> => {
  // Close existing connection if reinitializing with a new path
  if (db && customPath) {
    await db.close();
    db = null;
  }

  if (db) return db;

  const dbPath = customPath || getDbPath();

  // Ensure the directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const database = await open<sqlite3.Database, sqlite3.Statement>({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable WAL mode and foreign keys
  await database.run('PRAGMA journal_mode = WAL');
  await database.run('PRAGMA foreign_keys = ON');

  // Create schema
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('Sedan','SUV','Truck','Coupe','Van','Electric','Hybrid')),
      price REAL NOT NULL CHECK(price > 0),
      quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity >= 0),
      description TEXT DEFAULT '',
      image_url TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER IF NOT EXISTS update_vehicles_timestamp
    AFTER UPDATE ON vehicles
    BEGIN
      UPDATE vehicles SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  db = database;
  return db;
};

/**
 * Returns the current database singleton instance.
 */
export const getDB = (): DB => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

/**
 * Closes the database connection and resets the singleton.
 */
export const closeDB = async (): Promise<void> => {
  if (db) {
    try {
      await db.close();
    } catch {
      // Ignore close errors in tests
    }
    db = null;
  }
};
