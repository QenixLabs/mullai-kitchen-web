import { apiClient } from "@/api/client";
import { CUSTOMER_ROUTES } from "@/api/routes";
import type { Address, CreateAddressDto } from "@/api/types/customer.types";

export type UpdateAddressDto = Partial<CreateAddressDto>

export const addressApi = {
  create: async (payload: CreateAddressDto): Promise<Address> => {
    const response = await apiClient.post<Address>(
      CUSTOMER_ROUTES.ADDRESSES,
      payload,
    );
    return response.data;
  },
  list: async (): Promise<Address[]> => {
    const response = await apiClient.get<Address[]>(CUSTOMER_ROUTES.ADDRESSES);
    return response.data;
  },
  update: async (id: string, payload: UpdateAddressDto): Promise<Address> => {
    const response = await apiClient.put<Address>(
      `${CUSTOMER_ROUTES.ADDRESSES}/${id}`,
      payload,
    );
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${CUSTOMER_ROUTES.ADDRESSES}/${id}`);
  },
};
