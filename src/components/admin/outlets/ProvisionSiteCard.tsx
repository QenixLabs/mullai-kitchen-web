'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

export function ProvisionSiteCard() {
  return (
    <Link
      href="/admin/outlets/create"
      className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 transition-colors hover:bg-[#f8f5f5]"
      style={{ borderColor: 'rgba(219,192,193,0.4)', minHeight: '320px' }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{ backgroundColor: '#44151c' }}
      >
        <Plus className="h-6 w-6 text-white" />
      </div>
      <h3
        className="text-lg font-bold"
        style={{ color: '#3d000c' }}
      >
        Expand Reach
      </h3>
      <p className="text-center text-sm" style={{ color: '#554243' }}>
        Setup a new kitchen or outlet
      </p>
      <span
        className="mt-1 text-xs font-bold uppercase tracking-wide"
        style={{ color: '#44151c' }}
      >
        PROVISION SITE
      </span>
    </Link>
  );
}
