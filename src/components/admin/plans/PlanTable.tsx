'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';
import { cn } from '@/lib/utils';
import { PlanStatus, MealType } from '@/api/types/admin-subscription.types';
import type { Plan } from '@/api/types/admin-subscription.types';

interface PlanTableProps {
  data: Plan[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (plan: Plan) => void;
  onStatusChange: (plan: Plan, status: PlanStatus) => void;
}

function StatusBadge({ status }: { status: PlanStatus }) {
  const configs: Record<string, { label: string; bg: string; color: string }> = {
    [PlanStatus.PUBLISHED]: { label: 'Published', bg: 'rgba(0,153,15,0.12)', color: '#00990f' },
    [PlanStatus.DRAFT]: { label: 'Draft', bg: 'rgba(219,192,193,0.22)', color: '#554243' },
    [PlanStatus.ARCHIVED]: { label: 'Archived', bg: 'rgba(68,21,28,0.08)', color: '#44151c' },
  };
  const c = configs[status] || configs[PlanStatus.DRAFT];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function DurationBadge({ duration }: { duration: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: 'rgba(68,21,28,0.06)', color: '#44151c' }}
    >
      {duration}
    </span>
  );
}

function formatMeals(meals: MealType[]): string {
  return meals.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
}

export function PlanTable({ data, isLoading, page, totalPages, onPageChange, onDelete, onStatusChange }: PlanTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#44151c] border-t-transparent" />
        <p className="mt-3 text-sm" style={{ color: '#554243' }}>Loading plans...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full p-4 mb-3" style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}>
          <Eye className="h-6 w-6" style={{ color: '#44151c' }} />
        </div>
        <p className="text-sm font-semibold" style={{ color: '#3d000c' }}>No plans found</p>
        <p className="text-xs mt-1" style={{ color: '#554243' }}>Create a new plan to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl bg-white" style={{ border: '1px solid rgba(219,192,193,0.2)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(219,192,193,0.2)' }}>
                {['Plan', 'Duration', 'Meals', 'Price', 'Status', 'Subscribers', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: '#554243' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((plan, idx) => (
                <tr
                  key={plan._id}
                  style={{
                    borderBottom:
                      idx < data.length - 1 ? '1px solid rgba(219,192,193,0.15)' : 'none',
                  }}
                  className="transition-colors hover:bg-[rgba(68,21,28,0.02)]"
                >
                  {/* Plan */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {plan.image_url ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl shrink-0">
                          <Image src={plan.image_url} alt={plan.name} fill unoptimized className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 text-xs font-bold"
                          style={{ backgroundColor: 'rgba(68,21,28,0.06)', color: '#44151c' }}
                        >
                          {plan.name.charAt(0)}
                        </div>
                      )}
                      <Link
                        href={`/admin/plans/${plan._id}`}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: '#3d000c' }}
                      >
                        {plan.name}
                      </Link>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <DurationBadge duration={plan.duration} />
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: '#554243' }}>
                      {formatMeals(plan.meals_included)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm font-bold" style={{ color: '#3d000c' }}>
                      ₹{plan.price.toLocaleString()}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={plan.status} />
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm" style={{ color: '#554243' }}>
                      {plan.current_subscribers}
                      {plan.max_subscribers ? ` / ${plan.max_subscribers}` : ''}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-[#554243] hover:text-[#44151c] hover:bg-[rgba(68,21,28,0.06)]"
                        asChild
                      >
                        <Link href={`/admin/plans/${plan._id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Can permission="plan:edit:global">
                        {plan.status === PlanStatus.DRAFT && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wide px-3"
                            style={{ backgroundColor: 'rgba(0,153,15,0.08)', color: '#00990f' }}
                            onClick={() => onStatusChange(plan, PlanStatus.PUBLISHED)}
                          >
                            Publish
                          </Button>
                        )}
                        {plan.status === PlanStatus.PUBLISHED && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 rounded-full text-[10px] font-bold uppercase tracking-wide px-3"
                            style={{ backgroundColor: 'rgba(68,21,28,0.08)', color: '#44151c' }}
                            onClick={() => onStatusChange(plan, PlanStatus.ARCHIVED)}
                          >
                            Archive
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-[#554243] hover:text-[#ff0004] hover:bg-[rgba(255,0,4,0.08)]"
                          onClick={() => onDelete(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: '#554243' }}>
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="rounded-lg border-[rgba(219,192,193,0.3)] bg-white text-[#554243] hover:bg-[#f8f5f5] hover:text-[#44151c]"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
