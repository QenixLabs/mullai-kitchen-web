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

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-16 sm:mb-20"
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
            className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight"
          >
            How We Execute{" "}
            <span className="text-skin">Large-Scale</span> Cooking Daily
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className=" mx-auto"
          >
            A disciplined workflow from preparation to dispatch keeps every meal safe, fresh, and on time.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6"
        >
          {/* Dotted connecting line - hidden on mobile */}
          <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-0 border-t-2 border-dashed border-white/20" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#F5E8EA]">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm w-full">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
