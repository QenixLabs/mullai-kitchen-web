import { apiClient } from "@/api/client";
import { CORPORATE_ROUTES } from "@/api/routes";
import type {
  ICorporateProfile,
  AddDeliveryAddressDto,
  UpdateCorporateProfileDto,
  CreateCorporateProfileDto,
} from "@/api/types/corporate.types";

export const corporateProfileApi = {
  get: async (): Promise<ICorporateProfile | null> => {
    const response = await apiClient.get<ICorporateProfile>(CORPORATE_ROUTES.PROFILE);
    return response.data;
  },
  create: async (data: CreateCorporateProfileDto): Promise<ICorporateProfile> => {
    const response = await apiClient.post<ICorporateProfile>(CORPORATE_ROUTES.PROFILE, data);
    return response.data;
  },
  update: async (data: UpdateCorporateProfileDto): Promise<ICorporateProfile> => {
    const response = await apiClient.patch<ICorporateProfile>(CORPORATE_ROUTES.PROFILE, data);
    return response.data;
  },
  addDeliveryAddress: async (data: AddDeliveryAddressDto): Promise<ICorporateProfile> => {
    const response = await apiClient.post<ICorporateProfile>(CORPORATE_ROUTES.DELIVERY_ADDRESSES, data);
    return response.data;
  },
  updateDeliveryAddress: async (index: number, data: Partial<AddDeliveryAddressDto>): Promise<ICorporateProfile> => {
    const response = await apiClient.patch<ICorporateProfile>(CORPORATE_ROUTES.DELIVERY_ADDRESS(index), data);
    return response.data;
  },
  deleteDeliveryAddress: async (index: number): Promise<ICorporateProfile> => {
    const response = await apiClient.delete<ICorporateProfile>(CORPORATE_ROUTES.DELIVERY_ADDRESS(index));
    return response.data;
  },
};
