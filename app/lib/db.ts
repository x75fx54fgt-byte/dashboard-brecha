import Database from "better-sqlite3";
import path from "path";

let db: Database.Database | null = null;

export function getDB() {
  if (!db) {
    const dbPath = path.join(process.cwd(), "data.sqlite");
    db = new Database(dbPath);

    db.prepare(`
      CREATE TABLE IF NOT EXISTS rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        currency TEXT NOT NULL,
        bcv REAL NOT NULL,
        binance REAL NOT NULL,
        brecha REAL NOT NULL,
        created_at TEXT NOT NULL
      )
    `).run();
  }

  return db;
}
