'use client';

import { useState } from 'react';
import {
  Copy,
  MoreVertical,
  Building2,
  UtensilsCrossed,
  Clock,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TemplateSummary } from '@/api/types/menu.types';

interface TemplateCardProps {
  template: TemplateSummary;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function TemplateCard({
  template,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: TemplateCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onDuplicate(template._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="flex flex-col gap-4 rounded-3xl bg-white p-5"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      {/* Top Row: Badge + Actions */}
      <div className="flex items-start justify-between">
        <span
          className="rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor:
              template.status === 'active'
                ? 'rgba(0,153,15,0.12)'
                : 'rgba(85,66,67,0.1)',
            color:
              template.status === 'active' ? '#00990f' : '#554243',
          }}
        >
          {template.status === 'active' ? 'ACTIVE' : 'DRAFT'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#554243] transition-colors hover:bg-[#f8f5f5]"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#554243] transition-colors hover:bg-[#f8f5f5]">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => onView(template._id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(template._id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(template._id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Template Name */}
      <h3
        className="text-xl font-bold"
        style={{ color: '#3d000c', lineHeight: '28px' }}
      >
        {template.name}
      </h3>

      {/* Meta Info */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm" style={{ color: '#554243' }}>
          <Building2 className="h-4 w-4 shrink-0" />
          <span>{template.scope}</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#554243' }}>
          <UtensilsCrossed className="h-4 w-4 shrink-0" />
          <span>{template.mealsMapped} Meals Mapped</span>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: '#554243' }}>
          <Clock className="h-4 w-4 shrink-0" />
          <span>Updated: {template.updatedAt}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onView(template._id)}
            className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-70"
            style={{ color: '#44151c' }}
          >
            VIEW
          </button>
          <button
            onClick={() => onEdit(template._id)}
            className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-70"
            style={{ color: '#44151c' }}
          >
            EDIT
          </button>
        </div>
        <button
          onClick={() => onDelete(template._id)}
          className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-70"
          style={{ color: '#ff0004' }}
        >
          DELETE
        </button>
      </div>
    </div>
  );
}
