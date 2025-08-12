import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { emitUnauthorized } from './events';

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      withCredentials: true,
    });

    // Load access token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
    }

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers = config.headers || {};
          (config.headers as any).Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const response = await axios.post('/api/auth/refresh', undefined, { withCredentials: true });
            const { accessToken } = response.data.data;
            this.setAccessToken(accessToken);

            // Retry the original request
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(original);
          } catch (refreshError) {
            this.clearAccessToken();
            emitUnauthorized();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  setAccessToken(accessToken: string) {
    this.accessToken = accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
    }
  }

  clearAccessToken() {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  getTokens() {
    return {
      accessToken: this.accessToken,
    };
  }

  async get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config);
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    try {
      const response = await this.client.post(url, data, config);
      return response;
    } catch (error) {
      console.error('ApiClient: POST request failed:', error);
      throw error;
    }
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config);
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();