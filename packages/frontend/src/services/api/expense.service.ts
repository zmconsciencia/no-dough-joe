import { httpService } from '../httpService';
import type { Expense, ExpenseWithRelations } from '../../models/expense.model';

const baseURL = import.meta.env.VITE_API_URL;

export type CreateExpenseInput = {
  categoryId: string;
  date: string;
  amount: number;
  description?: string;
  recurringSeriesId?: string;
  payWithMealTicket?: boolean;
};

export type AllocationSummaryRow = { source: 'CASH' | 'MEAL_TICKET'; total: number };
export type CategorySummaryRow = { categoryId: string; name: string; color: string; total: number };

const listByMonth = (monthISO: string) =>
  httpService.get<ExpenseWithRelations[]>('api/expenses', {
    baseURL,
    params: { month: monthISO, _ts: Date.now() },
  });

const createExpense = (payload: CreateExpenseInput) => httpService.post<Expense>('api/expenses', payload, { baseURL });

const softDelete = (id: string) => httpService.delete<{ ok: true }>(`api/expenses/${id}`, { baseURL });

const getAllocationSummary = (monthISO: string) =>
  httpService.get<AllocationSummaryRow[]>('api/expenses/allocation/summary', {
    baseURL,
    params: { month: monthISO, _ts: Date.now() },
  });
const getCategorySummary = (monthISO: string) =>
  httpService.get<CategorySummaryRow[]>('api/expenses/category/summary', {
    baseURL,
    params: { month: monthISO, _ts: Date.now() },
  });
export const expenseService = { listByMonth, createExpense, softDelete, getAllocationSummary, getCategorySummary };
