import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
import type { ApiResponse } from "@/api/types/api-response.types";
import type { Address, CreateAddressDto } from "@/api/types/customer.types";

export const addressApi = {
  create: async (payload: CreateAddressDto): Promise<Address> => {
    const response = await apiClient.post<ApiResponse<Address>>(CUSTOMER_ROUTES.ADDRESSES, payload);
    return response.data.data;
  },
  list: async (): Promise<Address[]> => {
    const response = await apiClient.get<ApiResponse<Address[]>>(CUSTOMER_ROUTES.ADDRESSES);
    return response.data.data;
  },
};
