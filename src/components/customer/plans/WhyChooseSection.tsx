"use client";

import { ShieldCheck, CalendarClock, Leaf, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WhyChooseSectionProps {
  className?: string;
}

const features = [
  {
    icon: ShieldCheck,
    title: "100% Hygienic",
    description: "Prepared in ISO-certified kitchens with daily quality checks",
  },
  {
    icon: CalendarClock,
    title: "Flexible Plans",
    description: "Weekly or monthly subscriptions with easy pause/resume",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Sustainable packaging with biodegradable containers",
  },
];

export function WhyChooseSection({ className }: WhyChooseSectionProps) {
  return (
    <section className={cn("space-y-8", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Why Choose Mullai Kitchen?
        </h2>
        <p className="mt-2 text-gray-600">
          We're committed to making healthy eating convenient and delicious
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
        {/* Features List */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature) => (
            <Card key={feature.title} className="border-orange-100 bg-white shadow-sm">
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Image with floating stat */}
        <div className="relative mx-auto lg:mx-0">
          <div className="relative h-80 w-full max-w-md overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50">
            <img
              src="/images/kitchen_team.jpg"
              alt="Mullai Kitchen team preparing fresh meals"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />

            {/* Floating Stat Badge */}
            <div className="absolute bottom-4 right-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">10,000+</p>
                  <p className="text-xs text-gray-600">Happy Subscribers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -left-4 top-10 h-20 w-20 -translate-x-1/2 rounded-full bg-orange-200/30 blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-4 -right-4 h-32 w-32 translate-x-1/4 rounded-full bg-amber-200/30 blur-3xl" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
