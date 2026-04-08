import { Users, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPermissionDetail } from '@/components/admin/permissions/UserPermissionDetail';
import { Can } from '@/components/Auth/can';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-[28px] font-extrabold uppercase tracking-tight text-primary sm:text-[32px] lg:text-[36px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            User Details
          </h1>
          <p
            className="mt-1 text-sm font-medium text-[#554243] sm:text-[15px] lg:text-[16px]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            View and manage user account details and permissions.
          </p>
        </div>
      </div>

      <Tabs defaultValue="permissions" className="space-y-6">
        <TabsList className="rounded-full bg-muted/60 p-1">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="permissions"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-5 rounded-2xl bg-muted mb-6">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2
              className="text-2xl font-bold mb-2 text-primary"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              User Profile
            </h2>
            <p className="text-muted-foreground mb-8 text-center">
              User profile details coming in Phase 4.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Can
            permission="permission:view"
            requireAll={false}
            fallback={
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-5 rounded-2xl bg-red-50 mb-6">
                  <Shield className="h-10 w-10 text-red-400" />
                </div>
                <h2
                  className="text-2xl font-bold mb-2 text-primary"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Access Restricted
                </h2>
                <p className="text-muted-foreground text-center">
                  You do not have permission to view this user&apos;s
                  permissions.
                </p>
              </div>
            }
          >
            <UserPermissionDetail userId={id} />
          </Can>
        </TabsContent>
      </Tabs>
    </div>
  );
}
