"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

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

const fromDto = (value: UpdateProfileDto | null | undefined): ProfileFormData => ({
  ...EMPTY_PROFILE,
  dietary_preferences: value?.dietary_preferences ?? "",
  special_instructions: value?.special_instructions ?? "",
  preferred_contact_time: value?.preferred_contact_time ?? "",
  emergency_contact_name: value?.emergency_contact_name ?? "",
  emergency_contact_phone: value?.emergency_contact_phone ?? "",
});

const toDto = (value: ProfileFormData): UpdateProfileDto | null => {
  const payload: UpdateProfileDto = {};

  if (value.dietary_preferences?.trim()) {
    payload.dietary_preferences = value.dietary_preferences.trim();
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
    payload.emergency_contact_phone = value.emergency_contact_phone.trim();
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
        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Profile details (optional)</h2>
        <p className="text-sm text-gray-600">You can skip this now and update these preferences later from your profile.</p>
      </div>

      {hasErrors ? (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
          <AlertTitle>Please review your details</AlertTitle>
          <AlertDescription>One or more fields contain invalid input.</AlertDescription>
        </Alert>
      ) : null}

      <Form {...form}>
        <div className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 sm:p-5">
          <FormField
            control={form.control}
            name="dietary_preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Dietary preferences</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Vegetarian, low oil, no garlic..."
                    className="h-11 rounded-lg border-gray-300 bg-white"
                  />
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
                <FormLabel className="text-gray-700">Special instructions</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Anything you want us to know before delivering your meals"
                    className="min-h-24 rounded-lg border-gray-300 bg-white"
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
                  <FormLabel className="text-gray-700">Preferred contact time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="9:00 AM - 11:00 AM"
                      className="h-11 rounded-lg border-gray-300 bg-white"
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
                  <FormLabel className="text-gray-700">Emergency contact name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="A trusted contact person"
                      className="h-11 rounded-lg border-gray-300 bg-white"
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
                <FormLabel className="text-gray-700">Emergency contact phone</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="+91 98765 43210"
                    className="h-11 rounded-lg border-gray-300 bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>

      {showInlineActions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="h-11 border-gray-300" onClick={onSkip}>
            Skip for now
          </Button>
          <Button
            type="button"
            className="h-11 bg-orange-600 font-semibold text-white hover:bg-orange-700"
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
