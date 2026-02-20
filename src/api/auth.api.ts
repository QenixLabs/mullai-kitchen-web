import { apiClient } from "@/api/client";
import { AUTH_ROUTES } from "@/api/routes";
import type {
  IAuthSession,
  IForgotPasswordRequest,
  ILoginRequest,
  IRefreshTokenRequest,
  IRegisterRequest,
  IResetPasswordRequest,
} from "@/api/types/auth.types";

export const authApi = {
  login: async (payload: ILoginRequest): Promise<IAuthSession> => {
    const response = await apiClient.post<IAuthSession>(AUTH_ROUTES.LOGIN, payload);
    return response.data;
  },
  register: async (payload: IRegisterRequest): Promise<IAuthSession> => {
    const response = await apiClient.post<IAuthSession>(AUTH_ROUTES.REGISTER, payload);
    return response.data;
  },
  refreshToken: async (payload: IRefreshTokenRequest): Promise<IAuthSession> => {
    const response = await apiClient.post<IAuthSession>(AUTH_ROUTES.REFRESH, payload);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post(AUTH_ROUTES.LOGOUT);
  },
  forgotPassword: async (payload: IForgotPasswordRequest): Promise<void> => {
    await apiClient.post(AUTH_ROUTES.FORGOT_PASSWORD, payload);
  },
  resetPassword: async (payload: IResetPasswordRequest): Promise<void> => {
    await apiClient.post(AUTH_ROUTES.RESET_PASSWORD, payload);
  },
};
