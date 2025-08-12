import { httpService } from '../httpService';
import type { SalaryMonth, SetSalaryInput } from '../../models/salary.model';

const baseURL = import.meta.env.VITE_API_URL;

const setSalary = (payload: SetSalaryInput) => httpService.post<{ affectedMonths: number }>('api/salary/set', payload, { baseURL });

const getCurrentSalary = (month?: string) =>
  httpService.get<SalaryMonth | null>('api/salary/current', {
    baseURL,
    params: month ? { month, _ts: Date.now() } : { _ts: Date.now() },
  });

export const salaryService = { setSalary, getCurrentSalary };
