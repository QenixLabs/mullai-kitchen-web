'use client';

import { motion } from 'motion/react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  Users,
  UtensilsCrossed,
  CreditCard,
  FileText,
  Truck,
  BarChart3,
  Settings,
  KeyRound,
  Store,
  ClipboardList,
  ScrollText,
} from 'lucide-react';

export interface PermissionCategory {
  key: string;
  label: string;
  order: number;
  permissions: { key: string; label: string }[];
}

export const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'outlet-management': Store,
  'user-management': Users,
  'menu-recipes': UtensilsCrossed,
  'subscriptions-plans': CreditCard,
  'invoices': FileText,
  'orders-delivery': ClipboardList,
  'reports-analytics': BarChart3,
  'system-configuration': Settings,
  'permission-management': KeyRound,
};

const CATEGORY_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; subtitle: string }
> = {
  'outlet-management': { icon: Store, subtitle: 'Manage kitchen locations' },
  'user-management': { icon: Users, subtitle: 'Identity & Access' },
  'menu-recipes': { icon: UtensilsCrossed, subtitle: 'Menu & Recipes' },
  'subscriptions-plans': { icon: CreditCard, subtitle: 'Billing & Plans' },
  'invoices': { icon: FileText, subtitle: 'Invoicing' },
  'orders-delivery': { icon: ClipboardList, subtitle: 'Flow & Execution' },
  'reports-analytics': { icon: BarChart3, subtitle: 'Data visibility thresholds' },
  'system-configuration': { icon: Settings, subtitle: 'System settings' },
  'permission-management': { icon: KeyRound, subtitle: 'Access control' },
};

interface PermissionMatrixProps {
  categories: PermissionCategory[];
  permissions: Set<string>;
  onChange: (permissions: Set<string>) => void;
  readOnly?: boolean;
}

export function PermissionMatrix({
  categories,
  permissions,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const togglePermission = (key: string) => {
    if (readOnly) return;
    const next = new Set(permissions);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(next);
  };

  const sorted = [...categories].sort((a, b) => a.order - b.order);

  // Determine which cards span full width (reports-analytics or cards with > 4 permissions)
  const standardCards = sorted.filter(
    (c) => c.key !== 'reports-analytics' && c.permissions.length <= 4,
  );
  const wideCards = sorted.filter(
    (c) => c.key === 'reports-analytics' || c.permissions.length > 4,
  );

  const renderCard = (category: PermissionCategory, isWide: boolean) => {
    const meta = CATEGORY_META[category.key] || {
      icon: Shield,
      subtitle: category.label,
    };
    const Icon = meta.icon;

    return (
      <motion.div
        key={category.key}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: category.order * 0.05 }}
        className="flex flex-col gap-5 rounded-xl bg-white p-6"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        {/* Card Header */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}
          >
            <Icon className="h-5 w-5" style={{ color: '#44151c' }} />
          </div>
          <div>
            <h3
              className="text-base font-bold"
              style={{ color: '#3d000c', lineHeight: '22px' }}
            >
              {category.label}
            </h3>
            <p className="text-xs" style={{ color: '#554243' }}>
              {meta.subtitle}
            </p>
          </div>
        </div>

        {/* Permissions */}
        <div
          className={isWide ? 'grid grid-cols-1 gap-3 sm:grid-cols-2' : 'flex flex-col gap-3'}
        >
          {category.permissions.map((perm) => {
            const isChecked = permissions.has(perm.key);
            return (
              <label
                key={perm.key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-[rgba(68,21,28,0.03)]"
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: isChecked ? '#3d000c' : '#554243' }}
                >
                  {perm.label}
                </span>
                <CustomCheckbox
                  checked={isChecked}
                  onCheckedChange={() => togglePermission(perm.key)}
                  disabled={readOnly}
                />
              </label>
            );
          })}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Standard cards - 1 col mobile, 2 tablet, 3 desktop */}
      {standardCards.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {standardCards.map((cat) => renderCard(cat, false))}
        </div>
      )}

      {/* Wide cards - full width, scroll on mobile */}
      {wideCards.length > 0 && (
        <div className="flex flex-col gap-5">
          {wideCards.map((cat) => (
            <div key={cat.key} className="overflow-x-auto">
              {renderCard(cat, true)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Custom checkbox matching Figma dark burgundy style */
function CustomCheckbox({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onCheckedChange}
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#44151c] focus-visible:ring-offset-2"
      style={{
        backgroundColor: checked ? '#44151c' : 'transparent',
        border: checked ? '2px solid #44151c' : '2px solid rgba(219,192,193,0.5)',
      }}
    >
      {checked && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
