import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  helper?: ReactNode;
}

export function AuthHeader({ title, subtitle, helper }: AuthHeaderProps) {
  return (
    <header className="mb-8 space-y-4">
      <div className="space-y-2">
        <h1 className={cn("text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl")}>{title}</h1>
        {subtitle ? <p className="max-w-md text-sm text-gray-600 sm:text-base">{subtitle}</p> : null}
      </div>
      {helper ? <div className="text-sm text-gray-500">{helper}</div> : null}
    </header>
  );
}
