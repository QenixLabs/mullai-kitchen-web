import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolePermissionEditor } from '@/components/admin/permissions/RolePermissionEditor';
import { AuditLogViewer } from '@/components/admin/permissions/AuditLogViewer';
import { ShieldCheck, ScrollText } from 'lucide-react';

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Permission Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure roles, individual overrides, and review the audit trail.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-5">
        <TabsList className="inline-flex h-9 items-center rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger
            value="roles"
            className="inline-flex h-7 items-center gap-1.5 rounded-sm px-3 text-[11px] font-semibold uppercase tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="inline-flex h-7 items-center gap-1.5 rounded-sm px-3 text-[11px] font-semibold uppercase tracking-wide transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <ScrollText className="h-3.5 w-3.5" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-0">
          <RolePermissionEditor />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
