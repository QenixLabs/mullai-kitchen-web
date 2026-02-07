import type { ReactNode } from "react";

interface UnauthenticatedLayoutProps {
  children: ReactNode;
}

export default function UnauthenticatedLayout({ children }: UnauthenticatedLayoutProps) {
  return <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">{children}</div>;
}
