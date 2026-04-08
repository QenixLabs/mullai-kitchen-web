import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface WidgetContainerProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export function WidgetContainer({
  title,
  icon: Icon,
  children,
  loading = false,
  className,
  action,
}: WidgetContainerProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
