"use client";

import { motion } from "motion/react";
import { StepCarousel } from "../components/StepCarousel";

const sourcingSteps = [
  {
    image: "/images/kitchen/k1.jpeg",
    step: 1,
    title: "Farm Fresh Vegetables",
    description: "Seasonal produce sourced from partner farms and verified local mandis.",
  },
  {
    image: "/images/kitchen/k2.jpeg",
    step: 2,
    title: "Trusted Vendors",
    description: "Long-term vendor network for staples, proteins, dairy, and grains.",
  },
  {
    image: "/images/kitchen/k3.jpeg",
    step: 3,
    title: "Daily Procurement",
    description: "Planned morning procurement matched to production forecasts and menu needs.",
  },
  {
    image: "/images/kitchen/k4.jpeg",
    step: 4,
    title: "Quality Checks",
    description: "Inbound checks for freshness, shelf life, and food-grade handling standards.",
  },
];

export function SourcingSection() {
  return (
    <section id="kitchen" className="relative py-20 sm:py-24 overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-linear-to-b from-primary via-[#2a0a10] to-primary" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.6)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <StepCarousel items={sourcingSteps} variant="dark" />
        </motion.div>
      </div>
    </section>
  );
}
