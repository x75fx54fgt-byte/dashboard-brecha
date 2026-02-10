import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.sqlite");

export const db = new Database(dbPath);

// crear tabla UNA sola vez
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
