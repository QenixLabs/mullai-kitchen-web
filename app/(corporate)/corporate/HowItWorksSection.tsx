"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { fadeInUp, staggerContainer } from "../../landing/animations";
import { ClipboardList, ChefHat, Truck, Smile } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    step: "01",
    title: "Consultation",
    description: "We discuss your requirements, dietary preferences, and meal schedule.",
  },
  {
    icon: ChefHat,
    step: "02",
    title: "Menu Planning",
    description: "Our chefs create a customized menu tailored to your team's tastes.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Daily Delivery",
    description: "Fresh meals are prepared and delivered to your office on schedule.",
  },
  {
    icon: Smile,
    step: "04",
    title: "Ongoing Support",
    description: "We continuously gather feedback and refine the experience.",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-16 lg:py-20 overflow-hidden bg-[#0d0205]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-skin/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-[#5a0f1a] border border-skin/20 mb-4"
          >
            <span className="text-xs font-semibold text-white tracking-wide">
              Simple Process
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight"
          >
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-skin to-skin-light">
              Works
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-base text-white/60 max-w-2xl mx-auto">
            Getting started with our corporate meal service is simple and hassle-free.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              variants={fadeInUp}
              className="relative group"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-skin/30 to-transparent" />
              )}

              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-skin/30 transition-all duration-300">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 text-5xl font-bold text-white/5">
                  {item.step}
                </div>

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-skin to-skin/70 mb-4 shadow-lg shadow-skin/20">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
