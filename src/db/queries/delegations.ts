import { getDB } from '../index';
import { Delegation, DelegationPeriod, PeriodType } from '@/types';

export interface DelegationWithPeriod extends Delegation {
  period_id: number;
  budgeted_amount: number;
  period_start: string;
  period_end: string | null;
  spent: number;
}

export interface DelegationPeriodWithSpent extends DelegationPeriod {
  spent: number;
}

function isPeriodExpired(periodType: PeriodType, periodStart: string): boolean {
  if (periodType === 'ONE_TIME') return false;
  const start = new Date(periodStart);
  const now = new Date();
  if (periodType === 'MONTHLY') {
    return start.getFullYear() !== now.getFullYear() || start.getMonth() !== now.getMonth();
  }
  // WEEKLY — roll over every 7 days from period_start
  const diffDays = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return diffDays >= 7;
}

// Closes any expired periods and opens fresh ones, inheriting default_budget.
// History stays intact — closed periods retain their original budgeted_amount snapshot.
export async function rolloverDelegations(): Promise<void> {
  const db = await getDB();
  const rows = await db.getAllAsync<{
    id: number;
    period_type: PeriodType;
    default_budget: number;
    period_id: number;
    period_start: string;
  }>(
    `SELECT d.id, d.period_type, d.default_budget, dp.id as period_id, dp.period_start
     FROM delegations d
     JOIN delegation_periods dp ON dp.delegation_id = d.id AND dp.period_end IS NULL`
  );
  const today = new Date().toISOString().split('T')[0];
  for (const row of rows) {
    if (!isPeriodExpired(row.period_type, row.period_start)) continue;
    await db.runAsync('UPDATE delegation_periods SET period_end = ? WHERE id = ?', [
      today,
      row.period_id,
    ]);
    await db.runAsync(
      'INSERT INTO delegation_periods (delegation_id, budgeted_amount, period_start) VALUES (?, ?, ?)',
      [row.id, row.default_budget, today]
    );
  }
}

export async function getActiveDelegations(): Promise<DelegationWithPeriod[]> {
  const db = await getDB();
  return db.getAllAsync<DelegationWithPeriod>(
    `SELECT d.*, dp.id as period_id, dp.budgeted_amount,
       dp.period_start, dp.period_end,
       COALESCE(SUM(t.amount), 0) as spent
     FROM delegations d
     JOIN delegation_periods dp ON dp.delegation_id = d.id AND dp.period_end IS NULL
     LEFT JOIN transactions t ON t.delegation_period_id = dp.id AND t.type = 'EXPENSE'
     GROUP BY dp.id
     ORDER BY d.created_at DESC`
  );
}

export async function getDelegationById(id: number): Promise<Delegation | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<Delegation>('SELECT * FROM delegations WHERE id = ?', [id]);
  return row ?? null;
}

export async function getDelegationHistory(
  delegationId: number
): Promise<DelegationPeriodWithSpent[]> {
  const db = await getDB();
  return db.getAllAsync<DelegationPeriodWithSpent>(
    `SELECT dp.*, COALESCE(SUM(t.amount), 0) as spent
     FROM delegation_periods dp
     LEFT JOIN transactions t ON t.delegation_period_id = dp.id AND t.type = 'EXPENSE'
     WHERE dp.delegation_id = ?
     GROUP BY dp.id
     ORDER BY dp.period_start DESC`,
    [delegationId]
  );
}

export async function insertDelegation(
  name: string,
  icon: string,
  color: string,
  periodType: PeriodType,
  defaultBudget: number
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO delegations (name, icon, color, period_type, default_budget)
     VALUES (?, ?, ?, ?, ?)`,
    [name, icon, color, periodType, defaultBudget]
  );
  const delegationId = result.lastInsertRowId;
  const today = new Date().toISOString().split('T')[0];
  await db.runAsync(
    `INSERT INTO delegation_periods (delegation_id, budgeted_amount, period_start)
     VALUES (?, ?, ?)`,
    [delegationId, defaultBudget, today]
  );
  return delegationId;
}

export async function updateDelegation(
  id: number,
  name: string,
  icon: string,
  color: string,
  defaultBudget: number
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'UPDATE delegations SET name = ?, icon = ?, color = ?, default_budget = ? WHERE id = ?',
    [name, icon, color, defaultBudget, id]
  );
}

export async function deleteDelegation(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM delegations WHERE id = ?', [id]);
}
