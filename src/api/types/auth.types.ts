import type { IUser } from "@/api/types/user.types";

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email?: string;
  phone: string;
  password: string;
  signup_token: string;
  acceptTerms: boolean;
}

export interface IRefreshTokenRequest {
  refresh_token: string;
}

export interface IForgotPasswordRequest {
  phone: string;
}

export interface IVerifyResetOtpRequest {
  phone: string;
  otp: string;
}

export interface IVerifyResetOtpResponse {
  reset_token: string;
}

export interface IResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ISendSignupOtpRequest {
  phone: string;
}

export interface IVerifySignupOtpRequest {
  phone: string;
  otp: string;
}

export interface IVerifySignupOtpResponse {
  signup_token: string;
}

export interface IChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ICorporateRegisterRequest {
  email: string;
  company_name: string;
  password: string;
  acceptTerms: boolean;
}

export interface IAuthSession {
  access_token: string;
  refresh_token: string;
  user: IUser;
}
