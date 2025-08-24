import { httpService } from '../httpService';
import type { RecurringSeries, Recurrence } from '../../models/recurring.model';

const baseURL = import.meta.env.VITE_API_URL;

export type CreateRecurringInput = {
  categoryId: string;
  recurrence: Recurrence;
  amount: number;
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  weekday?: number;
  note?: string;
};

const listRecurring = () =>
  httpService.get<RecurringSeries[]>('api/recurring', { baseURL });

const createRecurring = (payload: CreateRecurringInput) =>
  httpService.post<RecurringSeries>('api/recurring', payload, { baseURL });

const deactivateRecurring = (id: string) =>
  httpService.delete<{ ok: true }>(`api/recurring/${id}`, { baseURL });

export const recurringService = { listRecurring, createRecurring, deactivateRecurring };
