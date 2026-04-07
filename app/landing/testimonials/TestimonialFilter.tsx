"use client";

import { MessageSquare, Video, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TestimonialFilter } from "./types";

interface TestimonialFilterProps {
  value: TestimonialFilter;
  onValueChange: (value: TestimonialFilter) => void;
  counts: { all: number; video: number; text: number };
}

const filters: {
  value: TestimonialFilter;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "video", label: "Video", icon: Video },
  { value: "text", label: "Text", icon: MessageSquare },
];

export function TestimonialFilter({
  value,
  onValueChange,
  counts,
}: TestimonialFilterProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as TestimonialFilter)}>
      <TabsList
        variant="default"
        className="bg-white/5 border border-white/10 rounded-xl p-1 h-auto"
      >
        {filters.map(({ value: filterValue, label, icon: Icon }) => (
          <TabsTrigger
            key={filterValue}
            value={filterValue}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-skin/20 data-[state=active]:text-skin text-white/50 hover:text-white/80 data-[state=active]:hover:text-skin"
          >
            <Icon className="h-4 w-4 mr-1.5" />
            {label}
            <span className="ml-1.5 text-xs bg-white/10 data-[state=active]:bg-skin/10 px-1.5 py-0.5 rounded-full">
              {counts[filterValue]}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
