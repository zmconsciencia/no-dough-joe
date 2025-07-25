import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';


export const api = axios.create({
  baseURL: import.meta.env['VITE_API_URL'],
});

const get = async <T>(url: string, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.get<T>(url, {
      ...config,
      headers: {
        userName: getUsername(),
      },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || err.response?.data?.message || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const getFile = async <T>(url: string, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.get<T>(url, {
      ...config,
      responseType: 'blob',
      headers: {
        userName: getUsername(),
      },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const post = async <T>(url: string, data?: any, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.post<T>(url, data, {
      ...config,
      headers: {
        userName: getUsername(),
      },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || err.response?.data?.message || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const postFile = async <T>(url: string, data?: any, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.post<T>(url, data, {
      ...config,
      headers: {
        userName: getUsername(),
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || err.response?.data?.message || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const put = async <T>(url: string, data?: any, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.put<T>(url, data, {
      ...config,
      headers: {
        userName: getUsername(),
      },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const patch = async <T>(url: string, data?: any, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.patch<T>(url, data, {
      ...config,
      headers: {
        userName: getUsername(),
      },
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const del = async <T>(url: string, data?: any, config?: AxiosRequestConfig<any> | undefined) => {
  try {
    const res = await api.delete<T>(url, {
      ...config,
      headers: {
        userName: getUsername(),
      },
      data,
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const error = (err.response.data?.detail && {
        cause: {
          status: err.response.status,
          detail: err.response.data?.detail,
        },
      }) || {
        cause: err.response.status,
      };
      throw new Error(err.response.data?.detail || 'Something went wrong', error);
    }
    throw new Error('Something went wrong');
  }
};

const getUsername = () => {
  return document.querySelector('span.username')?.textContent?.trim().toLowerCase() || 'cchagas';
};

export const httpService = {
  get,
  getFile,
  post,
  postFile,
  put,
  patch,
  delete: del,
};
