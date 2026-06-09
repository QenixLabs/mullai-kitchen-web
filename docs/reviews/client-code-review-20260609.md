# Client Code Review Report

| | |
|---|---|
| **Branch** | `feature/corporate-seperate-routes` |
| **Base** | `74c59dd54b79f4f39e88d8ea1aa51be9a206e7b0` |
| **Head** | `8a3a56d7fbd3ff0422ca46815cbfea69be53322b` |
| **Files Changed** | 55 |
| **Reviewers** | 9 (correctness, testing, maintainability, api-contract, adversarial, julik-frontend-races, agent-native, project-standards, learnings) |

---

## Coverage

- **Add-on management UI** — CRUD pages, API hooks, types, query keys
- **Dashboard analytics** — expense/revenue widgets, report charts, KPI cards
- **Corporate order/invoice management** — tables, payment links, service charges
- **Kitchen & inventory** — consumption projections, ingredient usage
- **API hooks and types** — mutations, query factories, payload contracts
- **Recipe linkage** — recipe form, ingredient selector

---

## Critical Findings (P0) — Must Fix Before Merge

| ID | Category | File | Finding |
|---|---|---|---|
| ADV-003 | XSS | `app/(admin)/admin/menu/add-ons/create/page.tsx`, `edit/page.tsx`, `src/components/admin/corporate/CompanyDetailTabs.tsx` | No XSS sanitization on add-on description or any text input. No DOMPurify or escapeHtml exists in src/ or app/. Stored XSS possible via `<script>` in description fields. |
| COR-003 | Data Loss | `src/components/admin/recipes/RecipeForm.tsx:201` | `ingredient_id` is overwritten with empty string on edit mode initialization. Every recipe edit permanently severs the ingredient linkage, breaking inventory tracking and cost calculations. |
| TG-Critical | Test Infrastructure | Entire branch | Zero test files exist. ~354KB of new code across 55 files with no test coverage. |

---

## High Findings (P1) — Should Fix

| ID | Category | File | Finding |
|---|---|---|---|
| ADV-001 | Form Validation | `app/(admin)/admin/menu/add-ons/create/page.tsx`, `edit/page.tsx` | Add-on price uses `z.number().nonnegative()` with no `.max()` ceiling. Accepts `1e308` or `999999999999`. `toLocaleString()` on extreme values can break UI layout. |
| ADV-002 | Form Validation | `app/(admin)/admin/menu/add-ons/create/page.tsx`, `edit/page.tsx` | `max_quantity_per_order` and `preparation_time` use `z.number().nonnegative().optional()` with no upper bounds. Values like `1e9` accepted. |
| ADV-004 | API Resilience | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | `getChange` divides by `previous` without NaN/Infinity guards. If API returns `total_revenue: Infinity` or `NaN`, profit margin calculation produces NaN/Infinity passed to SVG `strokeDashoffset`, causing rendering errors and white screen. |
| ADV-005 | API Resilience | `src/components/admin/reports/ReportCharts.tsx` | Chart components use `Math.max(...values, 1)` and `Math.min(...data)` without empty-array checks. Empty array to `Math.min(...[])` returns `Infinity`, causing `range = NaN` and Recharts domain errors. |
| ADV-007 | Permissions | `app/(admin)/admin/layout.tsx`, `app/(corporate)/layout.tsx` | All admin/corporate permission checks are client-side only (`useEffect` + `router.replace`). No Next.js middleware, no server-side session validation. Disabling JavaScript exposes admin page content in HTML source. |
| ADV-011 | Memory Leak | `src/components/delivery/DeliveryProofDialog.tsx:39` | `URL.createObjectURL(file)` called on every file selection, but `URL.revokeObjectURL` is never called. Repeated photo selections leak blob URLs and accumulate memory. |
| ADV-013 | Error Boundaries | `app/(admin)/admin/layout.tsx`, `app/(corporate)/layout.tsx` | No custom ErrorBoundary components exist. A single Recharts crash or undefined property access in any admin page unmounts the entire admin layout — white screen of death. |
| COR-001 | Cache Invalidation | `src/api/hooks/useAdminCorporate.ts:141` | `useGeneratePaymentLink` invalidates `adminCorporateKeys.companyInvoices(id)` where `id` is the **invoice ID**, but `companyInvoices` expects a **company ID**. Cache is never invalidated; stale invoice data persists after payment link generation. |
| COR-002 | State Management | `src/components/admin/corporate/CompanyDetailTabs.tsx:575` | `ServiceChargeSettings` initializes `enabled` and `percentage` from `company` prop via `useState`, but never re-syncs when `company` prop changes. Other admins' changes or refetches leave stale toggle state. |
| F1 | Race Condition | `app/(admin)/admin/menu/add-ons/page.tsx:62` | Debounced search uses `useRef` for timeout but does not cancel in-flight API requests. Rapid typing can cause stale results to overwrite newer ones if responses arrive out of order. |
| F2 | Race Condition | `src/components/admin/recipes/RecipeForm.tsx:74` | `IngredientSelector` debounced search has same pattern: `setTimeout` without request cancellation. Popover open/close can trigger orphaned fetches. |
| F3 | Stale Closure | `app/(admin)/admin/menu/add-ons/[id]/edit/page.tsx:79` | `useForm` uses `values` prop tied to async query data. When `addOn` data arrives, `react-hook-form` resets the entire form. If user already typed changes before data loads, their input is silently overwritten. |
| AC-004 | Unused Code | `src/api/routes.ts:148` | `ADMIN_ADDON_ROUTES` defined but never used. `admin-addon.api.ts` uses inline `const BASE = '/menu/add-ons'`. Maintenance risk if endpoint path changes. |
| AC-005 | Type Consistency | `src/api/query-keys.ts:280` | `adminAddOnKeys.list` params typed as `unknown` instead of `QueryAddOnItemsParams`. Loses type safety for query key serialization. |
| PS-High | Interceptor | `src/api/admin-addon.api.ts` | Response interceptor unwraps `{ data, success, message }` envelope. Callers must NOT check `.success` on the result. Add a comment reminding future devs. |

