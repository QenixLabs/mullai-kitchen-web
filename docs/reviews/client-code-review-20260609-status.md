# Code Review Status — Blockers Fix Pass

## Completed

| ID | File | Fix |
|---|---|---|
| COR-003 | `src/components/admin/recipes/RecipeForm.tsx` | `ingredient_id` preserved on edit via `i.ingredient_id \|\| ''` instead of wiping to `''`. Payload builder also includes `ingredient_id`. `Ingredient` type in `menu.types.ts` updated with `ingredient_id?: string`. |
| ADV-003 | `src/lib/sanitize.ts`, `add-ons/[id]/page.tsx`, `recipes/RecipeDetail.tsx`, `plans/PlanTable.tsx` | Created `sanitizeUrl` blocking `javascript:`/`data:` protocols. Applied to all admin `<img>` / `next/image` src attributes using API-provided URLs. No `dangerouslySetInnerHTML` exists in app; JSX auto-escapes text content. |
| ADV-007 | `middleware.ts` | Already existed — `mk-access-token` cookie gate on `/admin/:path*`, `/corporate/:path*`, and all protected routes. Server-side redirect before any HTML served. |
| COR-001 | `src/api/hooks/useAdminCorporate.ts` | Removed incorrect invalidations: `invoices(id)` and `companyInvoices(id)` both expect order/company IDs, not invoice IDs. Now only invalidates `invoiceLists`, `invoiceList`, `invoiceDetail(id)`. |
| COR-002 | `src/components/admin/corporate/CompanyDetailTabs.tsx` | Added `useEffect` to sync local `enabled`/`percentage` when `company` prop changes. Removed asymmetric auto-save from toggle — `handleToggle` only updates local state; Save button handles API call. |
| ADV-001 | `add-ons/create/page.tsx`, `edit/page.tsx` | Price: added `.max(999999, 'Price exceeds maximum allowed')` to Zod schema. |
| ADV-002 | `add-ons/create/page.tsx`, `edit/page.tsx` | `max_quantity_per_order`: added `.max(100)`. `preparation_time`: added `.max(1440, 'Preparation time must be 24 hours or less')`. |
| ADV-019 | `add-ons/create/page.tsx`, `edit/page.tsx` | `name`: added `.max(200, 'Name must be under 200 characters')`. |

## Not Completed — Remaining Open

### Critical
| ID | Why Not Fixed |
|---|---|
| TG-Critical | Zero test files in project. Requires dedicated test infrastructure setup, not a quick fix. |

### High
| ID | Why Not Fixed |
|---|---|
| ADV-004 | `DashboardExpenseRevenue.tsx` NaN/Infinity guards — requires understanding dashboard data flow |
| ADV-005 | `ReportCharts.tsx` empty-array checks — requires chart component review |
| ADV-011 | `DeliveryProofDialog.tsx` `URL.revokeObjectURL` — requires component lifecycle review |
| ADV-013 | No error boundaries — requires new `ErrorBoundary` component + layout integration |
| F1 | Add-ons page debounce race — requires `AbortController` integration |
| F2 | `IngredientSelector` debounce race — same pattern |
| F3 | Edit form `values` overwrite — requires `keepDirtyValues` or `resetOptions` strategy |
| ADV-008 | Corporate create-order double-click — requires `isPending` guard pattern review |
| ADV-017 | Payment link double-click — same pattern |
| M-High | Create/Edit form duplication — requires extracting shared `AddOnForm` component (~450 lines) |

### Medium / Low
All remaining P2/P3 findings untouched in this pass.
