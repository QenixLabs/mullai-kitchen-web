import { Users, Clock } from 'lucide-react';

export default function UsersPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            User Management
          </h1>
          <p
            className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Manage user accounts, roles, and access permissions across the
            platform.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <div className="p-5 rounded-2xl bg-muted mb-6">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2
          className="text-2xl font-bold mb-2 text-primary"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          User Management
        </h2>
        <p className="text-muted-foreground mb-8 text-center ">
          Full user listing and management features are coming in Phase 4.
          Navigate to individual user pages via{' '}
          <span className="font-semibold text-primary/80">
            /admin/users/[user-id]
          </span>{' '}
          to manage permissions.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-5 py-2 text-sm font-semibold text-amber-700">
          <Clock className="h-4 w-4" />
          Coming Soon
        </div>
      </div>
    </div>
  );
}
