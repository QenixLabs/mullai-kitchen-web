import { CalendarClock, Leaf, ShieldCheck, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface WhyChooseSectionProps {
  className?: string;
}

// Static data - can be at module level for Server Components
const highlights = [
  {
    icon: ShieldCheck,
    title: "Kitchen hygiene",
    detail: "ISO-certified kitchen operations with daily quality checkpoints.",
  },
  {
    icon: CalendarClock,
    title: "Flexible timing",
    detail: "Pause, skip, or resume deliveries anytime based on your routine.",
  },
  {
    icon: Leaf,
    title: "Earth first",
    detail: "Biodegradable packaging and reduced single-use material footprint.",
  },
];

const stats = [
  { label: "Meals served", value: "1M+" },
  { label: "Chennai families", value: "10k+" },
  { label: "Avg. rating", value: "4.8/5" },
];

// Server Component - no interactivity, renders on server for better SEO and initial load
export function WhyChooseSection({ className }: WhyChooseSectionProps) {
  return (
    <section className={cn("relative py-14 sm:py-16", className)}>
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-orange-100/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4">
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-[0_28px_80px_-60px_rgba(15,23,42,0.55)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="border-b border-orange-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-600">The Mullai Difference</p>
              <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl">
                Good food,
                <span className="block text-orange-600">done right.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                No shortcuts and no compromises. Home-style meals with dependable quality, practical subscriptions,
                and thoughtful delivery experience.
              </p>

              <div className="mt-6 grid gap-3">
                {highlights.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/60 to-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative bg-[radial-gradient(circle_at_20%_0%,#fff7ed_0,#ffffff_55%)] p-6 sm:p-8">
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Built for consistency</p>
                    <p className="text-xs text-slate-600">Daily operations, quality, and delivery discipline.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-2xl font-black tracking-tight text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Service Areas</p>
                <p className="mt-1 text-sm text-slate-700">Adyar, Besant Nagar, Velachery, T. Nagar, R.A. Puram and 30+ localities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
