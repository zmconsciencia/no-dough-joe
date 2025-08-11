export type MealTicketTopUp = {
  id: string;
  userId: string;
  date: string; // ISO first-of-month
  amount: number;
  note?: string | null;
  createdAt: string;
};

export type MealTicketMonthlyTotal = {
  month: string; // ISO first-of-month
  total: number;
};
