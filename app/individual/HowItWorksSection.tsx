"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  ClipboardList,
  UtensilsCrossed,
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
    description: "Select from our range of breakfast, lunch, dinner, or full-day meal plans",
  },
  {
    number: "02",
    icon: UtensilsCrossed,
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
    description: "Pause, resume, or modify your plan anytime from your dashboard",
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
            <Sparkles className="h-4 w-4 text-skin" />
            <span className="text-xs font-semibold tracking-wide text-skin">
              Simple Process
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
          >
            How It{" "}
            <span className="text-skin">Works</span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground leading-relaxed"
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
          <div className="hidden lg:grid lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  className="relative"
                >
                  {index < steps.length - 1 && (
                    <div className="absolute top-10 left-[calc(50%+2rem)] right-0 flex items-center">
                      <div className="flex-1 border-t-2 border-dashed border-white/20" />
                    </div>
                  )}

                  <div className="relative flex flex-col items-center text-center">
                    <div className="absolute -top-2 -left-2 z-10">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-skin text-primary text-xs font-bold">
                        {step.number}
                      </span>
                    </div>

                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 mb-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-skin/20">
                        <Icon className="h-6 w-6 text-skin" />
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 w-full">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="lg:hidden space-y-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  variants={fadeInUp}
                  className="flex items-start gap-4"
                >
                  <div className="relative shrink-0">
                    <div className="absolute -top-1 -left-1 z-10">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-skin text-primary text-[10px] font-bold">
                        {step.number}
                      </span>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skin/20">
                        <Icon className="h-5 w-5 text-skin" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-5">
                    <h3 className="text-base font-semibold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {step.description}
                    </p>
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
