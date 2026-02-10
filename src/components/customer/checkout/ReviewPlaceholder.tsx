import { BadgeCheck, ClipboardList } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ReviewPlaceholderProps {
  className?: string;
}

export function ReviewPlaceholder({ className }: ReviewPlaceholderProps) {
  return (
    <Card className={cn("border-gray-200 bg-white py-5 shadow-sm", className)}>
      <CardHeader className="space-y-3 px-5 pb-0 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
          Step 3: Review
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-gray-900">Checkout review is coming soon</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5 sm:px-6">
        <p className="text-sm leading-relaxed text-gray-600">
          Coming soon in Phase 2: review your plan, address, start date, and payable amount before proceeding to payment.
        </p>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <BadgeCheck className="h-4 w-4 text-orange-600" aria-hidden="true" />
            Planned enhancements
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
            <li>One-click final confirmation with order summary</li>
            <li>Applied discounts and offer visibility</li>
            <li>Payment handoff readiness checks</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
