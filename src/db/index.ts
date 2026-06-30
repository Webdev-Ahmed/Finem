import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('finance.db');
  return _db;
}

export async function initDB(): Promise<void> {
  const db = await getDB();
  await db.execAsync(SCHEMA);
}
