import { getDB } from '../index';
import { Transaction, TransactionType } from '@/types';

export interface TransactionWithCategory extends Transaction {
  category_name: string;
  category_icon: string;
  category_color: string;
}

export async function insertTransaction(
  amount: number,
  type: TransactionType,
  categoryId: number,
  date: string,
  note?: string,
  delegationPeriodId?: number
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO transactions (amount, type, category_id, delegation_period_id, note, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [amount, type, categoryId, delegationPeriodId ?? null, note ?? null, date]
  );
  return result.lastInsertRowId;
}

export async function getRecentTransactions(limit = 10): Promise<TransactionWithCategory[]> {
  const db = await getDB();
  return db.getAllAsync<TransactionWithCategory>(
    `SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
     FROM transactions t
     JOIN categories c ON c.id = t.category_id
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getMonthlyTotals(
  year: number,
  month: number
): Promise<{ income: number; expense: number }> {
  const db = await getDB();
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  const row = await db.getFirstAsync<{ income: number; expense: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type='INCOME'  THEN amount ELSE 0 END), 0) as income,
       COALESCE(SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END), 0) as expense
     FROM transactions WHERE date LIKE ?`,
    [`${prefix}%`]
  );
  return row ?? { income: 0, expense: 0 };
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}
