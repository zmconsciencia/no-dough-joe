import { httpService } from '../httpService';
import type { MealTicketTopUp, MealTicketMonthlyTotal } from '../../models/mealticket.model';

const baseURL = import.meta.env.VITE_API_URL;

export type CreateTopUpInput = {
  month: string;
  amount: number;
  note?: string;
};

const createTopUp = (payload: CreateTopUpInput) => httpService.post<MealTicketTopUp>('api/mealticket', payload, { baseURL });

const getTopUpSummary = (from: string, months: number) =>
  httpService.get<MealTicketMonthlyTotal[]>('api/mealticket/summary', {
    baseURL,
    params: { from, months },
  });

export const mealTicketService = { createTopUp, getTopUpSummary };
