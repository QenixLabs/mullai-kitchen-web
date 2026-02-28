"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Drumstick, Leaf } from "lucide-react";
import type { CallbacksOptions } from "timepicker-ui";
import { Timepicker } from "timepicker-ui-react";

import type { UpdateProfileDto } from "@/api/types/customer.types";
import { profileFormSchema, type ProfileFormData } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const EMPTY_PROFILE: ProfileFormData = {
  dietary_preferences: "",
  special_instructions: "",
  preferred_contact_time: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
};

const DIETARY_PREFERENCE_OPTIONS = ["Veg", "Non-Veg"] as const;

type TimepickerUpdatePayload = Parameters<NonNullable<CallbacksOptions["onUpdate"]>>[0];

const formatPreferredContactTime = (value: TimepickerUpdatePayload): string => {
  const hour = `${value.hour}`.padStart(2, "0");
  const minutes = `${value.minutes}`.padStart(2, "0");

  if (value.type) {
    return `${hour}:${minutes} ${value.type}`;
  }

  return `${hour}:${minutes}`;
};

const normalizeEmergencyPhoneForInput = (value: string | undefined): string => {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return digits.slice(-10);
};

const fromDto = (value: UpdateProfileDto | null | undefined): ProfileFormData => ({
  ...EMPTY_PROFILE,
  dietary_preferences: DIETARY_PREFERENCE_OPTIONS.includes(
    value?.dietary_preferences as (typeof DIETARY_PREFERENCE_OPTIONS)[number],
  )
    ? (value?.dietary_preferences as (typeof DIETARY_PREFERENCE_OPTIONS)[number])
    : "",
  special_instructions: value?.special_instructions ?? "",
  preferred_contact_time: value?.preferred_contact_time ?? "",
  emergency_contact_name: value?.emergency_contact_name ?? "",
  emergency_contact_phone: normalizeEmergencyPhoneForInput(value?.emergency_contact_phone),
});

const toDto = (value: ProfileFormData): UpdateProfileDto | null => {
  const payload: UpdateProfileDto = {};

  if (value.dietary_preferences && DIETARY_PREFERENCE_OPTIONS.includes(value.dietary_preferences)) {
    payload.dietary_preferences = value.dietary_preferences;
  }
  if (value.special_instructions?.trim()) {
    payload.special_instructions = value.special_instructions.trim();
  }
  if (value.preferred_contact_time?.trim()) {
    payload.preferred_contact_time = value.preferred_contact_time.trim();
  }
  if (value.emergency_contact_name?.trim()) {
    payload.emergency_contact_name = value.emergency_contact_name.trim();
  }
  if (value.emergency_contact_phone?.trim()) {
    payload.emergency_contact_phone = `+91${value.emergency_contact_phone.trim()}`;
  }

  return Object.keys(payload).length > 0 ? payload : null;
};

const areDtosEqual = (left: UpdateProfileDto | null, right: UpdateProfileDto | null): boolean => {
  if (!left && !right) {
    return true;
  }

  if (!left || !right) {
    return false;
  }

  return (
    left.dietary_preferences === right.dietary_preferences &&
    left.special_instructions === right.special_instructions &&
    left.preferred_contact_time === right.preferred_contact_time &&
    left.emergency_contact_name === right.emergency_contact_name &&
    left.emergency_contact_phone === right.emergency_contact_phone
  );
};

export interface ProfileDetailsStepProps {
  value?: UpdateProfileDto | null;
  onChange: (nextValue: UpdateProfileDto | null) => void;
  className?: string;
  showInlineActions?: boolean;
  onContinue?: () => void;
  onSkip?: () => void;
}

export function ProfileDetailsStep({
  value,
  onChange,
  className,
  showInlineActions = false,
  onContinue,
  onSkip,
}: ProfileDetailsStepProps) {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: fromDto(value) || EMPTY_PROFILE,
    mode: "onChange",
  });

  // Sync form with parent prop changes
  useEffect(() => {
    const nextFormData = fromDto(value);
    const currentValues = form.getValues();

    // Only reset if values actually changed
    const hasChanged = Object.keys(nextFormData).some(
      (key) => nextFormData[key as keyof ProfileFormData] !== currentValues[key as keyof ProfileFormData]
    );

    if (hasChanged) {
      form.reset(nextFormData);
    }
  }, [value, form]);

  // Sync parent with form changes
  useEffect(() => {
    const subscription = form.watch((formValue) => {
      const dto = toDto(formValue as ProfileFormData);
      if (!areDtosEqual(dto, value ?? null)) {
        onChange(dto);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, onChange, value]);

  const hasAnyValue = useMemo(() => Boolean(toDto(form.getValues())), [form]);
  const { errors } = form.formState;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Profile details (optional)</h2>
        <p className="text-sm text-muted-foreground">You can skip this now and update these preferences later from your profile.</p>
      </div>

      {hasErrors ? (
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/10 text-destructive">
          <AlertTitle>Please review your details</AlertTitle>
          <AlertDescription>One or more fields contain invalid input.</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <div className="grid gap-4 rounded-lg border border-muted bg-muted/70 p-4 sm:p-5">
          <FormField
            control={form.control}
            name="dietary_preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Dietary preferences</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    {DIETARY_PREFERENCE_OPTIONS.map((option) => {
                      const isSelected = field.value === option;
                      const Icon = option === "Veg" ? Leaf : Drumstick;

                      return (
                        <Button
                          key={option}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-11 rounded-lg border-border bg-background font-medium text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary",
                            isSelected && "border-primary bg-primary/10 text-primary shadow-sm",
                          )}
                          onClick={() => {
                            field.onChange(isSelected ? "" : option);
                          }}
                        >
                          <Icon className="size-4" />
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="special_instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Special instructions</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Anything you want us to know before delivering your meals"
                    className="min-h-24 rounded-lg border-border bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="preferred_contact_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Preferred contact time</FormLabel>
                  <FormControl>
                    <Timepicker
                      value={field.value || ""}
                      placeholder="Select preferred contact time"
                      className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                      options={{
                        clock: {
                          type: "12h",
                          autoSwitchToMinutes: true,
                        },
                        ui: {
                          mobile: true,
                          cssClass: "mk-onboarding-timepicker",
                        },
                        labels: {
                          ok: "Set time",
                          cancel: "Close",
                        },
                      }}
                      onUpdate={(nextValue) => {
                        field.onChange(formatPreferredContactTime(nextValue));
                      }}
                      onConfirm={(nextValue) => {
                        field.onChange(formatPreferredContactTime(nextValue));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergency_contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Emergency contact name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="A trusted contact person"
                      className="h-11 rounded-lg border-border bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="emergency_contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">Emergency contact phone</FormLabel>
                <FormControl>
                  <div className="flex w-full items-center">
                    <span className="inline-flex h-11 items-center rounded-l-lg border border-r-0 border-border bg-muted px-3 text-sm font-semibold text-foreground">
                      +91
                    </span>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);
                        field.onChange(digitsOnly);
                      }}
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="9876543210"
                      className="h-11 rounded-l-none border-l-0 border-border bg-background"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {showInlineActions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="h-11 border-border" onClick={onSkip}>
            Skip for now
          </Button>
          <Button
            type="button"
            className="h-11 bg-primary font-semibold text-white hover:bg-orange-700"
            onClick={onContinue}
            disabled={hasErrors}
          >
            {hasAnyValue ? "Save and continue" : "Continue"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
