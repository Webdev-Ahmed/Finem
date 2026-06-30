import { getDB } from '../index';
import { TransactionType } from '@/types';

export interface MonthlyBar {
  label: string;
  yearMonth: string;
  income: number;
  expense: number;
}

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  total: number;
}

export async function getLast6MonthsData(): Promise<MonthlyBar[]> {
  const db = await getDB();

  // Build last 6 months list as a map for easy lookup
  const months: MonthlyBar[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({
      yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('default', { month: 'short' }),
      income: 0,
      expense: 0,
    });
  }

  const startDate = months[0].yearMonth + '-01';
  const rows = await db.getAllAsync<{
    yearMonth: string;
    income: number;
    expense: number;
  }>(
    `SELECT
       strftime('%Y-%m', date) as yearMonth,
       COALESCE(SUM(CASE WHEN type='INCOME'  THEN amount ELSE 0 END), 0) as income,
       COALESCE(SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END), 0) as expense
     FROM transactions
     WHERE date >= ?
     GROUP BY yearMonth
     ORDER BY yearMonth ASC`,
    [startDate]
  );

  // Merge query results into the pre-built months array
  rows.forEach((row) => {
    const m = months.find((x) => x.yearMonth === row.yearMonth);
    if (m) {
      m.income = row.income;
      m.expense = row.expense;
    }
  });

  return months;
}

export async function getCategoryBreakdown(
  startDate: string,
  endDate: string,
  type: TransactionType = 'EXPENSE'
): Promise<CategoryBreakdown[]> {
  const db = await getDB();
  return db.getAllAsync<CategoryBreakdown>(
    `SELECT
       c.id   as category_id,
       c.name as category_name,
       c.icon as category_icon,
       c.color as category_color,
       COALESCE(SUM(t.amount), 0) as total
     FROM categories c
     LEFT JOIN transactions t
       ON t.category_id = c.id
       AND t.type = ?
       AND t.date >= ?
       AND t.date <= ?
     WHERE c.type = ?
     GROUP BY c.id
     HAVING total > 0
     ORDER BY total DESC`,
    [type, startDate, endDate, type]
  );
}
