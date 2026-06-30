export type TransactionType = 'INCOME' | 'EXPENSE';
export type PeriodType = 'MONTHLY' | 'WEEKLY' | 'ONE_TIME';
export type LoanType = 'LENT' | 'BORROWED';
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  is_default: number;
  created_at: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  category_id: number;
  delegation_period_id: number | null;
  note: string | null;
  date: string;
  created_at: string;
}

export interface Delegation {
  id: number;
  name: string;
  icon: string;
  color: string;
  period_type: PeriodType;
  default_budget: number;
  created_at: string;
}

export interface DelegationPeriod {
  id: number;
  delegation_id: number;
  budgeted_amount: number;
  period_start: string;
  period_end: string | null;
  created_at: string;
}

export interface SavingsGoal {
  id: number;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
}

export interface Loan {
  id: number;
  label: string;
  counterparty: string;
  type: LoanType;
  original_amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface LoanRepayment {
  id: number;
  loan_id: number;
  amount: number;
  date: string;
  note: string | null;
}
