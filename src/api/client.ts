import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

import { AUTH_ROUTES } from "@/api/routes";
import type { ApiResponse } from "@/api/types/api-response.types";
import type { IAuthSession } from "@/api/types/auth.types";
import { getApiBaseUrl } from "@/lib/env";
import {
  clearTokenPair,
  getAccessToken,
  getRefreshToken,
  setTokenPair,
} from "@/lib/storage";

export interface ApiError {
  message: string;
  statusCode: number;
}

// Callback to notify when auth state changes
export type AuthStateCallback = (session: IAuthSession | null) => void;
let authStateCallback: AuthStateCallback | null = null;

export function setAuthStateCallback(callback: AuthStateCallback | null) {
  authStateCallback = callback;
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: {
    indexes: null, // This will serialize as meal_types=A&meal_types=B instead of meal_types[]=A
  },
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _refreshAttempted?: boolean;
};

let refreshAccessTokenPromise: Promise<string | null> | null = null;

const notifyAuthStateChange = (session: IAuthSession | null) => {
  if (authStateCallback) {
    authStateCallback(session);
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshAccessTokenPromise) {
    return refreshAccessTokenPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokenPair();
    notifyAuthStateChange(null);
    return null;
  }

  refreshAccessTokenPromise = axios
    .post<IAuthSession>(
      `${getApiBaseUrl()}${AUTH_ROUTES.REFRESH}`,
      { refresh_token: refreshToken },
      {
        timeout: 15000,
        headers: { "Content-Type": "application/json" },
      },
    )
    .then((response) => {
      const session = response.data;

      if (!session?.access_token || !session?.refresh_token) {
        clearTokenPair();
        notifyAuthStateChange(null);
        return null;
      }

      setTokenPair(session.access_token, session.refresh_token);
      notifyAuthStateChange(session);
      return session.access_token;
    })
    .catch(() => {
      clearTokenPair();
      notifyAuthStateChange(null);
      return null;
    })
    .finally(() => {
      refreshAccessTokenPromise = null;
    });

  return refreshAccessTokenPromise;
};

// Extract error message from various response structures
function getErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;

  // Try different structures:
  // 1. { message, data, success } - error response from backend
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: unknown }).message as string;
  }
  if (error && typeof error === 'object' && 'data' in error && typeof (error as { data: unknown }).data === 'object' && (error as { data: { message?: string } }).data?.message) {
    return (error as { data: { message: string } }).data.message;
  }

  // 2. Direct message on error object
  return undefined;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auth endpoints that should NOT trigger token refresh on 401
// These are "public" auth endpoints where 401 means invalid credentials, not expired token
const PUBLIC_AUTH_ENDPOINTS = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.REGISTER,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
] as const;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // If backend returns { data, success, message }, unwrap the inner data
    // Otherwise, return as-is (backend already returns direct data)
    const responseData = response.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "data" in responseData
    ) {
      return { ...response, data: (responseData as { data: unknown }).data };
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const responseMessage = getErrorMessage(error.response?.data);
    const requestUrl = originalRequest?.url ?? "";

    const isRefreshRequest = requestUrl.includes(AUTH_ROUTES.REFRESH);
    const isPublicAuthEndpoint = PUBLIC_AUTH_ENDPOINTS.some(endpoint =>
      requestUrl.includes(endpoint)
    );

    // Only try to refresh token for 401 on protected endpoints (not login/register/etc)
    const shouldAttemptRefresh =
      error.response?.status === 401 &&
      !isRefreshRequest &&
      !isPublicAuthEndpoint;

    if (originalRequest && !originalRequest._retry && shouldAttemptRefresh) {
      originalRequest._retry = true;
      originalRequest._refreshAttempted = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient.request(originalRequest);
      } else {
        // Refresh failed - clear tokens and redirect to login
        notifyAuthStateChange(null);
        if (typeof window !== "undefined") {
          window.location.href = "/auth/signin";
        }
      }
    }

    const normalizedError: ApiError = {
      message: responseMessage ?? "Something went wrong",
      statusCode: error.response?.status ?? 500,
    };

    return Promise.reject(normalizedError);
  },
);
