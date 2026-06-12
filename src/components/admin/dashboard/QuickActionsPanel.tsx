import Link from "next/link";
import { Can } from "@/components/Auth/can";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Shield,
  Route,
} from "lucide-react";

interface QuickAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string | string[];
  requireAll?: boolean;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: "+ New Outlet",
    href: "/admin/outlets/create",
    icon: Plus,
    permission: "outlet:create",
  },
  {
    label: "Manage Permissions",
    href: "/admin/permissions",
    icon: Shield,
    permission: "permission:view",
  },
  {
    label: "Generate Routes",
    href: "/admin/routes",
    icon: Route,
    permission: "route:generate",
  },
];

export function QuickActionsPanel() {
  return (
    <div className="flex flex-wrap gap-3">
    {QUICK_ACTIONS.map((action) => (
        <Can
          key={action.label}
          permission={action.permission}
          requireAll={action.requireAll ?? true}
        >
          <Link href={action.href}>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          </Link>
        </Can>
      ))}
    </div>
  );
}
