# Mullai Kitchen — Admin UI Design Playbook

A working contract for every admin page, table, modal, and supporting component. Pulled from the senior-level redesign of `/admin/corporate/**` and `/admin/routes`. Apply this anatomy to every new admin page so they all read as one product.

This file is the **how**. For brand tokens and the broader design system, see `client/CLAUDE.md` and `client/docs/design-system.md`.

---

## 1. Core Principles

1. **Tokens only.** Never hardcode colors. Never use `bg-gold` or any legacy accent — it is being removed.
2. **One anatomy.** Every list page is: header tile + KPI row + toolbar Card + content Card with HeaderStrip. Detail pages are: BackLink + Hero + KPI row + section Cards.
3. **Density over chrome.** Tight `space-y-3`, `text-xs/text-sm`, `h-8/h-9` controls, ringed icon tiles instead of large illustrations.
4. **Tone matches intent.** Destructive actions are destructive-toned. Success-state KPIs use `success`. Warnings use `warning`. Never use `bg-rose-600` directly.
5. **Permission-gated.** Use `<Can permission="…">`, not raw role checks, for any action button.
6. **No celebration text.** Empty states say what to do next. KPIs are punchy single numbers, not paragraphs.

---

## 2. Tone Palette

Six tones cover the entire admin surface. Memorize the class strings.

| Tone | Container | Ring | Foreground | Use for |
|------|-----------|------|------------|---------|
| `primary` | `bg-primary/10` | `ring-primary/15` | `text-primary` | Brand, default badges, totals, route counts |
| `success` | `bg-success/10` | `ring-success/20` | `text-success` | Paid invoices, completed routes, delivered orders, veg chips |
| `warning` | `bg-warning/10` | `ring-warning/20` | `text-warning` | In-progress, pending, "no partner assigned" |
| `info` | `bg-info/10` | `ring-info/20` | `text-info` | Published, awaiting start, add-on orders |
| `destructive` | `bg-rose-50` | `ring-rose-100` | `text-rose-600` | Overdue invoices, non-veg chips, irreversible actions |
| `muted` | `bg-muted` | `ring-border` | `text-muted-foreground` | Drafts, neutral counts, disabled |

> Why `bg-rose-50` instead of `bg-destructive/10`? The destructive token reads too saturated next to other ringed chips. Rose-50 is the calibrated "danger but readable" tint we landed on for KPI/status chips. Reserve `bg-destructive` itself for action buttons (`bg-destructive text-destructive-foreground hover:bg-destructive/90`).

---

## 3. Page Anatomy (List Pages)

```
┌─ PageHeader  (icon tile + h1 + subtitle | right-side Badge cluster) ─┐
│                                                                       │
├─ KPI Row     (4 × StatCard, tone-varied)                             ─┤
│                                                                       │
├─ Toolbar Card (search, filters, primary CTA right-aligned)           ─┤
│                                                                       │
├─ Content Card                                                         │
│   ├─ HeaderStrip  (icon tile + title + count chip)                    │
│   ├─ Table / List body                                                │
│   └─ Footer hint  (count summary | inline tip)                        │
│                                                                       │
└─ Pagination (only when >1 page)                                      ─┘
```

### 3.1 PageHeader

```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <div className="flex items-center gap-2">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
      <Route className="h-4.5 w-4.5" />
    </span>
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Page Title</h1>
      <p className="text-sm text-muted-foreground">One-line subtitle describing what's here.</p>
    </div>
  </div>
  <div className="flex flex-wrap items-center gap-2">
    {/* Right-side context Badges: outlet name, date, count */}
  </div>
</div>
```

Right-side `Badge` cluster: muted, uppercase, icon-prefixed.

```tsx
<Badge variant="secondary" className="h-8 gap-1.5 border-0 bg-muted px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
  <Building2 className="h-3 w-3" /> {outletName}
</Badge>
```

### 3.2 KPI Row (StatCard)

Exactly four cards on `lg`, two on `sm`, one on mobile. No exceptions — pad with relevant secondary metrics if you only have three real ones.

