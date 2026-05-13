'use client';

import { useCallback } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Can } from '@/components/Auth/can';

function serializeToCSV(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          if (val == null) return '';
          const str = String(val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(','),
    ),
  ];
  return csvRows.join('\n');
}

function triggerDownload(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ReportExportButtonProps {
  data: Array<Record<string, unknown>>;
  filename?: string;
}

export function ReportExportButton({
  data,
  filename = 'report',
}: ReportExportButtonProps) {
  const handleCSV = useCallback(() => {
    const csv = serializeToCSV(data);
    triggerDownload(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }, [data, filename]);

  const handlePDF = useCallback(() => {
    window.print();
  }, []);

  return (
    <Can permission="report:export">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-9 gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCSV} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Download CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePDF} className="gap-2">
            <FileText className="h-4 w-4" />
            Print / PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Can>
  );
}
