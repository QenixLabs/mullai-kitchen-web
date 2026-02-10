import { Home, MapPinned } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface AddressPlaceholderProps {
  className?: string;
}

export function AddressPlaceholder({ className }: AddressPlaceholderProps) {
  return (
    <Card className={cn("border-gray-200 bg-white py-5 shadow-sm", className)}>
      <CardHeader className="space-y-3 px-5 pb-0 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          <MapPinned className="h-3.5 w-3.5" aria-hidden="true" />
          Step 1: Delivery Address
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-gray-900">Address selection is coming soon</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 px-5 sm:px-6">
        <p className="text-sm leading-relaxed text-gray-600">
          Coming soon in Phase 2: choose a saved address or add a new one during checkout.
        </p>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Home className="h-4 w-4 text-orange-600" aria-hidden="true" />
            Planned enhancements
          </p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
            <li>Use your default address from onboarding automatically</li>
            <li>Switch between saved Home or Office addresses</li>
            <li>Live serviceability check before order confirmation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
