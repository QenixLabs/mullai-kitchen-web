import type { IUser } from "@/api/types/user.types";

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface IRefreshTokenRequest {
  refresh_token: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface IAuthSession {
  access_token: string;
  refresh_token: string;
  user: IUser;
}
