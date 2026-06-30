export const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    icon       TEXT    NOT NULL,
    color      TEXT    NOT NULL,
    type       TEXT    NOT NULL CHECK(type IN ('INCOME','EXPENSE')),
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS delegations (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    icon           TEXT    NOT NULL,
    color          TEXT    NOT NULL,
    period_type    TEXT    NOT NULL CHECK(period_type IN ('MONTHLY','WEEKLY','ONE_TIME')),
    default_budget REAL    NOT NULL,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS delegation_periods (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    delegation_id    INTEGER NOT NULL REFERENCES delegations(id) ON DELETE CASCADE,
    budgeted_amount  REAL    NOT NULL,
    period_start     TEXT    NOT NULL,
    period_end       TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    amount               REAL    NOT NULL,
    type                 TEXT    NOT NULL CHECK(type IN ('INCOME','EXPENSE')),
    category_id          INTEGER NOT NULL REFERENCES categories(id),
    delegation_period_id INTEGER REFERENCES delegation_periods(id) ON DELETE SET NULL,
    note                 TEXT,
    date                 TEXT    NOT NULL,
    created_at           TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS savings_goals (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT NOT NULL,
    icon           TEXT NOT NULL,
    target_amount  REAL NOT NULL,
    current_amount REAL NOT NULL DEFAULT 0,
    deadline       TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loans (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    label           TEXT NOT NULL,
    counterparty    TEXT NOT NULL,
    type            TEXT NOT NULL CHECK(type IN ('LENT','BORROWED')),
    original_amount REAL NOT NULL,
    date            TEXT NOT NULL,
    note            TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS loan_repayments (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id  INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount   REAL    NOT NULL,
    date     TEXT    NOT NULL,
    note     TEXT
  );
`;
