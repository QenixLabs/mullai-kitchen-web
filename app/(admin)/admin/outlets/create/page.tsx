'use client';

import { Store } from 'lucide-react';
import { Can } from '@/components/Auth/can';
import { OutletCreationWizard } from '@/components/admin/outlets/OutletCreationWizard';

export default function CreateOutletPage() {
  return (
    <Can
      permission="outlet:create"
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-5 rounded-xl bg-destructive/10 mb-6">
            <Store className="h-10 w-10 text-destructive" />
          </div>
          <h2
            className="text-2xl font-bold mb-2 text-primary"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Access Restricted
          </h2>
          <p className="text-muted-foreground text-center">
            You do not have permission to create outlets.
          </p>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Create Outlet
          </h1>
          <p
            className="mt-1 text-sm font-medium text-muted-foreground sm:text-[15px] lg:text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Add a new kitchen outlet with location, operational details, and delivery zones.
          </p>
        </div>

        <OutletCreationWizard />
      </div>
    </Can>
  );
}
