import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../state/auth.state';

const baseURL = import.meta.env.VITE_API_URL as string;

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

type RetriableConfig = AxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

function resolveQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config && config.headers) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    const url = (original.url ?? '').toLowerCase();
    if (url.includes('/api/auth/login') || url.includes('/api/auth/register')) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (isRefreshing) {
        const newToken = await new Promise<string | null>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        });
        if (newToken) {
          original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        }
        return api(original);
      }

      isRefreshing = true;

      const { data } = await refreshClient.post<{ accessToken: string }>('/api/auth/refresh');
      const newToken = data.accessToken;

      useAuthStore.getState().setToken(newToken);
      resolveQueue(null, newToken);

      original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
      return api(original);
    } catch (err) {
      resolveQueue(err, null);
      useAuthStore.getState().clear();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

async function handle<T>(p: Promise<{ data: T }>): Promise<T> {
  try {
    const res = await p;
    return res.data;
  } catch (err) {
    const ax = err as AxiosError<any>;
    const detail = ax.response?.data?.detail || ax.response?.data?.message;
    const status = ax.response?.status;
    const msg = detail || (status ? `HTTP ${status}` : 'Something went wrong');
    throw new Error(msg);
  }
}

const get = <T>(url: string, config?: AxiosRequestConfig) => handle<T>(api.get(url, config));
const getFile = (url: string, config?: AxiosRequestConfig) => handle<Blob>(api.get(url, { ...config, responseType: 'blob' }));
const post = <T>(url: string, data?: any, config?: AxiosRequestConfig) => handle<T>(api.post(url, data, config));
const postFile = <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
  handle<T>(api.post(url, data, { ...config, headers: { ...(config?.headers || {}), 'Content-Type': 'multipart/form-data' } }));
const put = <T>(url: string, data?: any, config?: AxiosRequestConfig) => handle<T>(api.put(url, data, config));
const patch = <T>(url: string, data?: any, config?: AxiosRequestConfig) => handle<T>(api.patch(url, data, config));
const del = <T>(url: string, data?: any, config?: AxiosRequestConfig) => handle<T>(api.delete(url, { ...config, data }));

export const httpService = { get, getFile, post, postFile, put, patch, delete: del };
