"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { MapPin, Calendar, ChefHat, Truck, Sparkles } from "lucide-react";
import { fadeInUp, staggerContainer } from "./animations";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Check Your Location",
    description: "Enter your pincode to see if we deliver to your area in Chennai. We cover most neighborhoods!"
  },
  {
    number: "02",
    icon: Calendar,
    title: "Choose Your Plan",
    description: "Pick from weekly or monthly subscriptions. Select meals per day and customize your preferences."
  },
  {
    number: "03",
    icon: ChefHat,
    title: "We Cook Fresh Daily",
    description: "Our chefs prepare your meals every morning with fresh, local ingredients. No preservatives, ever!"
  },
  {
    number: "04",
    icon: Truck,
    title: "Hot Delivery to Door",
    description: "Meals delivered in insulated packaging within 30 minutes. Track your delivery in real-time."
  }
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden bg-[#0d0205]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0205] via-[#1a0509] to-[#0d0205]" />
      
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4A574]/5 rounded-full blur-[150px]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#39070F] to-[#5a0f1a] border border-[#D4A574]/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-semibold text-white tracking-wide">Simple Process</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#e8c4a0]">Mullai Kitchen</span> Works
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/60"
          >
            Getting started takes just 2 minutes. Here&apos;s how we bring home-style meals to your door.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              className="group"
            >
              <div className="relative h-full bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#D4A574]/30 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute -top-3 left-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#D4A574] to-[#c49a6a] text-[#39070F] text-sm font-bold"
                  >
                    {step.number}
                  </motion.div>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4A574]/20 to-[#c49a6a]/10 flex items-center justify-center mb-4 mt-3">
                  <step.icon className="h-7 w-7 text-[#D4A574]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
