"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  ClipboardList,
  ChefHat,
  Truck,
  Settings2,
  Sparkles,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "../landing/animations";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Choose Plan",
    description:
      "Select from our range of breakfast, lunch, dinner, or full-day meal plans",
  },
  {
    number: "02",
    icon: ChefHat,
    title: "Select Meals",
    description: "Pick your favorite dishes from our rotating weekly menu",
  },
  {
    number: "03",
    icon: Truck,
    title: "Get Daily Delivery",
    description: "Freshly prepared meals delivered to your doorstep on time",
  },
  {
    number: "04",
    icon: Settings2,
    title: "Manage Subscription",
    description:
      "Pause, resume, or modify your plan anytime from your dashboard",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-[#100407]">
      <div className="absolute inset-0 bg-linear-to-b from-[#100407] via-[#1a060a] to-[#100407]" />
      <div className="absolute inset-0 opacity-[0.2] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.28)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
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
              Simple Process
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight"
          >
            How It{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-skin to-skin-light">
              Works
            </span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-base sm:text-lg text-white/60 px-2 sm:px-0"
          >
            Get started with your personalized meal plan in just a few simple steps
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="relative"
        >
          {/* Desktop: Horizontal layout with connecting lines */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  className="relative"
                >
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 left-[calc(50%+2rem)] right-0 flex items-center">
                      <div className="flex-1 border-t-2 border-dashed border-skin/40" />
                    </div>
                  )}

                  <div className="relative flex flex-col items-center text-center">
                    {/* Step number badge */}
                    <div className="absolute -top-2 -left-2 z-10">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-skin text-primary text-xs font-bold">
                        {step.number}
                      </span>
                    </div>

                    {/* Icon circle */}
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/5 mb-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-skin">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    {/* Content card */}
                    <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-white/65 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Mobile/Tablet: Vertical stack */}
          <div className="lg:hidden space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  className="relative"
                >
                  {/* Connecting line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-16 left-8 bottom-[-2rem] w-0.5 border-l-2 border-dashed border-skin/40" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon circle with step number */}
                    <div className="relative shrink-0">
                      <div className="absolute -top-1 -left-1 z-10">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-skin text-primary text-[10px] font-bold">
                          {step.number}
                        </span>
                      </div>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-skin">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Content card */}
                    <div className="flex-1 rounded-xl bg-white/5 border border-white/10 p-5">
                      <h3 className="text-base font-bold text-white mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-white/65 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
