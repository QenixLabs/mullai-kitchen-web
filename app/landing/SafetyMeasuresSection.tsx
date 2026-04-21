"use client";

import { motion } from "motion/react";
import { Settings, Star, ShieldCheck, Thermometer, Leaf, Timer } from "lucide-react";

const safeguards = [
  {
    icon: Settings,
    title: "FSSAI Certified",
    description: "Licensed cloud kitchen following all food safety SOPs with audit-ready records.",
  },
  {
    icon: Star,
    title: "4.9 Rated Excellence",
    description: "Trusted by 2000+ happy customers across Chennai for consistency and taste.",
  },
  {
    icon: ShieldCheck,
    title: "Sanitized Kitchen Zones",
    description: "Structured cleaning cycles with checklist-based sanitation across all prep lines.",
  },
  {
    icon: Thermometer,
    title: "Temp-Controlled Cooking",
    description: "Continuous monitoring of critical temperatures during cooking, holding, and dispatch.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly & Fresh",
    description: "Sustainable packaging made from plant materials. Meals prepared fresh daily, never frozen.",
  },
  {
    icon: Timer,
    title: "30-Min Delivery",
    description: "Hyper-local distribution network ensuring your meal arrives hot within 30 minutes.",
  },
];

export function SafetyMeasuresSection() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-[#FAF7F2]">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <span className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-primary uppercase">
            Hygiene & Safety First
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-bold text-primary tracking-tight">
            <span className="brand-wine-text">Corporate Grade</span> Food Safety, Every Shift
          </h2>
          <p className="individual-copy-slate text-lg leading-relaxed">
            From Anna Nagar to Tambaram, we bring authentic home-style South Indian meals to thousands of Chennai homes with uncompromising safety protocols.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {safeguards.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="relative rounded-2xl border border-border bg-white px-5 sm:px-6 pt-14 pb-6 text-center"
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg">
                <item.icon className="h-5 w-5 text-skin" />
              </div>
              <h3 className="text-base font-semibold text-primary">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
