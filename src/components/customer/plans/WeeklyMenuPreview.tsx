"use client";

import Image from "next/image";

import type { CustomPlanMenuPreviewParams } from "@/api/types/customer.types";

interface WeeklyMenuPreviewProps {
  params: CustomPlanMenuPreviewParams | null;
  preference?: "VEG" | "NON_VEG" | null;
}

const SAMPLE_HIGHLIGHTS = [
  {
    name: "Chicken Curry",
    subtitle: "HIGH PROTEIN • 420 KCAL",
    image: "/images/plans/chiken curry.png",
  },
  {
    name: "Tofu Buddha Bowl",
    subtitle: "PLANT BASED • 340 KCAL",
    image: "/images/plans/Tofu Buddha Bowl.png",
  },
  {
    name: "Grilled Salmon",
    subtitle: "OMEGA-3 RICH • 380 KCAL",
    image: "/images/plans/Grilled Salmon.png",
  },
  {
    name: "Med Mezze",
    subtitle: "HEART HEALTHY • 290 KCAL",
    image: "/images/plans/Med Mezze.png",
  },
];

export function WeeklyMenuPreview({
  params: _params,
  preference: _preference,
}: WeeklyMenuPreviewProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3
          className="text-[14px] font-bold uppercase tracking-[0.08em] text-[#5F5659]"
          style={{ fontFamily: "var(--font-inter), sans-serif" }}
        >
          Sample Menu Highlights
        </h3>
        <button type="button" className="text-xs font-bold text-[#4B1A24] hover:opacity-75">
          View All
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SAMPLE_HIGHLIGHTS.map((item) => (
          <article key={item.name} className="w-43 shrink-0 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E6DEE2]">
            <div className="relative h-31">
              <Image src={item.image} alt={item.name} fill className="object-cover" />
            </div>
            <div className="px-3 pb-3 pt-2">
              <p className="text-[13px] font-bold text-[#2B171C]">{item.name}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8B7F84]">
                {item.subtitle}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
