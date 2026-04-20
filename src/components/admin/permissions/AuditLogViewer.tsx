'use client';

import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2, ScrollText } from 'lucide-react';
import { usePermissionAuditLogs } from '@/api/hooks/usePermissions';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 10;

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getActionPill = (action: string) => {
    const config: Record<string, { label: string; bg: string }> = {
      role_permissions_updated: {
        label: 'Role Updated',
        bg: 'bg-blue-500 text-white',
      },
      user_permissions_granted: {
        label: 'Granted',
        bg: 'bg-emerald-500 text-white',
      },
      user_permissions_revoked: {
        label: 'Revoked',
        bg: 'bg-red-500 text-white',
      },
    };
    const pill = config[action] || { label: action, bg: 'bg-muted text-muted-foreground' };
    return (
      <span className={`inline-flex items-center px-4 py-1.5 rounded-[9px] text-xs font-semibold ${pill.bg}`}>
        {pill.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#F8F2F3' }}>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-36 rounded-xl" />
                <Skeleton className="h-5 w-24 rounded-xl" />
                <Skeleton className="h-7 w-24 rounded-[9px]" />
                <Skeleton className="h-5 w-40 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="p-5 rounded-2xl bg-muted mb-6">
          <ScrollText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2
          className="text-2xl font-bold mb-2 text-primary"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          No Audit Logs
        </h2>
        <p className="text-muted-foreground text-center">
          Audit log entries will appear here when permission changes are made.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="rounded-xl overflow-x-auto" style={{ backgroundColor: '#F8F2F3' }}>
        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: '#FFFFFF' }}>
              <TableHead className="text-sm font-semibold text-primary">Date</TableHead>
              <TableHead className="text-sm font-semibold text-primary">User</TableHead>
              <TableHead className="text-sm font-semibold text-primary">Action</TableHead>
              <TableHead className="text-sm font-semibold text-primary">Description</TableHead>
              <TableHead className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <Fragment key={log._id}>
                <TableRow
                  className="cursor-pointer transition-colors hover:bg-white/60"
                  onClick={() => setExpandedRow(expandedRow === log._id ? null : log._id)}
                >
                  <TableCell className="py-5 text-sm text-primary/70">
                    {formatDate(log.created_at || log.timestamp)}
                  </TableCell>
                  <TableCell className="py-5 font-bold text-primary">
                    {log.user_name}
                  </TableCell>
                  <TableCell className="py-5">
                    {getActionPill(log.action)}
                  </TableCell>
                  <TableCell className="py-5 text-sm text-primary/70">
                    {log.description}
                  </TableCell>
                  <TableCell className="py-5">
                    {log.metadata && Object.keys(log.metadata).length > 0 &&
                      (expandedRow === log._id ? (
                        <ChevronUp className="h-4 w-4 text-primary/50" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-primary/50" />
                      ))}
                  </TableCell>
                </TableRow>
                {expandedRow === log._id && log.metadata && (
                  <TableRow>
                    <TableCell colSpan={5} className="bg-white/50">
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="max-h-40 overflow-auto rounded-xl bg-white/80 p-4 m-2"
                      >
                        <pre className="text-xs font-mono text-primary/70 whitespace-pre-wrap">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Showing{' '}
          <span className="font-bold text-primary">{offset + 1}</span>
          {' - '}
          <span className="font-bold text-primary">{Math.min(offset + PAGE_SIZE, total)}</span>
          {' of '}
          <span className="font-bold text-primary">{total}</span>
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            className="rounded-full border-border/60 px-4 font-semibold hover:bg-muted/60"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => setOffset(offset + PAGE_SIZE)}
            className="rounded-full border-border/60 px-4 font-semibold hover:bg-muted/60"
          >
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
