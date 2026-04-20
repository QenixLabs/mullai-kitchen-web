import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RolePermissionEditor } from '@/components/admin/permissions/RolePermissionEditor';
import { AuditLogViewer } from '@/components/admin/permissions/AuditLogViewer';
import { AdminPageHeader } from '@/components/admin/layout/AdminPageHeader';
import { Shield, ScrollText, FileSpreadsheet } from 'lucide-react';

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="MANAGE PERMISSIONS"
        subtitle="Configure roles and permissions for different roles and levels"
      >
        <button
          className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/80"
          style={{
            borderColor: 'rgba(219,192,193,0.4)',
            color: '#44151c',
            backgroundColor: 'rgba(255,255,255,0.6)',
          }}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Audit Logs
        </button>
      </AdminPageHeader>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList
          className="flex flex-wrap h-auto rounded-full bg-white/60 p-1 gap-1"
          style={{ border: '1px solid rgba(219,192,193,0.2)' }}
        >
          <TabsTrigger
            value="roles"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#44151c] data-[state=active]:to-[#44151c]/80 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Role Permissions
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#44151c] data-[state=active]:to-[#44151c]/80 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            <ScrollText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RolePermissionEditor />
        </TabsContent>

        <TabsContent value="audit">
          <div
            className="rounded-xl bg-white p-6"
            style={{ border: '1px solid rgba(219,192,193,0.2)' }}
          >
            <AuditLogViewer />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
