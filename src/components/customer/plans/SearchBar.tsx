"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onValueChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onValueChange,
  onSearch,
  placeholder = "Search meal plans",
  debounceMs = 350,
  disabled = false,
  className,
}: SearchBarProps) {
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      onSearchRef.current?.(value);
    }, debounceMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [debounceMs, value]);

  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-400"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 rounded-xl border-orange-100 bg-white/90 pl-11 pr-11 text-gray-900 shadow-[0_1px_0_0_rgba(15,23,42,0.02)] transition focus-visible:border-orange-300 focus-visible:ring-orange-200 placeholder:text-gray-400"
        aria-label="Search plans"
      />

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-gray-500 hover:bg-orange-50 hover:text-orange-700"
          onClick={() => onValueChange("")}
          disabled={disabled}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
