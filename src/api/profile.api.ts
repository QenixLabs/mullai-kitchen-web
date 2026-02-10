import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
import type { ApiResponse } from "@/api/types/api-response.types";
import type { UpdateProfileDto } from "@/api/types/customer.types";
import type { IUser } from "@/api/types/user.types";

export const profileApi = {
  update: async (payload: UpdateProfileDto): Promise<IUser> => {
    const response = await apiClient.patch<ApiResponse<IUser>>(CUSTOMER_ROUTES.PROFILE, payload);
    return response.data.data;
  },
};
