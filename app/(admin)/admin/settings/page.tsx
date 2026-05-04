"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";

import { ChangePasswordDialog } from "@/components/corporate/profile/ChangePasswordDialog";

import { useCurrentUser } from "@/hooks/useUserStore";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const user = useCurrentUser();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: user?.name || "",
    }),
    [user?.name],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (user) {
      form.reset({ name: user.name || "" });
    }
  }, [user, form]);

  const onSubmit = (values: FormValues) => {
    toast.success("Profile changes saved");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (!user) {
    return (
      <div className="container mx-auto max-w-[1400px] py-8 px-4">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <Card className="rounded-2xl border border-border/40 shadow-sm">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-[1400px] py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings, integrations, and application preferences.
        </p>
      </div>

      <Card className="rounded-2xl border border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Logged In User Setting</CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-2 ring-border">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Full name"
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email Address
                  </label>
                  <div className="flex h-11 items-center justify-between gap-2 rounded-md border border-input bg-muted px-3">
                    <span className="text-sm font-medium">{user.email}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                      <FaCheckCircle className="h-3 w-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Phone Number
                  </label>
                  <div className="flex h-11 items-center justify-between gap-2 rounded-md border border-input bg-muted px-3">
                    <span className="text-sm font-medium">{user.phone}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
                      <FaCheckCircle className="h-3 w-3" /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Role
                  </label>
                  <div className="flex h-11 items-center rounded-md border border-input bg-muted px-3">
                    <span className="text-sm font-medium capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Status
                  </label>
                  <div className="flex h-11 items-center rounded-md border border-input bg-muted px-3">
                    <span className="text-sm font-medium capitalize">
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangePasswordOpen(true)}
                  className="h-11 rounded-full px-6 text-sm font-bold"
                >
                  Change Password
                </Button>
                <Button
                  type="submit"
                  className="h-11 rounded-full bg-[#4A0010] px-8 text-base font-bold text-white hover:bg-[#35000B]"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
