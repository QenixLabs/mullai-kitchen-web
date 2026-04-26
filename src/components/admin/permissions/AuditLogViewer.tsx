'use client';

import { Fragment, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ScrollText,
  Settings,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { usePermissionAuditLogs } from '@/api/hooks/usePermissions';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const PAGE_SIZE = 10;

type ActionTone = 'info' | 'success' | 'destructive' | 'muted';

const ACTION_CONFIG: Record<
  string,
  { label: string; tone: ActionTone; icon: React.ElementType }
> = {
  role_permissions_updated: { label: 'Role Updated', tone: 'info', icon: Settings },
  user_permissions_granted: { label: 'Granted', tone: 'success', icon: ShieldCheck },
  user_permissions_revoked: { label: 'Revoked', tone: 'destructive', icon: ShieldOff },
};

const TONE_STYLES: Record<ActionTone, { ring: string; bg: string; dot: string }> = {
  info: {
    ring: 'border-info/20 bg-info/10 text-info',
    bg: 'bg-info/15 text-info',
    dot: 'bg-info',
  },
  success: {
    ring: 'border-success/20 bg-success/10 text-success',
    bg: 'bg-success/15 text-success',
    dot: 'bg-success',
  },
  destructive: {
    ring: 'border-destructive/20 bg-destructive/10 text-destructive',
    bg: 'bg-destructive/15 text-destructive',
    dot: 'bg-destructive',
  },
  muted: {
    ring: 'border-muted-foreground/20 bg-muted text-muted-foreground',
    bg: 'bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
  },
};

function ActionPill({ action }: { action: string }) {
  const config = ACTION_CONFIG[action] || {
    label: action,
    tone: 'muted' as ActionTone,
    icon: ScrollText,
  };
  const styles = TONE_STYLES[config.tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        styles.ring,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {config.label}
    </span>
  );
}

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function HeaderStrip({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
          <ScrollText className="h-3.5 w-3.5" />
        </span>
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          Permission Audit Log
        </h3>
        {total > 0 && (
          <span className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {count > 0 ? `${count} on this page · ${total} total` : `${total} total`}
          </span>
        )}
      </div>
    </div>
  );
}

export function AuditLogViewer() {
  const [offset, setOffset] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data, isLoading } = usePermissionAuditLogs({
    limit: PAGE_SIZE,
    offset,
  });

  const logs = data?.data || [];
  const total = data?.total || 0;
  const hasMore = offset + PAGE_SIZE < total;
  const start = offset + 1;
  const end = Math.min(offset + PAGE_SIZE, total);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd MMM yyyy · HH:mm');
    } catch {
      return new Date(dateStr).toLocaleString();
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={0} />
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (logs.length === 0) {
    return (
      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <HeaderStrip count={0} total={0} />
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <div className="rounded-full bg-muted p-3 text-muted-foreground">
              <ScrollText className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">No audit logs yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Audit log entries will appear here when permission changes are made.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardContent className="p-0">
        <HeaderStrip count={logs.length} total={total} />
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/70 bg-background hover:bg-background">
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  User
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </TableHead>
                <TableHead className="h-10 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </TableHead>
                <TableHead className="h-10 w-12 px-4 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => {
                const isLast = idx === logs.length - 1;
                const isExpanded = expandedRow === log._id;
                const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;
                return (
                  <Fragment key={log._id}>
                    <TableRow
                      className={cn(
                        'group cursor-pointer transition-colors hover:bg-accent/20',
                        !isLast && !isExpanded && 'border-b border-border/50',
                      )}
                      onClick={() => setExpandedRow(isExpanded ? null : log._id)}
                    >
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="tabular-nums">
                          {formatDate(log.created_at || log.timestamp)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold uppercase text-primary ring-1 ring-primary/15">
                            {getInitials(log.user_name)}
                          </span>
                          <span className="truncate text-sm font-semibold text-foreground">
                            {log.user_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <ActionPill action={log.action} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                        <span className="line-clamp-2">{log.description}</span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        {hasMetadata && (
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors group-hover:text-foreground">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                    {isExpanded && hasMetadata && (
                      <TableRow
                        className={cn('hover:bg-transparent', !isLast && 'border-b border-border/50')}
                      >
                        <TableCell colSpan={5} className="bg-muted/30 px-4 py-3">
                          <div className="rounded-md border border-border/60 bg-background p-3">
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Metadata
                            </p>
                            <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted-foreground">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-4 py-2.5 text-[11px] text-muted-foreground sm:flex-row">
          <span>
            Showing{' '}
            <span className="font-semibold tabular-nums text-foreground">
              {start}–{end}
            </span>{' '}
            of <span className="font-semibold tabular-nums text-foreground">{total}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="h-7 gap-1 px-2 text-[11px]"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="h-7 gap-1 px-2 text-[11px]"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
