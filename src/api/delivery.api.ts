import { apiClient } from '@/api/client';
import type {
  DeliveryOrderType,
  DeliveryProfile,
  DeliveryRouteDetail,
  DeliveryRouteSummary,
  ListMyRoutesParams,
  UpdateAvailabilityBody,
  UpdateStopBody,
  UpdateStopResponse,
} from '@/api/types/delivery.types';

/**
 * Delivery-partner API surface — wrappers around the six endpoints in
 * `server/src/modules/delivery/controller/delivery.controller.ts`.
 *
 * Auth + token refresh is handled centrally by `apiClient` (see
 * `src/api/client.ts`); the response interceptor unwraps the standard
 * `{ data, success, message }` envelope, so each call resolves directly to
 * the typed payload.
 */
export const deliveryApi = {
  /** GET /delivery/routes — partner's routes for a given day / status. */
  listMyRoutes: async (
    params?: ListMyRoutesParams,
  ): Promise<DeliveryRouteSummary[]> => {
    const response = await apiClient.get<DeliveryRouteSummary[]>(
      '/delivery/routes',
      { params },
    );
    return response.data;
  },

  /** GET /delivery/routes/:id — full route detail with grouped stops. */
  getRouteDetail: async (routeId: string): Promise<DeliveryRouteDetail> => {
    const response = await apiClient.get<DeliveryRouteDetail>(
      `/delivery/routes/${routeId}`,
    );
    return response.data;
  },

  /** POST /delivery/routes/:id/start — flip route to IN_PROGRESS and cascade
   *  linked orders to OUT_FOR_DELIVERY; returns the refreshed detail. */
  startRoute: async (routeId: string): Promise<DeliveryRouteDetail> => {
    const response = await apiClient.post<DeliveryRouteDetail>(
      `/delivery/routes/${routeId}/start`,
      {},
    );
    return response.data;
  },

  /** PUT /delivery/routes/:id/stops/:orderType/:orderId/status — mark a single
   *  order delivered or missed. */
  markStop: async (
    routeId: string,
    orderType: DeliveryOrderType,
    orderId: string,
    body: UpdateStopBody,
  ): Promise<UpdateStopResponse> => {
    const response = await apiClient.put<UpdateStopResponse>(
      `/delivery/routes/${routeId}/stops/${orderType}/${orderId}/status`,
      body,
    );
    return response.data;
  },

  /** POST /delivery/routes/:id/complete — flip route to COMPLETED and reset
   *  the partner's availability. Returns the refreshed detail. */
  completeRoute: async (routeId: string): Promise<DeliveryRouteDetail> => {
    const response = await apiClient.post<DeliveryRouteDetail>(
      `/delivery/routes/${routeId}/complete`,
      {},
    );
    return response.data;
  },

  /** GET /delivery/me — partner profile snapshot. */
  getMe: async (): Promise<DeliveryProfile> => {
    const response = await apiClient.get<DeliveryProfile>('/delivery/me');
    return response.data;
  },

  /** PUT /delivery/me/availability — toggle availability between
   *  Available and Inactive (server rejects when a route is in progress). */
  updateAvailability: async (
    body: UpdateAvailabilityBody,
  ): Promise<DeliveryProfile> => {
    const response = await apiClient.put<DeliveryProfile>(
      '/delivery/me/availability',
      body,
    );
    return response.data;
  },
};
