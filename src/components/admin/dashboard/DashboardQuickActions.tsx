'use client';

import Link from 'next/link';
import { ChefHat, Route, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/Auth/can';

export function DashboardQuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Can permission="order:kitchen">
        <Button
          variant="outline"
          asChild
          className="h-9 gap-2 rounded-lg border-border/60 bg-background shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <Link href="/admin/kitchen-report">
            <ChefHat className="h-4 w-4" />
            Kitchen Report
          </Link>
        </Button>
      </Can>

      <Can permission="route:assign">
        <Button
          variant="outline"
          asChild
          className="h-9 gap-2 rounded-lg border-border/60 bg-background shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <Link href="/admin/routes">
            <Route className="h-4 w-4" />
            Generate Routes
          </Link>
        </Button>
      </Can>

      <Can permission={['corporate:view:any', 'corporate:view:outlet']} requireAll={false}>
        <Button
          variant="outline"
          asChild
          className="h-9 gap-2 rounded-lg border-border/60 bg-background shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <Link href="/admin/corporate/orders">
            <Briefcase className="h-4 w-4" />
            Corporate Orders
          </Link>
        </Button>
      </Can>

      <Can permission="outlet:view:any">
        <Button
          variant="outline"
          asChild
          className="h-9 gap-2 rounded-lg border-border/60 bg-background shadow-sm hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors"
        >
          <Link href="/admin/outlets">
            <Building2 className="h-4 w-4" />
            Manage Outlets
          </Link>
        </Button>
      </Can>
    </div>
  );
}
