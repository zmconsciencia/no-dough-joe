import { httpService } from '../httpService';
import type { BonusIncome, BonusMonthlyTotal } from '../../models/bonus.model';

const baseURL = import.meta.env.VITE_API_URL;

export type CreateBonusInput = {
  date: string; // ISO date
  amount: number; // >= 0
  note?: string;
};

const createBonus = (payload: CreateBonusInput) => httpService.post<BonusIncome>('api/bonus', payload, { baseURL });

const getBonusSummary = (from: string, months: number) =>
  httpService.get<BonusMonthlyTotal[]>('api/bonus/summary', {
    baseURL,
    params: { from, months },
  });

export const bonusService = { createBonus, getBonusSummary };
