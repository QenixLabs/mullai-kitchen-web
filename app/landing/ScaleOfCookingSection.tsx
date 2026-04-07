"use client";

import { motion } from "motion/react";
import { Building2, ChefHat, Handshake, Soup } from "lucide-react";

const stats = [
  {
    value: "18,000+",
    label: "Meals cooked daily",
    icon: Soup,
  },
  {
    value: "24",
    label: "Production kitchens",
    icon: Building2,
  },
  {
    value: "320+",
    label: "Culinary and operations team",
    icon: ChefHat,
  },
  {
    value: "85+",
    label: "Corporate clients served",
    icon: Handshake,
  },
];

export function ScaleOfCookingSection() {
  return (
    <section className="relative py-16 sm:py-20 bg-[#120407] overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#120407] via-primary to-[#120407]" />
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.6)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center rounded-full border border-skin/30 bg-skin/10 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-skin">
            Scale Of Cooking
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Built For Large Teams, Delivered With Consistency
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-4 sm:p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-skin/20">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-skin" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-white leading-none">
                {stat.value}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-white/65 leading-relaxed">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
