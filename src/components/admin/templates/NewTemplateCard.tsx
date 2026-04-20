'use client';

import { Plus } from 'lucide-react';

interface NewTemplateCardProps {
  onClick: () => void;
}

export function NewTemplateCard({ onClick }: NewTemplateCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6 sm:p-8 transition-colors hover:bg-[#f8f5f5]"
      style={{ borderColor: 'rgba(219,192,193,0.4)', minHeight: '220px' }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(68,21,28,0.08)' }}
      >
        <Plus className="h-5 w-5" style={{ color: '#44151c' }} />
      </div>
      <span
        className="text-sm font-bold uppercase tracking-wide"
        style={{ color: '#3d000c' }}
      >
        NEW TEMPLATE
      </span>
      <span className="text-xs" style={{ color: '#554243' }}>
        Build from scratch
      </span>
    </button>
  );
}
