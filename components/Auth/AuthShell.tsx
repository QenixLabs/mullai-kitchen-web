import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthShellProps {
  children: ReactNode;
  side?: ReactNode;
  className?: string;
}

export function AuthShell({ children, side, className }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-amber-50 to-stone-100 p-4 sm:p-8">
      <div
        className={cn(
          "w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl",
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
            <div className="absolute inset-0 bg-[linear-gradient(155deg,#f97316_0%,#fb8c1b_62%,#ff6a4d_100%)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_88%,rgba(255,102,102,0.2),transparent_45%)]" />
              {/* Subtle wave pattern overlay */}
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
