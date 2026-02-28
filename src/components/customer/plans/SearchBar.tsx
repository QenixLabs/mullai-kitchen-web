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
    <div className={cn("relative w-full", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/70 sm:left-4 sm:h-4 sm:w-4"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-12 w-full rounded-2xl border-border bg-background/90 pl-10 pr-10 text-base text-foreground shadow-sm transition focus-visible:border-primary focus-visible:ring-primary/20 placeholder:text-sm placeholder:text-muted-foreground sm:pl-11 sm:pr-11 sm:text-base sm:placeholder:text-base"
        aria-label="Search plans"
      />

      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-accent hover:text-primary touch-manipulation sm:right-2 sm:h-7 sm:w-7"
          onClick={() => onValueChange("")}
          disabled={disabled}
          aria-label="Clear search"
        >
          <X className="h-5 w-5 sm:h-4 sm:w-4" aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  );
}
