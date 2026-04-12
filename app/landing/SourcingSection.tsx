"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Tractor, Truck, CalendarCheck, CheckCheck } from "lucide-react";

const sourcingFlow = [
  {
    icon: Tractor,
    title: "Farm Fresh Vegetables",
    detail: "Seasonal produce sourced from partner farms and verified local mandis.",
  },
  {
    icon: Truck,
    title: "Trusted Vendors",
    detail: "Long-term vendor network for staples, proteins, dairy, and grains.",
  },
  {
    icon: CalendarCheck,
    title: "Daily Procurement",
    detail: "Planned morning procurement matched to production forecasts and menu needs.",
  },
  {
    icon: CheckCheck,
    title: "Quality Checks",
    detail: "Inbound checks for freshness, shelf life, and food-grade handling standards.",
  },
];

export function SourcingSection() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-linear-to-b from-primary via-[#2a0a10] to-primary" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.6)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-110px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="inline-flex rounded-full border border-skin/30 bg-skin/10 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-skin uppercase">
            Ingredient Sourcing
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            From Source To Kitchen,{" "}
            <span className="text-skin">With Full Visibility</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6"
          >
            <div className="space-y-4">
              {sourcingFlow.map((item, index) => (
                <div
                  key={item.title}
                  className="relative rounded-2xl bg-white/5 p-4 border border-white/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-xl bg-skin/20">
                      <item.icon className="h-5 w-5 text-skin" />
                    </div>
                    <div>
                      <p className="text-xs text-white/45 font-semibold tracking-wide">
                        STEP {index + 1}
                      </p>
                      <h3 className="text-base font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/60 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative min-h-85 sm:min-h-115 overflow-hidden rounded-3xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80"
              alt="Fresh vegetables and ingredient sourcing"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-black/40 p-4 backdrop-blur-sm">
              <p className="text-sm sm:text-base text-white leading-relaxed">
                Daily sourcing ensures ingredient freshness, predictable quality, and reliable corporate meal delivery windows.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
