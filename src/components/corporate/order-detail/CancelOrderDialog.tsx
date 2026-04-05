"use client";

import { Loader2, AlertTriangle, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  reason: string;
  onReasonChange: (val: string) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderId,
  reason,
  onReasonChange,
  onConfirm,
  isPending,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl overflow-hidden">
        {/* Destructive accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-destructive" />

        <DialogHeader className="pt-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                Cancel Order?
              </DialogTitle>
              <DialogDescription className="text-sm mt-1">
                This action cannot be undone. Order{" "}
                <span className="font-semibold text-foreground">{orderId}</span>{" "}
                will be permanently cancelled. Any meals already delivered will be
                billed separately.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-sm font-medium">
              Reason for cancellation <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="cancel-reason"
              placeholder="Please provide a reason..."
              rows={3}
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onReasonChange("");
            }}
            disabled={isPending}
            className="rounded-xl h-10 px-5"
          >
            Keep Order
          </Button>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            variant="destructive"
            className="rounded-xl h-10 px-5 shadow-md shadow-destructive/20 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Cancelling...
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-1.5" />
                Yes, Cancel Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
