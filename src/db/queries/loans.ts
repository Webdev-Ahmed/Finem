import { getDB } from '../index';
import { Loan, LoanRepayment, LoanType } from '@/types';

export interface LoanWithBalance extends Loan {
  total_repaid: number;
  remaining: number;
}

export async function getLoans(): Promise<LoanWithBalance[]> {
  const db = await getDB();
  return db.getAllAsync<LoanWithBalance>(
    `SELECT l.*,
       COALESCE(SUM(r.amount), 0) as total_repaid,
       l.original_amount - COALESCE(SUM(r.amount), 0) as remaining
     FROM loans l
     LEFT JOIN loan_repayments r ON r.loan_id = l.id
     GROUP BY l.id
     ORDER BY l.date DESC`
  );
}

export async function getLoanById(id: number): Promise<LoanWithBalance | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<LoanWithBalance>(
    `SELECT l.*,
       COALESCE(SUM(r.amount), 0) as total_repaid,
       l.original_amount - COALESCE(SUM(r.amount), 0) as remaining
     FROM loans l
     LEFT JOIN loan_repayments r ON r.loan_id = l.id
     WHERE l.id = ?
     GROUP BY l.id`,
    [id]
  );
  return row ?? null;
}

export async function getRepayments(loanId: number): Promise<LoanRepayment[]> {
  const db = await getDB();
  return db.getAllAsync<LoanRepayment>(
    'SELECT * FROM loan_repayments WHERE loan_id = ? ORDER BY date DESC',
    [loanId]
  );
}

export async function insertLoan(
  label: string,
  counterparty: string,
  type: LoanType,
  originalAmount: number,
  date: string,
  note?: string
): Promise<number> {
  const db = await getDB();
  const result = await db.runAsync(
    `INSERT INTO loans (label, counterparty, type, original_amount, date, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [label, counterparty, type, originalAmount, date, note ?? null]
  );
  return result.lastInsertRowId;
}

export async function addRepayment(
  loanId: number,
  amount: number,
  date: string,
  note?: string
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO loan_repayments (loan_id, amount, date, note) VALUES (?, ?, ?, ?)',
    [loanId, amount, date, note ?? null]
  );
}

export async function deleteLoan(id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM loans WHERE id = ?', [id]);
}

export async function getLoanTotals(): Promise<{ lent: number; borrowed: number }> {
  const db = await getDB();
  const row = await db.getFirstAsync<{ lent: number; borrowed: number }>(
    `SELECT
       COALESCE(SUM(CASE WHEN l.type='LENT'     THEN l.original_amount - COALESCE(r.repaid, 0) ELSE 0 END), 0) as lent,
       COALESCE(SUM(CASE WHEN l.type='BORROWED' THEN l.original_amount - COALESCE(r.repaid, 0) ELSE 0 END), 0) as borrowed
     FROM loans l
     LEFT JOIN (
       SELECT loan_id, SUM(amount) as repaid FROM loan_repayments GROUP BY loan_id
     ) r ON r.loan_id = l.id`
  );
  return row ?? { lent: 0, borrowed: 0 };
}