---

## Medium Findings (P2) — Fix If Straightforward

| ID | Category | File | Finding |
|---|---|---|---|
| ADV-006 | Permissions | `src/hooks/useHasPermission.ts:31` | `user?.role === 'superAdmin'` uses raw string literal. Backend enum change silently breaks check. Use `UserRole.SuperAdmin` constant. |
| ADV-008 | Race Condition | `app/(corporate)/corporate/create-order/page.tsx` | Submit button disabled by `isSubmitting`, but React state updates are async. Rapid double-click can fire `handleSubmit(onSubmit)` twice before `isPending` flips. Duplicate orders possible. |
| ADV-009 | Race Condition | `app/(corporate)/corporate/create-order/page.tsx` | Serviceability `useEffect` captures `pincodeValue` in closure, fires 400ms debounced API call. Multiple in-flight requests can return out of order and overwrite correct serviceability state. |
| ADV-010 | API Resilience | `src/api/client.ts` | Response interceptor checks `'data' in responseData` only. If backend returns a plain object with a `data` key (e.g. file metadata), interceptor incorrectly unwraps it. Should check full envelope shape (`success !== undefined && 'data' in responseData`). |
| ADV-012 | State Drift | `src/components/admin/corporate/CompanyDetailTabs.tsx` | `ServiceChargeSettings` local state never syncs when parent re-renders with updated company data. Toggle sends API immediately without validating percentage; if API fails, local state stays toggled while server is unchanged. |
| ADV-014 | API Resilience | `src/components/admin/kitchen/KitchenIngredientConsumption.tsx:96` | `{proj.ingredient_name}` renders directly without fallback. Null/undefined name produces blank table cell. |
| ADV-015 | API Resilience | `src/components/admin/dashboard/DashboardIngredientUsage.tsx:92` | `item.quantityUsed.toLocaleString('en-IN')` assumes `quantityUsed` is always a number. Backend omission or null throws runtime exception. |
| ADV-016 | Performance | `src/components/admin/reports/ReportCharts.tsx` | Every chart component recalculates `values`, `avg`, `maxVal`, arrays on every parent render. For 365 data points, causes unnecessary CPU usage and Recharts re-renders. Wrap in `useMemo`. |
| ADV-017 | Race Condition | `src/components/admin/corporate/CompanyDetailTabs.tsx` | Payment link generation button `disabled` state set asynchronously. Rapid double-click can fire `mutate` twice before React updates disabled prop. Multiple payment links for same invoice. |
| ADV-018 | API Resilience | `app/(corporate)/corporate/create-order/page.tsx` | When `pricingResponse` is undefined (loading or error), code provides zeroed defaults (`veg_price_per_meal: 0`, `grand_total: 0`). User sees ₹0 totals and may submit order with incorrect pricing. |
| ADV-019 | Form Validation | `app/(admin)/admin/menu/add-ons/create/page.tsx`, `edit/page.tsx` | `name` field uses `z.string().min(1)` with no `.max()`. Names of 10,000 characters accepted — UI breakage and database bloat risk. |
| ADV-020 | API Resilience | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | `getChange` returns `{ pct: 0, direction: 'flat' }` when `previous === 0`. If `previous` is negative (e.g. loss), percentage calculation produces misleading positive growth signal. |
| COR-004 | Type Safety | `src/api/hooks/useAdminAddons.ts:24` | `useAddOn` accepts `id: string | null` but uses `id!` non-null assertion in `queryKey` and `queryFn`. `enabled: !!id` prevents execution, but assertion suppresses compiler checks. |
| COR-005 | UI Behavior | `src/components/admin/corporate/CompanyDetailTabs.tsx:590` | `handleToggle` auto-saves to server when **disabling** service charge (sends `false` immediately), but does NOT auto-save when **enabling**. Admin must click Save. Single misclick disables service charge for all company orders without confirmation. |
| COR-006 | Performance | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | Always fires second `useRevenueAnalytics` query for previous period regardless of whether comparison data is displayed. Doubles API load unconditionally. |
| COR-007 | Data Integrity | `app/(admin)/admin/menu/add-ons/page.tsx:89` | Stats calculation uses `data?.data` (current page rows) for `available` and `withRecipe` counts, but `data?.total` for `totalAddOns`. KPIs are misleading on any page except page 1. |
| COR-008 | Form Validation | `app/(admin)/admin/menu/add-ons/create/page.tsx` | `recipe_id` field uses Select with `'__none__'` sentinel. When selected, `field.onChange` receives `''`. `onSubmit` strips it via `data.recipe_id \|\| undefined`, but this is fragile — if stripping logic removed, empty strings sent to API. |
| COR-009 | Form Validation | `app/(admin)/admin/menu/add-ons/create/page.tsx` | Price `z.preprocess` with `Number(val)` allows `NaN` to pass. `z.number().nonnegative()` fails with generic message, but programmatic submission with `NaN` can reach backend. |
| AC-001 | Type Consistency | `src/api/admin-addon.api.ts:19` | `CreateAddOnPayload.category` uses loose `string` instead of `AddOnCategory` union (`'Beverage' \| 'Dessert' \| 'Side Dish' \| 'Extra Main'`). Same in `UpdateAddOnPayload`. |
| AC-002 | Type Consistency | `src/api/admin-addon.api.ts:26` | `CreateAddOnPayload.meal_type` uses loose `string[]` instead of `MealType[]` (`'Breakfast' \| 'Lunch' \| 'Dinner'`). Same in `UpdateAddOnPayload`. |
| AC-010 | Type Consistency | `src/api/types/admin-order.types.ts:49` | `AdminOrderListParams.source` is `string` instead of discriminated union (`'daily' \| 'addon' \| 'corporate'`). |
| AC-015 | Type Consistency | `src/api/admin-addon.api.ts` | `QueryAddOnItemsParams.meal_type` is `string` instead of `MealType`. |
| AC-017 | Query Keys | `src/api/hooks/useAdminCorporate.ts:121` | `useMarkInvoicePaid` invalidates `invoiceLists()`, `invoiceList()`, `invoices(id)`. `invoiceList()` has no params, may not match actual keyed queries. Stale paginated lists possible. |
| AC-020 | Type Consistency | `app/(admin)/admin/menu/add-ons/create/page.tsx` | Zod schema uses `z.string()` for `category` instead of `z.enum()`. Invalid categories pass client-side validation. |
| AC-021 | Type Consistency | `app/(admin)/admin/menu/add-ons/create/page.tsx` | Zod schema uses `z.array(z.string())` for `meal_type` instead of `z.array(z.enum())`. |
| AC-024 | Type Consistency | `src/api/types/admin-corporate.types.ts:90` | `AdminCorporateCompany.service_charge_percentage` is `number` with no range validation. Accepts negative or >100 values. |
| F4 | Race Condition | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | Two parallel `useRevenueAnalytics` hooks (current + previous period) fire simultaneously. No coordination means comparison metrics render with mismatched data if one errors or is slower. |
| F5 | useEffect Leak | `app/(admin)/admin/kitchen/page.tsx` | `useEffect` sets `selectedOutletId` when permissions change, but does not cleanup or abort in-flight kitchen report query. Rapid outlet switching causes overlapping renders. |
| F6 | Stale Closure | `app/(admin)/admin/menu/add-ons/create/page.tsx` | Mutation `onSuccess` navigates via `router.push` without checking if component still mounted. Navigation may throw if user navigated away during mutation. |
| F7 | Loading State | `app/(admin)/admin/menu/add-ons/[id]/page.tsx` | Delete mutation uses native `confirm()` which blocks main thread. No loading state prevents double-click deletion. |
| F8 | DOM Timing | `app/(corporate)/corporate/dashboard/page.tsx` | `upcomingDelivery` computed by filtering+sorting full orders list on every render. Large lists cause jank during motion animation re-renders. |
| F9 | Race Condition | `app/(admin)/admin/inventory/movements/page.tsx` | Same debounced search anti-pattern as add-ons page: `useRef` timeout without request cancellation. |
| M-High | Duplication | `app/(admin)/admin/menu/add-ons/create/page.tsx`, `edit/page.tsx` | Create and Edit forms are near-identical (~450 lines each). Same schema, constants, card sections, FormField structures. Only differences are hydration mode, payload type, and mutation hook. Severe DRY violation. |
| M-High | Component Size | `src/components/admin/reports/ReportCharts.tsx` | God file: 8 chart components, 591 lines. RevenueExpenseChart, RevenueExpenseAreaChart, RevenueExpenseLineChart share identical data shapes, `isVisible`, `maxVal`, and nearly identical CartesianGrid/XAxis/YAxis/Tooltip/Legend boilerplate. |
| M-High | Component Size | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | 588 lines, 5 nested helpers (ProfitRing, KpiCard, ChangeBadge, getDateRange, getPreviousPeriodRange, getSparkline). Duplicates BRAND_COLORS from ReportCharts. Mixes date math, chart rendering, KPI layout, animation. |
| M-Med | Type Safety | `src/api/hooks/useAdminAddons.ts`, `useAdminCorporate.ts` | Multiple mutation hooks type `onError` as `(error: any)`. Disables TypeScript property access checks. |
| M-Med | Duplication | `src/components/admin/reports/ReportCharts.tsx`, `DashboardExpenseRevenue.tsx` | `BRAND_COLORS` object defined identically in both files. |
| M-Med | Duplication | `src/components/admin/reports/RevenueAnalyticsReport.tsx`, `DashboardExpenseRevenue.tsx`, `DashboardKpiCards.tsx`, `DashboardIngredientUsage.tsx` | Each defines its own `formatCurrency` with slight variations. |
| M-Med | Duplication | `app/(admin)/admin/menu/add-ons/page.tsx`, `src/components/admin/corporate/CorporateInvoiceTable.tsx` | Identical `getInitials(name?: string)` function in both files. |
| M-Med | Type Safety | `src/components/admin/reports/ReportCharts.tsx`, `DashboardExpenseRevenue.tsx` | `visibleSeries` typed as `Record<string, boolean>` instead of literal union (`'individual' \| 'addon' \| 'corporate' \| 'procurement' \| 'ingredient'`). |
| PS-Med | Tailwind | Multiple files | Arbitrary Tailwind values: `w-[220px]`, `w-[160px]`, `w-[140px]`, `max-w-[180px]`, `max-w-7xl`. AGENTS.md forbids arbitrary values. |
| PS-Med | Design Token | `app/(admin)/admin/menu/add-ons/edit/page.tsx`, `create/page.tsx`, `[id]/page.tsx` | Arbitrary text sizes (`text-[28px]`, `sm:text-[32px]`, `lg:text-[36px]`) and `rounded-2xl` on cards. CLAUDE.md says use Tailwind scale (`text-2xl`, `text-3xl`) and `rounded-sm` (8px). |
| PS-Med | Design Token | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx`, `src/components/admin/reports/ReportCharts.tsx` | Local `BRAND_COLORS` with hardcoded hex values. Should use design tokens via CSS custom properties. |
| AN-Med | Browser API | `app/(admin)/admin/corporate/invoices/[id]/page.tsx` | `navigator.clipboard.writeText()` for copying payment link URL. No programmatic fallback. |
| AN-Med | Browser API | `app/(admin)/admin/kitchen/page.tsx` | `window.print()` for kitchen report printing. No PDF export API. |
| AN-Med | Blocking UI | `app/(admin)/admin/menu/add-ons/[id]/page.tsx` | `confirm()` dialog blocks deletion flow. Cannot be triggered programmatically. |
| AN-Med | Multi-step UI | `src/components/admin/corporate/CompanyDetailTabs.tsx` | Service charge settings require two UI steps: toggle Switch (immediately saves `enabled=false`) then separate Save button for percentage. |
| AN-Med | Side Effect | `src/api/hooks/useAdminCorporate.ts` | `generatePaymentLink` mutation triggers WhatsApp side effect on backend. API returns link but toast says "sent via WhatsApp" — no delivery status in response. |

---

## Low Findings (P3) — User's Discretion

| ID | Category | File | Finding |
|---|---|---|---|
| COR-012 | Accessibility | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | Chart type toggle buttons lack `aria-pressed` state. |
| COR-013 | Error Handling | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | Revenue analytics query errors silently swallowed — shows "No data" instead of error state. |
| COR-014 | Debounce | `app/(admin)/admin/menu/add-ons/page.tsx` | Search debounce uses manual `useRef` + `setTimeout`. Functional but more error-prone than `useDebounce` from `usehooks-ts`. |
| COR-015 | Contract | `src/api/types/admin.types.ts` | `IDashboardResponse` extended with `expenses` and `ingredientUsage` — no evidence backend returns these fields. |
| COR-010 | Coupling | `src/api/admin-addon.api.ts:3` | Imports `PaginatedResponse` from `admin-inventory.api.ts` instead of shared location. |
| COR-011 | Duplication | `app/(admin)/admin/menu/add-ons/page.tsx`, `create/page.tsx`, `edit/page.tsx` | `CATEGORIES` and `MEAL_TYPES` arrays defined identically in all three files. |
| F10 | useEffect | `src/components/admin/recipes/RecipeForm.tsx` | `useEffect` syncs Select values when `initialData` changes. Missing cleanup — brief stale values if `initialData` switches. |
| F12 | URL Sync | `app/(corporate)/corporate/orders/page.tsx` | `activeStatus` initialized from `searchParams` but not synced back to URL. Browser back/forward does not update filter tabs. |
| F13 | Layout | `src/components/admin/dashboard/DashboardExpenseRevenue.tsx` | `AnimatePresence` with height animation can cause layout thrashing when switching periods rapidly. |
| F14 | Cache | `src/api/hooks/useAdminAddons.ts` | Mutation invalidates list queries but does not refetch active detail query. Stale data may persist until cache expires. |
| F15 | Keys | `src/components/admin/kitchen/KitchenIngredientConsumption.tsx` | Expanded row may share same key as parent `tr`. React may confuse DOM nodes during expand/collapse. |
| AC-003 | Contract | `src/api/admin-addon.api.ts` | `recipe_name` missing from payload types but present on response type — correctly omitted (server-computed). Info only. |
| AC-006 | Query Keys | `src/api/hooks/useAdminAddons.ts` | Mutation invalidation targets `lists()` (list-of-lists key). Broadly correct. Info only. |
| AC-007 | Breaking Change | `src/api/types/corporate.types.ts` | New required fields `service_charge_enabled`, `service_charge_percentage` in `ICorporateProfile`. Verify backend already returns them. |
| AC-008 | Breaking Change | `src/api/types/corporate.types.ts` | Same required fields in `ICorporateOrder`. Backend must populate them. |
| AC-009 | Contract | `src/api/types/admin-corporate.types.ts` | `GeneratePaymentLinkResponse` shape assumes flat fields inside `data`. Verify backend envelope. |
| AC-011 | Contract | `src/api/admin-kitchen.api.ts` | New `getConsumptionProjection` endpoint. Verify backend returns `unit` consistently. |
| AC-012 | Types | `src/api/types/admin.types.ts` | `IIngredientUsageItem` uses `string` for `category` and `unit`. Define enums if backend supports fixed values. |
| AC-013 | Serialization | `src/api/types/delivery.types.ts` | `DeliveryRouteSummary` adds optional `route_type`, `company_name`, `total_meals`. Backward compatible; good discriminated union. |
| AC-014 | Serialization | `src/api/types/delivery.types.ts` | `UpdateStopBody` adds `delivery_proof_url`. Backward compatible. |
| AC-016 | Pagination | `src/api/admin-addon.api.ts` | `listAddOns` returns `PaginatedResponse<AddOnItem>` with `totalPages`. Consistent pattern. |
| AC-018 | HTTP Method | `src/api/admin-corporate.api.ts` | `updateCompanyServiceCharge` uses PUT with optional fields — PATCH-like semantic. Verify backend handles partial PUT. |
| AC-019 | Types | `src/api/types/corporate.types.ts` | Payment link fields on `ICorporateInvoice` all optional. Consider typing `payment_link_status` as union. |
| AC-022 | Query Keys | `src/api/query-keys.ts` | `revenueAnalytics` key includes optional `granularity` — different cache keys when undefined vs explicit. Expected behavior. |
| AC-023 | Types | `src/api/types/admin.types.ts` | `IRevenueAnalyticsQuery` and `IOperationsReportQuery` share shape but are separate types. Keep separate for future divergence. |
| M-Med | Dead Code | `app/(admin)/admin/old-page.tsx` | Superseded dashboard implementation. Not referenced by any route. |
| M-Med | Inconsistency | `app/(admin)/admin/menu/add-ons/page.tsx`, `CorporateInvoiceTable.tsx`, `SubscriptionTable.tsx` | Mixed pagination patterns — some custom Previous/Next, others shadcn/ui Pagination. |
| M-Med | Inconsistency | `src/components/admin/kitchen/KitchenIngredientConsumption.tsx` | Uses raw HTML `<table>` instead of shadcn/ui Table primitives. |
| M-Low | Naming | `src/api/hooks/useAdminCorporate.ts` | Inconsistent hook naming — some use `useAdminCorporateOrders`, others `useCancelCorporateOrder`. Redundant `Admin` prefix. |
| M-Low | Patterns | `src/api/query-keys.ts` | Inconsistent query key factory patterns — some arrow functions, some plain constants. |
| M-Low | Cleanup | `app/(admin)/admin/menu/add-ons/create/page.tsx` | `Beef` icon imported but unused. |
| M-Low | Duplication | `add-ons/page.tsx`, `[id]/page.tsx`, `CorporateInvoiceTable.tsx` | `AvailabilityPill` and `StatusPill` variants duplicated across files. |
| PS-Low | Design Token | `src/components/admin/dashboard/DashboardKpiCards.tsx` | Uses `bg-sky-50`, `text-sky-600`, `bg-emerald-50`, `text-emerald-600` — color names, not semantic tokens. |
| PS-Low | Design Token | `src/components/admin/reports/RevenueAnalyticsReport.tsx` | Uses `border-l-emerald-500`, `border-l-amber-500`, `bg-emerald-50/text-emerald-600` — color names. |
| PS-Low | Design Token | `app/(admin)/admin/menu/add-ons/[id]/page.tsx` | `border-emerald-200`, `bg-emerald-50`, `text-emerald-700` for veg pill — color names. |
| PS-Low | Tailwind | `src/components/admin/reports/ReportCharts.tsx` | `rounded-[2px]` and `rounded-[4px]` arbitrary radius values. |
| PS-Low | TypeScript | `src/components/admin/recipes/RecipeForm.tsx` | `resolver: zodResolver(recipeSchema) as any` defeats TypeScript safety. |
| PS-Low | TypeScript | `app/(admin)/admin/menu/add-ons/edit/page.tsx`, `create/page.tsx` | `as Resolver<AddOnFormValues>` cast for zodResolver. |
| PS-Low | Design Token | `src/components/corporate/OrderCard.tsx` | Hardcoded hex: `bg-[#00990F]`, `text-[#00990F]`, `bg-[#FF962D]`. |
| PS-Low | Layout | `app/(admin)/admin/menu/add-ons/edit/page.tsx`, `[id]/page.tsx`, `create/page.tsx` | `max-w-7xl` (1280px). AGENTS.md says too narrow; use `max-w-[1400px]`. |
| PS-Low | Badge | `src/components/ui/badge.tsx` | Adds `success`, `warning`, `inactive` variants. Reasonable and follows cva pattern. Document as custom. |
| PS-Low | File | `app/(admin)/admin/old-page.tsx` | New file named `old-page.tsx`. Backup/deprecated version. Risk of accidental route exposure. |

---

## Deduplication Notes

The following findings overlap across reviewers and are consolidated above:

- **ServiceChargeSettings state desync** — COR-002 (correctness), ADV-012 (adversarial), AN-Med (agent-native) → consolidated as COR-002
- **Paginated stats bug** — COR-007 (correctness), F11 (julik-frontend-races) → consolidated as COR-007
- **Add-on form duplication** — M-High (maintainability), AC-020/AC-021 (api-contract) → referenced together
- **error: any antipattern** — M-Med (maintainability), PS-Med (project-standards) → consolidated
- **BRAND_COLORS duplication** — M-Med (maintainability), PS-Med (project-standards) → consolidated
- **Response interceptor gotcha** — PS-High (project-standards), ADV-010 (adversarial) → both noted
- **Debounce races** — F1, F2, F9 (julik-frontend-races), COR-014 (correctness) → F1/F2/F9 in High/Medium
- **No error boundaries** — ADV-013 (adversarial) → standalone High finding
- **XSS** — ADV-003 (adversarial) → standalone Critical finding
- **Recipe ingredient_id loss** — COR-003 (correctness) → standalone Critical finding

---

## Residual Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Backend may not return new corporate service charge fields for existing orders | TypeScript runtime errors if frontend assumes required fields exist on historical data | Make `service_charge_*` fields optional until backend migration confirmed, or ensure backend backfills |
| Add-on category/meal_type string looseness propagates to backend | Invalid enum values could be persisted if backend doesn't validate strictly | Tighten TypeScript types (AC-001, AC-002, AC-015) and add Zod enum validation (AC-020, AC-021) |
| Payment link generation endpoint contract not verified against actual backend response | `GeneratePaymentLinkResponse` may not match backend envelope | Test actual API call and verify response shape |
| Ingredient consumption projection API is new and `wastage_factor` calculation is backend-defined | Frontend displays computed values without understanding calculation methodology | Document `wastage_factor` semantics in API docs or type comments |
| Dashboard expense/revenue analytics fields are optional in `IDashboardResponse` | UI components must handle undefined expenses and ingredientUsage gracefully | Verify all dashboard widget components null-check these fields |
| Backend may not validate the same constraints as frontend Zod schemas | Attacker can bypass frontend validation via direct API calls | Duplicate all Zod validations server-side |
| `useAuthHydrated` pattern flashes protected content before redirecting unauthenticated users | Search engines may index admin pages | Implement server-side rendering with session checks; add `robots.txt` disallow for `/admin` and `/corporate` |
| No rate limiting visible on payment link generation or order creation | Automated scripts could abuse these endpoints | Add rate limiting middleware on backend; add CAPTCHA for high-value actions |
| `ImageUploadField` may accept non-image files or extremely large files | Unrestricted uploads | Verify file type and size validation in `ImageUploadField`; add client-side checks |
| Corporate order `end_date` computed client-side | Malicious client could send different `end_date` to backend | Backend must recompute or validate `end_date` against start_date and billing cycle |
| `useHasPermission` short-circuits to `true` for `superAdmin` | Behavior change could bypass permission checks if role name changes | Ensure `'superAdmin'` is canonical backend value; consider using enum |
| DeliveryProofDialog uses `react-icons` while rest of app uses `lucide-react` | Extra icon dependency inconsistency | Replace `react-icons` with `lucide-react` equivalents |
| Add-on pages use `rounded-2xl` and custom text sizes | Visual style diverges from rest of admin panel | Align with design system: `rounded-sm`, standard text sizes |

---

## Testing Gaps

| Area | Gap | Priority |
|---|---|---|
| **Test Infrastructure** | Zero test files exist in the project. ~354KB new code, 55 files, no coverage. | Critical |
| **API Hooks** | No tests for any of the 5 new hooks (useAdminAddons, useAdminCorporate, useAdminKitchen, useAdminReports). Missing: query key verification, enabled-state guards, mutation invalidation, error handling, staleTime. | High |
| **Form Validation** | No tests for `addOnSchema` Zod validation. Missing: empty string handling via `z.preprocess`, negative number rejection, optional field behavior, `meal_type` array validation. | High |
| **Component Rendering** | No tests for any new UI components. Missing: loading states, empty states, error states, permission-gated UI, pagination, tab switching, chart rendering. | High |
| **Integration Flows** | No tests for end-to-end flows: create add-on -> list invalidation, delete add-on -> redirect, generate payment link -> invoice status update, service charge update -> company detail refresh. | Medium |
| **Analytics Logic** | No tests for `DashboardExpenseRevenue` comparison math, sparkline extraction, period range calculation, or `RevenueAnalyticsReport` profitTrend computation. | Medium |
| **Permission Matrix** | No tests verifying `Can` component and `useHasPermission` correctly show/hide UI elements. | Medium |
| **Recipe Form Edit** | No test verifies `ingredient_id` is preserved when editing a recipe. | Medium |
| **Cache Invalidation** | No test verifies generating a payment link invalidates the correct query keys (`companyInvoices(companyId)`). | Medium |
| **Dashboard Error States** | No test for API failure scenarios. Mock `useRevenueAnalytics` error and assert error UI shown. | Medium |
| **Debounce Races** | No tests for debounced search race conditions — rapid keystrokes should not show stale results. | Medium |
| **Form Reset Behavior** | No tests for edit page `values` prop overwrite scenario when async data loads after user interaction. | Medium |
| **Memory Leaks** | No tests for `DeliveryProofDialog` blob URL leaks. | Low |
| **Type Safety at Runtime** | No runtime validation of API responses against TypeScript types. Contract changes fail silently. | Low |
| **Query Key Stability** | No tests verifying query key stability and uniqueness in `query-keys.ts`. | Low |

---

## Verdict

**Action Required Before Merge**

The branch introduces significant new functionality (add-on CRUD, corporate order management, dashboard analytics, kitchen reporting) with **zero test coverage** and several **critical security and data-integrity issues**.

### Must Fix (Blockers)
1. **COR-003** — Recipe `ingredient_id` loss on edit causes silent data corruption
2. **ADV-003** — Stored XSS vulnerability in add-on description and text inputs
3. **ADV-007** — Client-side-only auth is bypassable with JavaScript disabled
4. **COR-001** — Payment link cache invalidation uses wrong ID, leaving stale data
5. **COR-002** — Service charge settings state desync between admins

### Should Fix (High Priority)
6. **ADV-001/ADV-002/ADV-019** — Unbounded form inputs (price, quantity, name)
7. **ADV-004/ADV-005** — Dashboard crashes on malformed/empty API responses
8. **ADV-011** — Memory leak in `DeliveryProofDialog`
9. **ADV-013** — No error boundaries; any crash whitescreens entire admin app
10. **F1/F2/F3** — Race conditions in search and edit form hydration
11. **ADV-008/ADV-017** — Double-click submits duplicate orders/payment links
12. **M-High duplication** — Extract shared AddOnForm component (create/edit)

### Testing
- Add at minimum unit tests for Zod schemas, mutation hooks, and the shared AddOnForm component
- Add integration tests for the recipe edit -> ingredient_id preservation flow
- Add error-state tests for dashboard analytics

**Risk Level: High** — The combination of XSS, data corruption on recipe edit, bypassable auth, and zero tests makes this branch unsafe for production without the blockers above being addressed.
