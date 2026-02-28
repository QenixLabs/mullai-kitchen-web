import { CalendarDays, IndianRupee, MapPin, UtensilsCrossed } from "lucide-react";

import type { PlanBrowseItem } from "@/api/types/customer.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export interface PlanSummaryProps {
  plan: PlanBrowseItem | null;
  checkedPincode?: string | null;
  sourceRoute?: string | null;
  className?: string;
}

export function PlanSummary({
  plan,
  checkedPincode = null,
  sourceRoute = null,
  className,
}: PlanSummaryProps) {
  if (!plan) {
    return (
      <Card className={cn("border-dashed border-border bg-accent/70 py-5", className)}>
        <CardHeader className="px-5 pb-0 sm:px-6">
          <CardTitle className="text-base font-semibold text-foreground">Plan summary unavailable</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-5 text-sm text-muted-foreground sm:px-6">
          <p>Select a plan from the plans page to continue checkout.</p>
          <p className="text-xs text-muted-foreground">Coming soon in Phase 2: restore plan from checkout preview API.</p>
        </CardContent>
      </Card>
    );
  }

  const subtotal = plan.price;
  const convenienceFee = 0;
  const total = subtotal + convenienceFee;

  return (
    <Card className={cn("border-gray-200 bg-white py-5 shadow-sm", className)}>
      <CardHeader className="space-y-3 px-5 pb-0 sm:px-6">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Selected Plan</p>
          <CardTitle className="text-lg font-bold text-foreground">{plan.name}</CardTitle>
          {plan.description ? <p className="text-sm text-muted-foreground">{plan.description}</p> : null}
        </div>

        <div className="rounded-lg border border-primary/10 bg-primary/10 p-3">
          <div className="flex items-center justify-between gap-3 text-sm text-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              Duration
            </span>
            <span className="font-semibold text-foreground">{plan.duration}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-5 sm:px-6">
        <section className="space-y-2" aria-label="Meals included">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <UtensilsCrossed className="h-4 w-4 text-primary" aria-hidden="true" />
            Meals included
          </p>
          {plan.meals_included.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {plan.meals_included.map((meal) => (
                <li key={`${plan._id}-${meal}`} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {meal}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Meal details will be available in the checkout preview soon.</p>
          )}
        </section>

        <section className="space-y-3 rounded-lg border border-muted bg-muted/70 p-3" aria-label="Price breakdown">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <IndianRupee className="h-4 w-4 text-primary" aria-hidden="true" />
            Price breakdown
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Plan subtotal</span>
              <span className="font-medium text-foreground">{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Convenience fee</span>
              <span className="font-medium text-foreground">{currencyFormatter.format(convenienceFee)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span>Total payable</span>
              <span>{currencyFormatter.format(total)}</span>
            </div>
          </div>
        </section>

        {checkedPincode || sourceRoute ? (
          <section className="space-y-1 rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground" aria-label="Selection context">
            <p className="font-semibold uppercase tracking-wide text-foreground">Plan intent context</p>
            {checkedPincode ? (
              <p className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Checked pincode: <span className="font-semibold text-foreground">{checkedPincode}</span>
              </p>
            ) : null}
            {sourceRoute ? (
              <p>
                Source route: <span className="font-semibold text-foreground">{sourceRoute}</span>
              </p>
            ) : null}
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
