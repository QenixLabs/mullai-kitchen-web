"use client";

import { IndianRupee, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/corporate/format";
import type { ICorporateOrderModification } from "@/api/types/corporate.types";

interface ModificationsTabProps {
  modifications: ICorporateOrderModification[];
}

export function ModificationsTab({ modifications }: ModificationsTabProps) {
  const totalCredit = modifications.reduce(
    (sum, mod) => sum + mod.credit_amount,
    0
  );

  return (
    <div className="relative rounded-2xl bg-card border border-border shadow-sm">
      <div className="p-6">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-primary" />
            Modifications History
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {modifications.length} modification
            {modifications.length !== 1 ? "s" : ""} recorded
          </p>
        </div>

        {/* Summary */}
        {modifications.length > 0 && (
          <div className="bg-success/5 border border-success/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-success">
              <IndianRupee className="h-4 w-4" />
              <span className="text-sm font-medium">
                Total Credit from Modifications:{" "}
                <strong className="text-lg">
                  <IndianRupee className="h-3 w-3 inline" />
                  {totalCredit.toLocaleString("en-IN")}
                </strong>
              </span>
            </div>
          </div>
        )}

        {modifications.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Veg Reduction</TableHead>
                <TableHead className="text-right">Non-veg Reduction</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modifications.map((mod) => (
                <TableRow key={mod._id}>
                  <TableCell className="font-medium">
                    {formatDate(mod.modification_date)}
                  </TableCell>
                  <TableCell className="text-right text-success">
                    -{mod.veg_reduction}
                  </TableCell>
                  <TableCell className="text-right text-warning">
                    -{mod.nonveg_reduction}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <IndianRupee className="h-3 w-3 inline" />
                    {mod.credit_amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        mod.status === "approved"
                          ? "default"
                          : mod.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {mod.status.charAt(0).toUpperCase() +
                        mod.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {mod.reason || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <History className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No modifications have been made
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
