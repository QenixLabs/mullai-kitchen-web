"use client";

import { motion } from "motion/react";
import {
  BadgeCheck,
  ClipboardCheck,
  ShieldCheck,
  Thermometer,
  UserRoundCheck,
} from "lucide-react";

const safeguards = [
  {
    icon: BadgeCheck,
    title: "FSSAI Compliance",
    description: "Licensed operations with documented food safety SOPs and audit-ready records.",
  },
  {
    icon: ShieldCheck,
    title: "Sanitized Kitchen Zones",
    description: "Structured cleaning cycles with checklist-based sanitation across prep and cook lines.",
  },
  {
    icon: UserRoundCheck,
    title: "Gloves & Hairnets",
    description: "Mandatory protective gear protocol followed by all kitchen and packing staff.",
  },
  {
    icon: Thermometer,
    title: "Temperature-Controlled Cooking",
    description: "Continuous monitoring of critical temperatures during cooking, holding, and dispatch.",
  },
  {
    icon: ClipboardCheck,
    title: "Batch Quality Checks",
    description: "Every production batch is checked for taste, consistency, and packaging integrity.",
  },
];

export function SafetyMeasuresSection() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-[#14060a]">
      <div className="absolute inset-0 bg-linear-to-b from-[#14060a] via-primary to-[#14060a]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.35)_1px,transparent_0)] bg-size-[32px_32px]" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <span className="inline-flex rounded-full border border-skin/30 bg-skin/10 px-4 py-2 text-xs sm:text-sm font-semibold text-skin tracking-wide">
            Hygiene & Safety
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Corporate Grade Food Safety, Every Shift
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {safeguards.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-skin/20">
                <item.icon className="h-5 w-5 text-skin" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
