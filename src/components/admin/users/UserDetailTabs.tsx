'use client';

import { Users, Shield, FileText, Package, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPermissionDetail } from '@/components/admin/permissions/UserPermissionDetail';
import { UserProfileTab } from '@/components/admin/users/UserProfileTab';
import { UserSubscriptionsTab } from '@/components/admin/users/UserSubscriptionsTab';
import { UserInvoicesTab } from '@/components/admin/users/UserInvoicesTab';
import { UserCorporateOrdersTab } from '@/components/admin/users/UserCorporateOrdersTab';
import { Can } from '@/components/Auth/can';
import { useAdminUser } from '@/api/hooks/useAdminUsers';
import { Skeleton } from '@/components/ui/skeleton';

interface UserDetailTabsProps {
  userId: string;
}

export function UserDetailTabs({ userId }: UserDetailTabsProps) {
  const { data: user, isLoading } = useAdminUser(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-lg rounded-full" />
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  const role = user?.role;

  // Don't render conditional tabs until we know the user's role
  if (!role) {
    return (
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="rounded-full bg-muted/60 p-1 flex-wrap h-auto gap-1">
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
          <UserProfileTab userId={userId} />
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
                <h2 className="text-2xl font-bold mb-2 text-primary" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Access Restricted
                </h2>
                <p className="text-muted-foreground text-center">
                  You do not have permission to view this user&apos;s permissions.
                </p>
              </div>
            }
          >
            <UserPermissionDetail userId={userId} />
          </Can>
        </TabsContent>
      </Tabs>
    );
  }
  const showSubscriptions = role === 'customer';
  const showInvoices = role === 'customer' || role === 'corporate';
  const showCorporateOrders = role === 'corporate';

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="rounded-full bg-muted/60 p-1 flex-wrap h-auto gap-1">
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
        {showSubscriptions && (
          <TabsTrigger
            value="subscriptions"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Package className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
        )}
        {showInvoices && (
          <TabsTrigger
            value="invoices"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        )}
        {showCorporateOrders && (
          <TabsTrigger
            value="corporate-orders"
            className="flex items-center gap-2 rounded-full px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Building2 className="h-4 w-4" />
            Corporate Orders
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="profile">
        <UserProfileTab userId={userId} />
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
          <UserPermissionDetail userId={userId} />
        </Can>
      </TabsContent>

      {showSubscriptions && (
        <TabsContent value="subscriptions">
          <UserSubscriptionsTab userId={userId} />
        </TabsContent>
      )}

      {showInvoices && (
        <TabsContent value="invoices">
          <UserInvoicesTab userId={userId} userRole={role ?? ''} />
        </TabsContent>
      )}

      {showCorporateOrders && (
        <TabsContent value="corporate-orders">
          <UserCorporateOrdersTab userId={userId} />
        </TabsContent>
      )}
    </Tabs>
  );
}
