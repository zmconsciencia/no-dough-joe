import { httpService } from '../httpService';
import type { Category } from '../../models/category.model';

const baseURL = import.meta.env.VITE_API_URL;

export type CreateCategoryInput = {
  name: string;
  color?: string;
  eligibleForMealTicket?: boolean;
};

const listMyCategories = () =>
  httpService.get<Category[]>('api/categories', { baseURL, params: { _ts: Date.now() } });

const createCategory = (payload: CreateCategoryInput) =>
  httpService.post<Category>('api/categories', payload, { baseURL });

export const categoryService = { listMyCategories, createCategory };