```tsx
<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard tone="primary" icon={<ListChecks className="h-4 w-4" />} label="Total Routes" value={stats.total} sub="…" />
  <StatCard tone="info"    icon={<Clock className="h-4 w-4" />}      label="Awaiting Start" value={…} sub="…" />
  <StatCard tone="warning" icon={<Truck className="h-4 w-4" />}      label="In Progress"   value={…} sub="…" />
  <StatCard tone="success" icon={<CheckCircle2 className="h-4 w-4" />} label="Completed" value={…} sub="…" />
</div>
```

`StatCard` recipe:

```tsx
function StatCard({ icon, label, value, sub, tone }: StatCardProps) {
  const toneStyles = {
    primary: 'bg-primary/10 text-primary ring-primary/15',
    success: 'bg-success/15 text-success ring-success/20',
    warning: 'bg-warning/15 text-warning ring-warning/20',
    info:    'bg-info/15 text-info ring-info/20',
    destructive: 'bg-rose-50 text-rose-600 ring-rose-100',
    muted:   'bg-muted text-muted-foreground ring-border',
  } as const;

  return (
    <Card className="border-border/70 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">{value}</p>
            {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
          </div>
          <span className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1', toneStyles[tone])}>
            {icon}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

Rules:
- Value uses `text-2xl font-bold tabular-nums`. Always.
- Sub-line is one short clause, never two. Truncate if dynamic.
- Icon tile is `h-8 w-8` for KPI; `h-7 w-7` for inline strips; `h-9 w-9` for the page header. Never bigger.

### 3.3 Toolbar Card

Wrap filters + primary CTA in a Card. Search debounces at 300ms via `useEffect` + `setTimeout`. CTA is right-aligned with `ml-auto`.

```tsx
<Card className="border-border/70 shadow-sm">
  <CardContent className="flex flex-wrap items-center gap-3 p-4">
    {/* Search with icon prefix */}
    {/* Filter Selects with icon-prefixed SelectTrigger */}
    <div className="ml-auto">
      <Can permission="route:generate">
        <Button className="h-9 gap-1.5"><Sparkles className="h-4 w-4" /> Primary CTA</Button>
      </Can>
    </div>
  </CardContent>
</Card>
```

Filter label pattern (kept invisible on mobile to save space):

```tsx
<span className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline">
  Outlet
</span>
```

### 3.4 Content Card + HeaderStrip

```tsx
<Card className="overflow-hidden border-border/70 shadow-sm">
  <CardContent className="p-0">
    <HeaderStrip count={data.length} total={total} />
    <Table>…</Table>
    <FooterHint />
  </CardContent>
