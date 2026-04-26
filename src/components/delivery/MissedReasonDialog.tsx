"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 500;

interface MissedReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  isPending?: boolean;
  /** Optional context about which order is being marked, shown in the body. */
  orderLabel?: string;
}

/**
 * Modal that prompts the delivery partner for a free-form failure reason
 * before marking an order as missed. The reason must be 5–500 chars.
 *
 * NOTE: callers are expected to remount the dialog (via React `key`) when
 * the target order changes so the textarea reliably resets — this keeps the
 * dialog free of `setState`-inside-effect patterns flagged by React Compiler.
 */
export function MissedReasonDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  orderLabel,
}: MissedReasonDialogProps) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
    }
    onOpenChange(next);
  };

  const trimmed = reason.trim();
  const isValid =
    trimmed.length >= MIN_REASON_LENGTH && trimmed.length <= MAX_REASON_LENGTH;

  const handleSubmit = () => {
    if (!isValid || isPending) return;
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[28rem]">
        <DialogHeader>
          <DialogTitle>Mark as missed</DialogTitle>
          <DialogDescription>
            {orderLabel
              ? `Tell us why ${orderLabel} could not be delivered.`
              : "Tell us why this order could not be delivered."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. Customer not reachable after 3 calls, address inaccessible..."
            maxLength={MAX_REASON_LENGTH}
            rows={4}
            disabled={isPending}
            aria-label="Failure reason"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Minimum {MIN_REASON_LENGTH} characters required.
            </span>
            <span>
              {trimmed.length}/{MAX_REASON_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
          >
            {isPending ? "Submitting..." : "Mark as missed"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
