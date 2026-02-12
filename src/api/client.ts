import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { AUTH_ROUTES } from "@/api/routes";
import type { ApiResponse } from "@/api/types/api-response.types";
import type { IAuthSession } from "@/api/types/auth.types";
import { getApiBaseUrl } from "@/lib/env";
import { clearTokenPair, getAccessToken, getRefreshToken, setTokenPair } from "@/lib/storage";

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

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshAccessTokenPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokenPair();
    return null;
  }

  refreshAccessTokenPromise = axios
    .post<ApiResponse<IAuthSession>>(
      `${getApiBaseUrl()}${AUTH_ROUTES.REFRESH}`,
      { refresh_token: refreshToken },
      {
        timeout: 15000,
        headers: { "Content-Type": "application/json" },
      },
    )
    .then((response) => {
      const session = response.data.data;

      if (!session?.access_token || !session?.refresh_token) {
        clearTokenPair();
        return null;
      }

      setTokenPair(session.access_token, session.refresh_token);
      return session.access_token;
    })
    .catch(() => {
      clearTokenPair();
      return null;
    })
    .finally(() => {
      refreshAccessTokenPromise = null;
    });

  return refreshAccessTokenPromise;
};

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<{ message?: string; statusCode?: number }>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const responseMessage = error.response?.data?.message;
    const isRefreshRequest = originalRequest?.url?.includes(AUTH_ROUTES.REFRESH) ?? false;
    const isAuthFailure =
      error.response?.status === 401 &&
      (responseMessage === "Invalid token" || responseMessage === "Token expired");

    if (originalRequest && !originalRequest._retry && !isRefreshRequest && isAuthFailure) {
      originalRequest._retry = true;

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(originalRequest);
      }
    }

    const normalizedError: ApiError = {
      message: responseMessage ?? "Something went wrong",
      statusCode: error.response?.status ?? 500,
    };

    return Promise.reject(normalizedError);
  },
);
