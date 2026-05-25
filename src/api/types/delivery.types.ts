/**
 * Shared types for the Delivery Partner module.
 *
 * Mirrors the response shapes returned by the NestJS DeliveryService /
 * DeliveryController in `server/src/modules/delivery/`. Date fields are
 * serialised to ISO strings over the wire by the default JSON serialiser,
 * so we type them as `string` here even though the server treats them as
 * `Date` instances internally.
 */

// ---------- Enums (string-literal unions matching server enums) -----------

/** Mirrors `RouteStatus` enum on the server. */
export type DeliveryRouteStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

/** Order kind discriminator used by the stop-update endpoint. */
export type DeliveryOrderType = 'daily' | 'addon' | 'corporate';

/** Stop-level rollup status returned by `getRouteDetail`. */
export type DeliveryStopStatus =
  | 'pending'
  | 'mixed'
  | 'all_delivered'
  | 'all_missed';

/** Action sent to the stop-update endpoint body. */
export type DeliveryStopAction = 'delivered' | 'missed';

/**
 * Mirrors `PartnerStatus` (a.k.a. `DeliveryPartnerStatus`) on the server.
 * The API may return an empty string for users that have never been
 * initialised, so callers should be defensive.
 */
export type DeliveryAvailability = 'Available' | 'On Delivery' | 'Inactive';

// ---------- Route summaries / details -------------------------------------

/** Item shape returned by `GET /delivery/routes`. */
export interface DeliveryRouteSummary {
  id: string;
  name: string;
  /** ISO date-time string (server `order_generation_date`). */
  delivery_date?: string;
  status: DeliveryRouteStatus;
  order_count: number;
  completed_stops: number;
  /** ISO date-time string when set. */
  estimated_start_time?: string;
  /** Meal type for this route (e.g. breakfast, lunch, dinner). */
  meal_type?: string;
  route_type?: 'individual' | 'corporate';
  company_name?: string;
  total_meals?: number;
}

/** Order row inside a stop, returned by `GET /delivery/routes/:id`. */
export interface DeliveryOrderLine {
  /** Display id; for daily/corporate this is the document `_id`, for addon
   *  this is the human-readable `order_id`. */
  order_id: string;
  type: DeliveryOrderType;
  customer_name: string;
  meal_type?: string;
  company_name?: string;
  items_summary: string;
  /** Underlying order status string (LOCKED / OUT_FOR_DELIVERY / DELIVERED /
   *  MISSED / CANCELLED / PREPARING / etc.) — case may differ across order
   *  types, so consumers should compare with `.toUpperCase()`. */
  status: string;
}

/** Stop returned by `GET /delivery/routes/:id`. */
export interface DeliveryStop {
  sequence: number;
  address_text: string;
  lat: number;
  lng: number;
  google_maps_url: string;
  status: DeliveryStopStatus;
  orders: DeliveryOrderLine[];
}

/** Full payload returned by `GET /delivery/routes/:id`,
 *  `POST /delivery/routes/:id/start`, and `POST /delivery/routes/:id/complete`. */
export interface DeliveryRouteDetail {
  id: string;
  name: string;
  status: DeliveryRouteStatus;
  /** ISO date-time string. */
  delivery_date?: string;
  completed_stops: number;
  order_count: number;
  /** ISO date-time string. */
  actual_start_time?: string;
  /** ISO date-time string. */
  started_at?: string;
  /** ISO date-time string. */
  completed_at?: string;
  stops: DeliveryStop[];
}

// ---------- Stop update ---------------------------------------------------

/** Request body for `PUT /delivery/routes/:id/stops/:orderType/:orderId/status`. */
export interface UpdateStopBody {
  status: DeliveryStopAction;
  notes?: string;
  /** Required by the server when `status === 'missed'`. */
  failure_reason?: string;
  delivery_proof_url?: string;
}

/** Response shape returned by the mark-stop endpoint. */
export interface UpdateStopResponse {
  id: string;
  type: DeliveryOrderType;
  status: string;
  delivered_by?: string;
  /** ISO date-time string. */
  delivery_time?: string;
  failure_reason?: string;
  delivery_proof_url?: string;
}

// ---------- Profile + availability ---------------------------------------

/** Payload returned by `GET /delivery/me` and `PUT /delivery/me/availability`. */
export interface DeliveryProfile {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  /** May be the empty string for accounts that have never had a value set. */
  availability_status: DeliveryAvailability | '';
  current_route_id: string | null;
  assigned_outlet_id: string;
  assigned_outlet_name?: string;
  vehicle_type?: string;
  vehicle_number?: string;
}

/** Body for `PUT /delivery/me/availability`. The server rejects `'On Delivery'`
 *  here — it is set automatically by `startRoute` and cleared by
 *  `completeRoute`. */
export interface UpdateAvailabilityBody {
  status: 'Available' | 'Inactive';
}

// ---------- Query params --------------------------------------------------

/** Optional filters for `GET /delivery/routes`. */
export interface ListMyRoutesParams {
  /** YYYY-MM-DD; server defaults to today when omitted. */
  date?: string;
  /** Restrict to routes in a specific status. */
  status?: DeliveryRouteStatus;
  /** Restrict to routes for a specific meal type. */
  meal_type?: string;
}
