"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { ClipboardList, ChefHat, Box, Truck } from "lucide-react";
import { fadeInUp, staggerContainer } from "./animations";

const steps = [
  {
    icon: ClipboardList,
    title: "Preparation",
    description:
      "Ingredients are washed, sorted, and batch-measured based on the production plan and menu volume.",
  },
  {
    icon: ChefHat,
    title: "Cooking",
    description:
      "Standardized recipes and controlled temperatures ensure consistency across every corporate batch.",
  },
  {
    icon: Box,
    title: "Packaging",
    description:
      "Eco-friendly, temperature-controlled containers seal in freshness immediately after cooking.",
  },
  {
    icon: Truck,
    title: "Despatch",
    description:
      "Optimized route planning ensures your meals reach you within 30 minutes of leaving our kitchen.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-linear-to-b from-primary via-[#2a0a10] to-primary" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.6)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-skin/30 bg-skin/10 mb-5"
          >
            <span className="text-xs font-semibold tracking-wide text-skin">
              COOKING PROCESS
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
          >
            How We Execute{" "}
            <span className="text-skin">Large-Scale Cooking</span> Daily
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mt-4 text-base sm:text-lg text-white/60"
          >
            A disciplined workflow from preparation to dispatch keeps every meal safe, fresh, and on time.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-white/20 transition-all"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-6 w-6 text-skin" />
                </div>
                <p className="text-xs font-semibold text-skin/80 tracking-[0.14em] mb-2">
                  STEP {index + 1}
                </p>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
