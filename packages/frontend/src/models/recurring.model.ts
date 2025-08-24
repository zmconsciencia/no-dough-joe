export type Recurrence = 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY';

export type RecurringSeries = {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  recurrence: Recurrence;
  dayOfMonth?: number | null;
  weekday?: number | null;
  startDate: string;
  endDate?: string | null;
  note?: string | null;
  isActive: boolean;
  nextRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
