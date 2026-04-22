import { MapPin } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Settings"
        subtitle="Configure system-wide settings, integrations, and application preferences."
      />

      <div
        className="rounded-3xl bg-white p-6"
        style={{ border: '1px solid rgba(219,192,193,0.2)' }}
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full mb-4"
            style={{ background: 'linear-gradient(135deg, #3d000c 0%, #5d101d 100%)' }}
          >
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            This feature is currently under development. Check back soon for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
