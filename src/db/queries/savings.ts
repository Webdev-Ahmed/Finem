import { getDB } from '../index';
import { SavingsGoal } from '@/types';

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const db = await getDB();
  return db.getAllAsync<SavingsGoal>('SELECT * FROM savings_goals ORDER BY created_at DESC');
}

export async function getSavingsGoalById(id: number): Promise<SavingsGoal | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<SavingsGoal>('SELECT * FROM savings_goals WHERE id = ?', [id]);
  return row ?? null;
}

export async function insertSavingsGoal(
  name: string,
  icon: string,
  targetAmount: number,
  deadline?: string
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO savings_goals (name, icon, target_amount, current_amount, deadline)
     VALUES (?, ?, ?, 0, ?)`,
    [name, icon, targetAmount, deadline ?? null]
  );
  return result.lastInsertRowId;
}

export async function addContribution(id: number, amount: number): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `UPDATE savings_goals
     SET current_amount = MIN(current_amount + ?, target_amount)
     WHERE id = ?`,
    [amount, id]
  );
}

export async function deleteSavingsGoal(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM savings_goals WHERE id = ?', [id]);
}
