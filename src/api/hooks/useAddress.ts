import { useQuery } from "@tanstack/react-query";
import { addressApi } from "@/api/address.api";
import { addressKeys } from "@/api/query-keys";
import type { Address } from "@/api/types/customer.types";

export function useAddressList() {
  return useQuery<Address[]>({
    queryKey: addressKeys.lists(),
    queryFn: addressApi.list,
    staleTime: 60_000,
  });
}
