"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { fadeInUp, staggerContainer } from "../../landing/animations";
import { Utensils, Truck, Calendar, ChefHat, Shield, Headphones } from "lucide-react";

const features = [
  {
    icon: ChefHat,
    title: "Customized Menus",
    description: "Tailored meal plans that cater to your team's dietary preferences and cultural requirements.",
  },
  {
    icon: Truck,
    title: "Reliable Delivery",
    description: "Punctual daily deliveries ensuring fresh, hot meals arrive exactly when you need them.",
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "From daily lunches to special events, adjust your meal schedule with ease.",
  },
  {
    icon: Utensils,
    title: "Authentic Cuisine",
    description: "Traditional South Indian recipes prepared by expert chefs using premium ingredients.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "FSSAI certified kitchen with strict hygiene protocols and quality control measures.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "24/7 customer service team to handle any queries or special requests promptly.",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-16 lg:py-20 overflow-hidden bg-[#FAF7F2]">
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
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="text-xs font-semibold text-primary tracking-wide">
              Why Choose Us
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 tracking-tight"
          >
            Corporate Dining{" "}
            <span className="text-primary">
              Excellence
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-base text-gray-600 max-w-2xl mx-auto">
            We combine authentic flavors with professional service to deliver
            an exceptional dining experience for your organization.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 mb-4 shadow-lg shadow-primary/20">
                <feature.icon className="h-6 w-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
