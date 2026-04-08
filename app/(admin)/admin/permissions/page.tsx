import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolePermissionEditor } from '@/components/admin/permissions/RolePermissionEditor';
import { AuditLogViewer } from '@/components/admin/permissions/AuditLogViewer';
import { Shield, ScrollText } from 'lucide-react';

export default function PermissionsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Permission Management
          </h1>
          <p
            className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Configure roles and permissions for different user types and access
            levels.
          </p>
        </div>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="rounded-full bg-muted/60 p-1">
          <TabsTrigger
            value="roles"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <ScrollText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RolePermissionEditor />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
