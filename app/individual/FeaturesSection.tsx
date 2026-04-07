"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Calendar,
  UtensilsCrossed,
  PauseCircle,
  Settings2,
  Truck,
  Wallet,
  Sparkles,
} from "lucide-react";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Calendar,
    title: "Flexible Meal Plans",
    description: "Adjust your plan anytime based on your schedule",
  },
  {
    icon: UtensilsCrossed,
    title: "All Meal Options",
    description: "Breakfast, lunch, and dinner available",
  },
  {
    icon: PauseCircle,
    title: "Pause/Resume Anytime",
    description: "Going on vacation? Pause with one click",
  },
  {
    icon: Settings2,
    title: "Customizable Meals",
    description: "Choose dishes that match your taste",
  },
  {
    icon: Truck,
    title: "Home Delivery",
    description: "Fresh meals delivered to your doorstep daily",
  },
  {
    icon: Wallet,
    title: "Affordable Pricing",
    description: "Plans starting from just ₹99 per meal",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#1a0509] to-[#0d0205] overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.6)_1px,transparent_0)] bg-[size:34px_34px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-skin/30 bg-skin/10 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-skin">
            <Sparkles className="h-4 w-4" />
            Why Choose Us
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Everything You Need for{" "}
            <span className="bg-gradient-to-r from-skin to-skin-light bg-clip-text text-transparent">
              Daily Nutrition
            </span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, _index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className={cn(
                "group rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm",
                "transition-all duration-300 ease-out",
                "hover:border-skin/30 hover:bg-white/[0.07]"
              )}
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-skin text-primary transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-white/65 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
