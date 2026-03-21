-- Cloudflare D1 schema for BLR→LEH Expense Tracker
-- Run with: wrangler d1 execute leh-tracker --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS entries (
  id          TEXT    PRIMARY KEY,
  day_id      TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  category    TEXT    NOT NULL DEFAULT 'food',
  who         TEXT    NOT NULL DEFAULT 'ss',
  amount      REAL    NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS notes (
  day_id     TEXT    PRIMARY KEY,
  content    TEXT    NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_entries_day_id ON entries(day_id);
