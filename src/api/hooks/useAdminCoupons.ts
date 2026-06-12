'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  adminCouponApi,
  type CreateCouponPayload,
  type UpdateCouponPayload,
  type UpdateCouponStatusPayload,
  type CouponListParams,
} from '@/api/admin-coupon.api';
import { adminCouponKeys } from '@/api/query-keys';

export function useAdminCoupons(params?: CouponListParams) {
  return useQuery({
    queryKey: adminCouponKeys.list(params),
    queryFn: () => adminCouponApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCoupon(id: string | null) {
  return useQuery({
    queryKey: adminCouponKeys.detail(id!),
    queryFn: () => adminCouponApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCouponPayload) => adminCouponApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.lists() });
      toast.success('Coupon created successfully');
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to create coupon');
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponPayload }) =>
      adminCouponApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.detail(variables.id) });
      toast.success('Coupon updated successfully');
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to update coupon');
    },
  });
}

export function useUpdateCouponStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCouponStatusPayload }) =>
      adminCouponApi.updateStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.lists() });
      queryClient.invalidateQueries({ queryKey: adminCouponKeys.detail(variables.id) });
      toast.success('Coupon status updated');
    },
    onError: (error: { message?: string }) => {
      toast.error(error?.message || 'Failed to update coupon status');
    },
  });
}

export function useCouponStats(id: string | null) {
  return useQuery({
    queryKey: adminCouponKeys.stats(id!),
    queryFn: () => adminCouponApi.getStats(id!),
    enabled: !!id,
  });
}
