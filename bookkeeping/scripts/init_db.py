#!/usr/bin/env python3
"""Initialize the bookkeeping SQLite database."""

import sqlite3
import argparse
import os

SCHEMA = """
CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    text        TEXT NOT NULL,
    sender_id   TEXT,
    created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id  INTEGER NOT NULL,
    date        TEXT NOT NULL,
    payee       TEXT NOT NULL,
    narration   TEXT NOT NULL,
    account     TEXT NOT NULL,
    amount      REAL NOT NULL,
    currency    TEXT DEFAULT 'TWD',
    payment     TEXT DEFAULT 'Assets:Cash',
    created_at  TEXT NOT NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account);
CREATE INDEX IF NOT EXISTS idx_transactions_message_id ON transactions(message_id);
"""

def main():
    parser = argparse.ArgumentParser(description="Initialize bookkeeping database")
    parser.add_argument("--db", required=True, help="Path to SQLite database")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(args.db), exist_ok=True)
    conn = sqlite3.connect(args.db)
    conn.executescript(SCHEMA)
    conn.close()
    print(f"[OK] Database initialized: {args.db}")

if __name__ == "__main__":
    main()
