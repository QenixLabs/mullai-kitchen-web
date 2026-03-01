"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-success" />,
        info: <InfoIcon className="size-5 text-info" />,
        warning: <TriangleAlertIcon className="size-5 text-warning" />,
        error: <OctagonXIcon className="size-5 text-destructive" />,
        loading: <Loader2Icon className="size-5 text-primary animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-xs font-medium",
          title:
            "group-[.toast]:text-foreground group-[.toast]:font-bold group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "group-[.toast]:border-destructive/20 group-[.toast]:bg-destructive/5",
          success:
            "group-[.toast]:border-success/20 group-[.toast]:bg-success/5",
        },
      }}
      style={
        {
          "--border-radius": "var(--radius-xl)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
