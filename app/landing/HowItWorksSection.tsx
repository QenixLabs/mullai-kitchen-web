"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Box, ChefHat, ClipboardList, Sparkles, Truck } from "lucide-react";
import { fadeInUp, staggerContainer } from "./animations";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Preparation",
    description:
      "Ingredients are washed, sorted, and batch-measured based on the production plan and menu volume.",
  },
  {
    number: "02",
    icon: ChefHat,
    title: "Cooking",
    description:
      "Standardized recipes and controlled temperatures ensure consistency across every corporate batch.",
  },
  {
    number: "03",
    icon: Box,
    title: "Packaging",
    description:
      "Meals are sealed in food-grade packaging with labeling, portion control, and route allocation.",
  },
  {
    number: "04",
    icon: Truck,
    title: "Dispatch",
    description:
      "Dispatch teams coordinate timed departures to deliver hot meals on committed corporate slots.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-[#100407]">
      <div className="absolute inset-0 bg-linear-to-b from-[#100407] via-[#1a060a] to-[#100407]" />
      <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.28)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-linear-to-r from-primary to-[#5a0f1a] border border-skin/20 mb-4 sm:mb-6"
          >
            <Sparkles className="h-4 w-4 text-skin" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Cooking Process
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight"
          >
            How We Execute{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-skin to-skin-light">
              Large-Scale Cooking
            </span>{" "}
            Daily
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-white/60 px-2 sm:px-0"
          >
            A disciplined workflow from preparation to dispatch keeps every
            meal safe, fresh, and on time.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-6 lg:gap-10 items-center"
        >
          <motion.div variants={fadeInUp} className="relative w-full min-w-0 min-h-80 sm:min-h-115 rounded-3xl overflow-hidden border border-white/15">
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80"
            >
              <source
                src="https://cdn.coverr.co/videos/coverr-cooking-on-a-stove-1571576837293/1080p.mp4"
                type="video/mp4"
              />
            </video>
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
            <div className="absolute left-4 right-4 sm:left-5 sm:right-5 bottom-4 sm:bottom-5 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-sm p-4 text-white">
              <p className="text-sm sm:text-base font-medium leading-snug wrap-break-word">
                Real-time kitchen operations with process checkpoints at every stage.
              </p>
            </div>
          </motion.div>

          <div className="relative min-w-0 w-full">
            <div className="flex w-full gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:thin] [scrollbar-color:rgba(212,165,116,0.35)_transparent]">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div key={step.number} variants={fadeInUp} className="group shrink-0 snap-start w-65 sm:w-70">
                  <div className="relative h-full rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6 backdrop-blur-sm hover:border-skin/35 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-inner shadow-black/5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skin">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-skin tracking-[0.14em] mb-1">
                          STEP {index + 1}
                        </p>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                          {step.title}
                        </h3>
                        <p className="text-white/65 text-sm sm:text-base leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="absolute top-1/2 -right-7 hidden sm:flex items-center pointer-events-none">
                        <div className="w-5 border-t-2 border-dashed border-skin/45" />
                        <div className="h-2.5 w-2.5 border-r-2 border-t-2 border-skin/70 rotate-45 -ml-0.5" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
