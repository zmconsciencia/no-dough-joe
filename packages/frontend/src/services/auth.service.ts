import { httpService } from './httpService';
import { useAuthStore } from '../state/auth.state';

type LoginResponse = { accessToken: string };
type RegisterResponse = { id: string; email: string; createdAt: string };

const register = async (email: string, password: string) => {
  return httpService.post<RegisterResponse>('/api/auth/register', { email, password });
};

const login = async (email: string, password: string) => {
  const data = await httpService.post<LoginResponse>('/api/auth/login', { email, password });
  useAuthStore.getState().setToken(data.accessToken);
  return data;
};

const refresh = async () => {
  const data = await httpService.post<LoginResponse>('/api/auth/refresh');
  useAuthStore.getState().setToken(data.accessToken);
  return data;
};

const logout = async () => {
  await httpService.post<{ ok: true }>('/api/auth/logout');
  useAuthStore.getState().clear();
};

export const authService = { register, login, refresh, logout };
