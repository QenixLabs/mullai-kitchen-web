"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Shield, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChangePassword } from "@/api/hooks/useChangePassword";
import { toast } from "sonner";

const MIN_PASSWORD_LENGTH = 8;

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(
        MIN_PASSWORD_LENGTH,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
      ),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New passwords do not match",
    path: ["confirm_password"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PasswordRequirement({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
          met ? "bg-emerald-500" : "bg-border"
        }`}
      >
        {met && <Check className="h-2.5 w-2.5 text-white" />}
      </div>
      <span
        className={`text-xs font-medium transition-colors ${
          met ? "text-emerald-600" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const changePassword = useChangePassword();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = form.watch("new_password");

  const requirements = [
    {
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      met: (newPassword || "").length >= MIN_PASSWORD_LENGTH,
    },
    {
      label: "Contains an uppercase letter",
      met: /[A-Z]/.test(newPassword || ""),
    },
    {
      label: "Contains a lowercase letter",
      met: /[a-z]/.test(newPassword || ""),
    },
    {
      label: "Contains a number",
      met: /\d/.test(newPassword || ""),
    },
  ];

  const allRequirementsMet = requirements.every((r) => r.met);

  useEffect(() => {
    if (open) {
      form.reset({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open, form]);

  const isPending = changePassword.isPending;

  const handleSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(
      {
        old_password: values.current_password,
        new_password: values.new_password,
      },
      {
        onSuccess: (data) => {
          toast.success(data.message || "Password changed successfully");
          onOpenChange(false);
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || error?.message || "Failed to change password";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-card rounded-4xl border border-border/50 shadow-2xl p-8 overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

          <DialogHeader className="mb-8 text-left relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                Change Password
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs font-bold text-muted-foreground leading-relaxed">
              Update your account password. You will need to enter your
              current password to confirm the change.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 relative z-10"
          >
            {/* Current Password */}
            <div className="space-y-2">
              <Label
                htmlFor="current-pw"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Current Password *
              </Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pr-12"
                  {...form.register("current_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.current_password && (
                <p className="text-xs text-destructive ml-1">
                  {form.formState.errors.current_password.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="new-pw"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                New Password *
              </Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pr-12"
                  {...form.register("new_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.new_password && (
                <p className="text-xs text-destructive ml-1">
                  {form.formState.errors.new_password.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            {(newPassword || "").length > 0 && (
              <div className="flex flex-col gap-2 rounded-2xl bg-secondary/20 border border-border/30 p-4">
                {requirements.map((req) => (
                  <PasswordRequirement
                    key={req.label}
                    met={req.met}
                    label={req.label}
                  />
                ))}
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm-pw"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
              >
                Confirm New Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  className="h-12 rounded-2xl bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all pr-12"
                  {...form.register("confirm_password")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirm_password && (
                <p className="text-xs text-destructive ml-1">
                  {form.formState.errors.confirm_password.message}
                </p>
              )}
            </div>

            <DialogFooter className="sm:justify-between sm:gap-4 relative z-10 border-t border-border/40 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-2xl h-12 px-8 text-[10px] font-black uppercase tracking-widest border-border/60 hover:bg-secondary/80"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !allRequirementsMet}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-10 shadow-xl shadow-primary/20 font-black text-[10px] tracking-widest active:scale-95 transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    UPDATING...
                  </>
                ) : (
                  "UPDATE PASSWORD"
                )}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
