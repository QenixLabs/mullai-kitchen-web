"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { MapPin, Calendar, ChefHat, Truck, Smile, ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";

const steps = [
  {
    number: "01",
    icon: MapPin,
    title: "Check Your Location",
    description: "Enter your pincode to see if we deliver to your area in Chennai. We cover most neighborhoods!",
    color: "bg-blue-500",
    lightColor: "bg-blue-50"
  },
  {
    number: "02",
    icon: Calendar,
    title: "Choose Your Plan",
    description: "Pick from weekly or monthly subscriptions. Select meals per day and customize your preferences.",
    color: "bg-[#39070F]",
    lightColor: "bg-[#39070F]/10"
  },
  {
    number: "03",
    icon: ChefHat,
    title: "We Cook Fresh Daily",
    description: "Our chefs prepare your meals every morning with fresh, local ingredients. No preservatives, ever!",
    color: "bg-[#D4A574]",
    lightColor: "bg-[#D4A574]/20"
  },
  {
    number: "04",
    icon: Truck,
    title: "Hot Delivery to Door",
    description: "Meals delivered in insulated packaging within 30 minutes. Track your delivery in real-time.",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50"
  }
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#39070F]/10 text-[#39070F] text-sm font-medium mb-4"
          >
            <Smile className="h-4 w-4" />
            Simple Process
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            How Mullai Kitchen Works
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600"
          >
            Getting started takes just 2 minutes. Here&apos;s how we bring home-style meals to your door.
          </motion.p>
        </motion.div>

        {/* Steps - Horizontal Timeline */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-[#39070F] to-emerald-500">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 via-[#39070F] via-[#D4A574] to-emerald-500 origin-left"
            />
          </div>

          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={scaleIn}
                custom={index}
                className="relative"
              >
                {/* Step Card */}
                <motion.div
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow h-full"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 left-6">
                    <div className={`${step.color} text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg`}>
                      {step.number}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.lightColor} rounded-2xl flex items-center justify-center mb-4 mt-4`}>
                    <step.icon className={`h-8 w-8 ${step.color.replace('bg-', 'text-')}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>

                  {/* Mobile Arrow */}
                  
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center mt-4">
                      <ArrowRight className="h-6 w-6 text-gray-300 rotate-90" />
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
