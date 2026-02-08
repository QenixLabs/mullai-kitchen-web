import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthFormCardProps {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthFormCard({ children, footer, className }: AuthFormCardProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
      {footer ? <div className="pt-4">{footer}</div> : null}
    </div>
  );
}
