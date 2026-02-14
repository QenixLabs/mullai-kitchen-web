import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: ReactNode;
  side?: ReactNode;
  className?: string;
}

export function AuthShell({ children, side, className }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100 p-4 sm:p-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#FF6B35]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
      </div>

      <div
        className={cn(
          "relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white",
          "shadow-[0_4px_40px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.05)]",
          "grid lg:grid-cols-2",
          className
        )}
      >
        {/* Form Side - Left */}
        <main className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
          {children}
        </main>

        {/* Brand Side - Right */}
        {side ? (
          <aside className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#FF7A45] to-[#FF8F65]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_88%,rgba(255,102,102,0.2),transparent_45%)]" />
              {/* Subtle pattern overlay */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 30 50 50 T100 50' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M0 60 Q25 40 50 60 T100 60' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E")`,
                  backgroundSize: "140px 140px",
                }}
              />
            </div>
            <div className="relative z-10 flex h-full flex-col justify-center p-12 text-white">
              {side}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
