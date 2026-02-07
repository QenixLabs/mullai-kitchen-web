import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { getApiBaseUrl } from "@/lib/env";
import { getAccessToken } from "@/lib/storage";

export interface ApiError {
  message: string;
  statusCode: number;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    const normalizedError: ApiError = {
      message: error.response?.data?.message ?? "Something went wrong",
      statusCode: error.response?.status ?? 500,
    };

    return Promise.reject(normalizedError);
  },
);
