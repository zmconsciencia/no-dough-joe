export type BonusIncome = {
  id: string;
  userId: string;
  date: string; // ISO
  amount: number;
  note?: string | null;
  createdAt: string;
};

export type BonusMonthlyTotal = {
  month: string; // ISO first-of-month
  total: number;
};
