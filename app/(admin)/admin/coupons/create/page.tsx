'use client';

import { TicketPercent } from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { CouponForm } from '@/components/admin/coupons/CouponForm';

export default function CreateCouponPage() {
  return (
    <Can
      permission="coupon:manage"
      fallback={
        <div className="py-8 text-center text-muted-foreground">
          You do not have permission to create coupons.
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <TicketPercent className="h-4.5 w-4.5" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Create Coupon
              </h1>
              <p className="text-sm text-muted-foreground">
                Define a new discount coupon
              </p>
            </div>
          </div>
        </div>
        <CouponForm />
      </div>
    </Can>
  );
}
