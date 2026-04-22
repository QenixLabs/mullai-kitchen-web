'use client';

import Link from 'next/link';
import { MapPin, Pencil, ChefHat, Flame, Bike, Cookie } from 'lucide-react';
import type { Outlet } from '@/api/outlet.api';

const ICONS = [ChefHat, Flame, Bike, Cookie];

interface OutletCardProps {
  outlet: Outlet;
  index: number;
}

export function OutletCard({ outlet, index }: OutletCardProps) {
  const Icon = ICONS[index % ICONS.length];
  const isActive = outlet.status === 'active';

  return (
    <div
      className="flex flex-col gap-4 rounded-3xl bg-white p-5"
      style={{ border: '1px solid rgba(219,192,193,0.2)' }}
    >
      {/* Top Row: Icon + Status */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(68,21,28,0.06)' }}
        >
          <Icon className="h-5 w-5" style={{ color: '#44151c' }} />
        </div>
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide"
          style={{
            backgroundColor: isActive
              ? 'rgba(0,153,15,0.12)'
              : 'rgba(255,0,4,0.12)',
            color: isActive ? '#00990f' : '#ff0004',
          }}
        >
          {isActive ? 'Operational' : 'Limited'}
        </span>
      </div>

      {/* Name + Address */}
      <div>
        <h3
          className="text-xl font-bold"
          style={{ color: '#3d000c', lineHeight: '28px' }}
        >
          {outlet.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 text-sm" style={{ color: '#554243' }}>
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {outlet.address}
            {outlet.city ? `, ${outlet.city}` : ''}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid rgba(219,192,193,0.2)' }} />

      {/* Capacity + Manager */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: '#554243' }}
          >
            CAPACITY
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: '#3d000c' }}>
            {outlet.kitchen_capacity?.toLocaleString() ?? '800'} / day
          </p>
        </div>
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-wide"
            style={{ color: '#554243' }}
          >
            MANAGER
          </p>
          <p className="mt-1 text-lg font-bold" style={{ color: '#3d000c' }}>
            {outlet.manager || 'TBD'}
          </p>
        </div>
      </div>

      {/* Manage Button */}
      <Link
        href={`/admin/outlets/${outlet._id}`}
        className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors hover:opacity-90"
        style={{
          backgroundColor: 'rgba(68,21,28,0.06)',
          color: '#44151c',
        }}
      >
        <Pencil className="h-4 w-4" />
        Manage Outlet
      </Link>
    </div>
  );
}
