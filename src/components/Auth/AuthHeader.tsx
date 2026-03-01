import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  helper?: ReactNode;
}

export function AuthHeader({ title, subtitle, helper }: AuthHeaderProps) {
  return (
    <header className="mb-8 space-y-3">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className=" text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {helper ? <div className="text-sm text-muted-foreground">{helper}</div> : null}
    </header>
  );
}
