import { apiClient } from "@/api/client";
import { USER_ROUTES } from "@/api/routes";
import type { IUser } from "@/api/types/user.types";

export const userApi = {
  me: async (): Promise<IUser> => {
    const response = await apiClient.get<IUser>(USER_ROUTES.ME);
    return response.data;
  },
};
