import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { corporateProfileApi } from '@/api/corporate-profile.api';
import { corporateProfileKeys } from '@/api/query-keys';
import type {
  ICorporateProfile,
  AddDeliveryAddressDto,
  UpdateCorporateProfileDto,
  CreateCorporateProfileDto,
} from '@/api/types/corporate.types';

export function useCorporateProfile() {
  return useQuery<ICorporateProfile | null>({
    queryKey: corporateProfileKeys.profile(),
    queryFn: () => corporateProfileApi.get(),
  });
}

export function useCreateCorporateProfile() {
  const queryClient = useQueryClient();
  return useMutation<ICorporateProfile, Error, CreateCorporateProfileDto>({
    mutationFn: (payload: CreateCorporateProfileDto) => corporateProfileApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateProfileKeys.profile() });
    },
  });
}

export function useUpdateCorporateProfile() {
  const queryClient = useQueryClient();
  return useMutation<ICorporateProfile, Error, UpdateCorporateProfileDto>({
    mutationFn: (payload: UpdateCorporateProfileDto) => corporateProfileApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateProfileKeys.profile() });
    },
  });
}

export function useAddDeliveryAddress() {
  const queryClient = useQueryClient();
  return useMutation<ICorporateProfile, Error, AddDeliveryAddressDto>({
    mutationFn: (payload: AddDeliveryAddressDto) => corporateProfileApi.addDeliveryAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateProfileKeys.profile() });
    },
  });
}

export function useUpdateDeliveryAddress() {
  const queryClient = useQueryClient();
  return useMutation<ICorporateProfile, Error, { index: number; data: Partial<AddDeliveryAddressDto> }>({
    mutationFn: ({ index, data }) => corporateProfileApi.updateDeliveryAddress(index, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateProfileKeys.profile() });
    },
  });
}

export function useDeleteDeliveryAddress() {
  const queryClient = useQueryClient();
  return useMutation<ICorporateProfile, Error, number>({
    mutationFn: (index: number) => corporateProfileApi.deleteDeliveryAddress(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corporateProfileKeys.profile() });
    },
  });
}
