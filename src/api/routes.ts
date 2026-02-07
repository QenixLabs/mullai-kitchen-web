export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
} as const;

export const USER_ROUTES = {
  ME: "/users/profile/me",
} as const;