</Card>
```

HeaderStrip recipe (lift verbatim into each list component):

```tsx
function HeaderStrip({ count, total }: { count: number; total?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <Building2 className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Section Title</h3>
        {total !== undefined && total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 3.5 Footer hint

Either a pagination bar or a one-line summary. Same surface either way:

```tsx
<div className="flex items-center justify-between border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground">
  <span><span className="font-semibold text-foreground">{count}</span> items</span>
  <span className="hidden sm:inline">Click eye icon to view</span>
</div>
```

---

## 4. Tables

The shadcn `<Table>` is the spine. Override these defaults on every header row:

```tsx
<TableHeader>
  <TableRow className="border-b border-border/70 bg-background hover:bg-background">
    <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      Column
    </TableHead>
  </TableRow>
</TableHeader>
```

Body rows:

```tsx
<TableRow
  className={cn(
    'group transition-colors hover:bg-accent/20',
    !isLast && 'border-b border-border/50',
    isSelected && 'bg-primary/5',
  )}
>
  <TableCell className="px-4 py-3">…</TableCell>
</TableRow>
```

### 4.1 Standard cell patterns

| Pattern | Class / shape |
|---------|---------------|
| ID / vehicle plate / ref | `<code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground/80">…</code>` |
| Avatar (initials) | `inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold uppercase text-primary ring-1 ring-primary/15` |
| Sequence chip | `inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-[11px] font-bold tabular-nums text-foreground` |
| Numeric count chip | `inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-bold tabular-nums ring-1` (toned) |
| Address row | `flex items-start gap-1.5 text-xs text-muted-foreground` with leading `<MapPin className="mt-0.5 h-3 w-3 shrink-0" />` |
| Customer name | `flex items-center gap-2` with leading `<User className="h-3.5 w-3.5 text-muted-foreground" />` |
| Action column | right-aligned, `h-8` Button, leading icon, Tooltip if icon-only |

Hide mid-importance columns at breakpoints: `hidden md:table-cell`, `hidden lg:table-cell`, `hidden xl:table-cell`. Never let a row scroll horizontally.

### 4.2 Action buttons in rows

Always tooltipped when icon-only:

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild>
      <Link href={`/admin/corporate/companies/${id}`}><Eye className="h-4 w-4" /></Link>
    </Button>
  </TooltipTrigger>
  <TooltipContent side="top"><p className="text-xs">View company</p></TooltipContent>
</Tooltip>
```

Wrap the table component in a single `<TooltipProvider delayDuration={250}>` at the top.

### 4.3 Pagination

Show only when `totalPages > 1`. Pattern:

```tsx
<div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
  <span>Showing <strong className="text-foreground">{start}–{end}</strong> of <strong className="text-foreground">{total}</strong></span>
  <div className="flex items-center gap-1.5">
    <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={…}><ChevronLeft /></Button>
    {/* Numbered buttons with ellipsis when far from current */}
    <Button variant="outline" size="icon-sm" disabled={page >= totalPages} onClick={…}><ChevronRight /></Button>
  </div>
</div>
```

---

## 5. Detail Pages

Anatomy: BackLink → Hero → KPI Row → SectionCards (2-col grid) → Table cards.

### 5.1 BackLink

```tsx
<Link href="/admin/corporate/invoices" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
  <ChevronLeft className="h-4 w-4" />
  Back to Invoices
</Link>
```

### 5.2 Hero

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex items-center gap-3 min-w-0">
    <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-base font-bold uppercase text-primary ring-1 ring-primary/15">
      {getInitials(name)}
    </span>
    <div className="min-w-0">
      <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">{name}</h1>
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <StatusPill status={status} />
        <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">#{id}</code>
        {/* Inline metadata: <Building2 /> outlet, <CalendarDays /> period */}
      </div>
    </div>
  </div>
  <div className="flex shrink-0 items-center gap-2">
    {/* Right-side action buttons, gated with <Can> */}
  </div>
</div>
```

### 5.3 SectionCard + Field

Two-column metadata grid below the KPI row:

```tsx
<div className="grid gap-4 lg:grid-cols-2">
  <SectionCard title="Invoice Details" icon={<FileText />}>
    <Field label="Invoice Number" value={…} />
    <Field label="Billing Period" value={…} />
  </SectionCard>
  <SectionCard title="Payment Status" icon={<Wallet />}>…</SectionCard>
</div>
```

`SectionCard` mirrors `Card` + `SubHeaderStrip`. `Field` is a 2-row `dl` row: uppercase muted label above bold foreground value.

---

## 6. Modals (Dialog & AlertDialog)

Every modal opens with an icon-prefixed title, a one-line description, a tightened body, and a bordered footer with toned action button.

### 6.1 Dialog anatomy

```tsx
<DialogContent className="sm:max-w-md">
  <DialogHeader>
    <DialogTitle className="flex items-center gap-2 text-base">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-{TONE}/10 text-{TONE} ring-1 ring-{TONE}/20">
        <Icon className="h-3.5 w-3.5" />
      </span>
      Action Title
    </DialogTitle>
    <DialogDescription>One-line plain-English explanation of what this does.</DialogDescription>
  </DialogHeader>

  <div className="space-y-3">
    {/* Optional warning callout */}
    <div className="flex items-start gap-2 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>Side-effect explanation.</span>
    </div>

    {/* Form fields with uppercase label */}
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <CalendarDays className="h-3 w-3" /> Field Name
      </Label>
      <Input className="h-9" />
    </div>

    {/* Footer */}
    <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
      <Button variant="outline" size="sm" className="h-9">Cancel</Button>
      <Button size="sm" className="h-9 gap-1.5 bg-{TONE} text-{TONE}-foreground hover:bg-{TONE}/90">
        <Icon className="h-3.5 w-3.5" /> Confirm
      </Button>
    </div>
  </div>
</DialogContent>
```

Tone matches operation:
- **Mark Paid / Complete** → `success`
- **Update / Refresh / Edit** → `primary`
- **Cancel / Delete** → `destructive`
- **Assign / Pick** → `primary`

### 6.2 AlertDialog parity

Same icon-prefixed title. Use `AlertDialogDescription` for the consequence statement. Inject a warning callout above the footer when the action has side-effects on linked records.

```tsx
<AlertDialogTitle className="flex items-center gap-2 text-base">
  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20">
    <Trash2 className="h-3.5 w-3.5" />
  </span>
  Delete Route
</AlertDialogTitle>
<AlertDialogDescription>
  This permanently removes the route and unlinks any orders assigned to it. This action cannot be undone.
</AlertDialogDescription>
{/* warning callout here */}
<AlertDialogFooter>
  <AlertDialogCancel className="h-9">Cancel</AlertDialogCancel>
  <AlertDialogAction className="h-9 gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90">
    <Trash2 className="h-3.5 w-3.5" /> Delete Route
  </AlertDialogAction>
</AlertDialogFooter>
```

### 6.3 Selection-style dialogs (e.g., AssignPartnerDialog)

- Search field has a leading `<Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />`.
- List rows are `<button>` not `<div>`, with full-width selectable surface.
- Selected row gets `border-primary bg-primary/5 ring-2 ring-primary/15` plus a trailing primary-filled check pill (`<Check className="h-3 w-3" strokeWidth={3} />` inside an `h-5 w-5` rounded-full primary tile).
- Avatar inside row uses the standard ringed initials chip; flips to filled `bg-primary text-primary-foreground` when selected.
- Empty state is rounded-full muted icon + headline + sub.

---

## 7. Empty & Loading States

### 7.1 Empty state (always inside the content Card)

```tsx
<div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
  <div className="rounded-full bg-muted p-3 text-muted-foreground">
    <RouteIcon className="h-6 w-6" />
  </div>
  <div>
    <h3 className="text-base font-semibold text-foreground">No routes for this date</h3>
    <p className="mt-1 max-w-sm text-sm text-muted-foreground">
      Generate routes from the toolbar above to plan deliveries.
    </p>
  </div>
  <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
    <Sparkles className="h-3 w-3" /> Tap Generate Routes
  </span>
</div>
```

Always end with a clear CTA hint (chip or button). Never just "No data."

### 7.2 Loading state

Mirror the eventual layout with `<Skeleton>`. For lists, show 3 rows. Match the row height (`h-12` to `h-14`) and corner radius (`rounded-md`).

```tsx
{Array.from({ length: 3 }).map((_, i) => (
  <Skeleton key={i} className="h-14 w-full rounded-md" />
))}
```

For Cards, mock the header strip + body so the page shape doesn't shift on load.

---

## 8. Status, Source & Tag Chips

Three concrete patterns. Pick the one that matches semantic meaning.

### 8.1 StatusPill (dot + ring border, capsule)

```tsx
<span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
  <span className="h-1.5 w-1.5 rounded-full bg-success" />
  Active
</span>
```

Use for: account status, route status, invoice paid/unpaid, anything binary or staged.

### 8.2 Source/Type chip (rectangle, no dot)

```tsx
<span className={cn('inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide', toneClass)}>
  Corporate
</span>
```

Use for: order source (Daily / Add-on / Corporate), invoice type, payment method.

### 8.3 MetaChip (icon + label : value)

```tsx
<span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 text-xs">
  <span className="inline-flex h-5 w-5 items-center justify-center rounded ring-1 bg-primary/10 text-primary ring-primary/15">
    <Truck className="h-3 w-3" />
  </span>
  <span className="text-muted-foreground">Partner:</span>
  <span className="font-semibold text-foreground">{partnerName}</span>
</span>
```

Use for: secondary metadata rows above tables (partner, progress, count).

### 8.4 Veg / Non-veg

```tsx
// Veg
<Leaf /> + bg-success/10 text-success ring-success/20
// Non-veg
<Drumstick /> + bg-rose-50 text-rose-600 ring-rose-100
```

---

## 9. Iconography

- Library: `lucide-react`. Never mix in another icon set.
- Sizes: `h-3 w-3` (chip dots), `h-3.5 w-3.5` (inside ringed tiles, button leading icons), `h-4 w-4` (KPI tiles, standalone), `h-4.5 w-4.5` (page header tile), `h-6 w-6` (empty-state hero).
- Tile sizes: `h-5 w-5` (MetaChip mini), `h-7 w-7` (HeaderStrip / SubHeaderStrip / Dialog title), `h-8 w-8` (StatCard), `h-9 w-9` (PageHeader), `h-12 w-12` (Detail-page hero avatar).
- Always wrap a leading icon in the action button: `<Button className="h-9 gap-1.5"><Icon className="h-3.5 w-3.5" /> Label</Button>`.

Common picks:

| Concept | Icon |
|---------|------|
| Routes | `Route` / `RouteIcon` |
| Delivery partner / vehicle | `Truck` |
| Orders / packages | `Package`, `PackageOpen` (empty) |
| Generate / AI / magic | `Sparkles` |
| Time / pending | `Clock` |
| Completed / done | `CheckCircle2` |
| Warning / at-risk | `AlertTriangle` |
| Destructive / cancel | `Trash2`, `Ban`, `X` |
| Assign user | `UserPlus` |
| Refresh / status change | `RefreshCw` |
| Search | `Search` |
| Date | `CalendarDays` |
| Reference / hash | `Hash` |
| Address | `MapPin` |
| Phone / email | `Phone`, `Mail` |
| Money / paid | `Wallet`, `Receipt` |

---

## 10. Currency, Dates & Formatting

- Currency: `₹` (rupee glyph) + `value.toLocaleString('en-IN')`. Never `Rs.`.
- Dates: use `date-fns`. Params/serialization: `format(date, 'yyyy-MM-dd')`. Display: `format(date, 'EEE, dd MMM yyyy')` for badges, `format(date, 'dd MMM yyyy')` inline.
- Numbers: always `tabular-nums` on KPI values, count chips, sequence cells. Prevents column wobble on data refresh.

Helper:

```ts
const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;
```

---

## 11. Permissions & Role Gating

Use `<Can>` for action buttons. Use `useHasPermission` for conditional UI logic. Use role checks only for outlet scoping (super admin sees all outlets, others see assigned).

```tsx
<Can permission="route:generate">
  <Button>Generate Routes</Button>
</Can>

const canViewAnyOutlet = useHasPermission('outlet:view:any');
const isSuperAdmin = user?.role === UserRole.SuperAdmin || user?.role === UserRole.Admin;
```

Standard outlet bootstrap effect:

```tsx
useEffect(() => {
  if (!isSuperAdmin && user?.assigned_outlet_id) {
    setSelectedOutletId(user.assigned_outlet_id);
  }
}, [isSuperAdmin, user?.assigned_outlet_id]);

useEffect(() => {
  if (canViewAnyOutlet && !selectedOutletId && outletsData?.data?.length) {
    setSelectedOutletId(outletsData.data[0]._id);
  }
}, [canViewAnyOutlet, selectedOutletId, outletsData?.data]);
```

---

## 12. Search Debounce

For toolbar search inputs, debounce at 300 ms. Pattern (already used across corporate pages):

```tsx
const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
  timeoutRef.current = setTimeout(() => setDebouncedSearch(search), 300);
  return () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };
}, [search]);
```

Pass `debouncedSearch` to the query, not `search`.

---

## 13. Helpers (copy-paste ready)

### getInitials

```ts
function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
```

### formatCurrency / formatDate

```ts
const formatCurrency = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const formatDate = (s: string) => format(new Date(s), 'dd MMM yyyy');
const formatShortDate = (s: string) => format(new Date(s), 'dd MMM');
```

### Stats memo (list pages)

```tsx
const stats = useMemo(() => {
  const rows = data ?? [];
  return {
    total: rows.length,
    /* per-bucket counts via .filter(...).length */
    /* per-bucket sums via .reduce((s, r) => s + (r.field ?? 0), 0) */
  };
}, [data]);
```

---

## 14. API Client Gotcha (recap)

The axios response interceptor in `src/api/client.ts` unwraps `{ success, message, data }` to just `data`. Never check `result.success` or `result.message` on a mutation result — those fields are gone. If `mutateAsync` doesn't throw, treat the request as successful.

```tsx
try {
  const result = await markPaid.mutateAsync(payload);
  toast.success('Invoice marked paid');
} catch (err) {
  toast.error('Failed to mark paid');
}
```

---

## 15. What to Drop (legacy patterns to delete on sight)

- `bg-gold` / `text-gold` / `border-gold` — gone, use `primary`.
- `Rs.` currency prefix — replace with `₹`.
- `<Badge variant="outline">` for source/type tags — replace with toned source chip (§ 8.2).
- Plain `text-red-600` / `bg-red-50` — replace with `destructive` token or rose tonal pair.
- Bare `<h1>` page titles without an icon tile — wrap in PageHeader pattern.
- `<CardHeader>` + `<CardTitle>` for content sections — replace with HeaderStrip inside `CardContent p-0`.
- "No data" / "Nothing to show" — replace with empty-state Card + CTA.
- Multi-line dialog forms with no description — add `<DialogDescription>` and an icon-prefixed title.
- Action buttons without leading icons — add the icon (`h-3.5 w-3.5`).

---

## 16. Pre-ship Checklist

Before merging a redesigned admin page:

- [ ] PageHeader with `h-9 w-9` icon tile + h1 + subtitle + right-side Badge cluster
- [ ] Four-card KPI row, tone-varied, `tabular-nums` values
- [ ] Toolbar Card with right-aligned primary CTA gated by `<Can>`
- [ ] Content Card with HeaderStrip and footer hint
- [ ] Table headers `h-10 px-4 text-[11px] uppercase tracking-wider`
- [ ] Row separators `border-b border-border/50`, last row no border
- [ ] Mono `<code>` chips for IDs and reference numbers
- [ ] Action buttons `h-8` with leading icon, Tooltip if icon-only
- [ ] Empty state with rounded-full muted icon + CTA
- [ ] Loading skeletons match final layout (3 rows, matching height)
- [ ] All status/source pills use the canonical chip patterns (§ 8)
- [ ] Currency = `₹`, dates via `date-fns`, no `Rs.`
- [ ] Search debounced at 300 ms
- [ ] No `bg-gold`, no hardcoded hex colors, no `text-red-*` literals
- [ ] All modals follow § 6 anatomy (icon title + description + toned action)
- [ ] `mcp__ide__getDiagnostics` returns `[]`

If any box is empty, don't ship. Apply the recipe and re-check.

---

## 17. Reference Implementations

When in doubt, copy from these files (they are canonical):

| Need | Reference |
|------|-----------|
| List page | `client/src/components/admin/corporate/CorporateCompanyTable.tsx` |
| List page (with collapsibles) | `client/src/components/admin/routes/RouteList.tsx` |
| Page shell + KPI row | `client/app/(admin)/admin/routes/page.tsx` |
| Detail page (full anatomy) | `client/app/(admin)/admin/corporate/invoices/[id]/page.tsx` |
| Nested table inside Card | `client/src/components/admin/routes/RouteDetailPanel.tsx` |
| Selection dialog | `client/src/components/admin/routes/AssignPartnerDialog.tsx` |
| Form dialog (success-toned) | `client/src/components/admin/corporate/MarkPaidDialog.tsx` |
| Form dialog (destructive-toned) | `client/src/components/admin/corporate/CancelOrderDialog.tsx` |
| Status transition dialog | `client/src/components/admin/corporate/UpdateStatusDialog.tsx` |
| Confirm AlertDialogs | `client/src/components/admin/routes/RouteList.tsx` (delete + complete) |
| Floating action bar | `client/src/components/admin/routes/BatchUpdateBar.tsx` |
| Status badge (dot + ring) | `client/src/components/admin/routes/RouteStatusBadge.tsx` |

---

Last updated: 2026-04-26 — keep this file in sync with the canonical references above whenever a pattern evolves.
