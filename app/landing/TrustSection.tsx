"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  animate,
} from "motion/react";
import {
  MapPin,
  Shield,
  Leaf,
  Clock,
  Award,
  Heart,
  ChefHat,
  Star,
  Users,
  Sparkles,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
  floatAnimation,
} from "./animations";
import { cn } from "@/lib/utils";

const trustSignals = [
  {
    icon: Shield,
    title: "FSSAI Certified",
    description: "Licensed cloud kitchen following all food safety standards",
  },
  {
    icon: Star,
    title: "4.9★ Rating",
    description: "Rated excellent by 2000+ happy customers",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description: "Sustainable packaging made from plant materials",
  },
  {
    icon: Clock,
    title: "30-Min Delivery",
    description: "Hot meals delivered to your door in under 30 minutes",
  },
  {
    icon: Award,
    title: "Fresh Daily",
    description: "Meals prepared fresh every morning, never frozen",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Home-style cooking with authentic recipes",
  },
];

const chennaiAreas = [
  "Anna Nagar",
  "T. Nagar",
  "Adyar",
  "Mylapore",
  "Velachery",
  "Nungambakkam",
  "Kodambakkam",
  "Porur",
  "Guindy",
  "Chromepet",
  "Pallavaram",
  "Tambaram",
  "ECR",
  "OMR",
  "Anna Salai",
];

// Counter animation hook
import { useCounter } from "@/hooks/use-counter";

// Animated Stat Component
function AnimatedStat({
  value,
  suffix = "",
  label,
  icon: Icon,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
}) {
  const { ref, displayValue } = useCounter(value);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#D4A574]/30 transition-all duration-300"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#D4A574] to-[#c49a6a] shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{displayValue}</span>
          {suffix && (
            <span className="text-lg font-semibold text-[#D4A574]">
              {suffix}
            </span>
          )}
        </div>
        <p className="text-sm text-white/50 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

export function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#1a0509] via-primary to-[#1a0509]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-1/4 left-1/4"
        >
          <div className="w-96 h-96 bg-[#D4A574]/5 rounded-full blur-[120px]" />
        </motion.div>
        <motion.div
          animate={{
            ...floatAnimation,
            transition: { ...floatAnimation.transition, delay: 2 },
          }}
          className="absolute bottom-1/4 right-1/4"
        >
          <div className="w-80 h-80 bg-primary/20 rounded-full blur-[100px]" />
        </motion.div>

        {/* Decorative Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(212, 165, 116, 0.5) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#D4A574]/20 to-primary/20 border border-[#D4A574]/30 mb-6"
          >
            <ChefHat className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Chennai&apos;s Trusted Cloud Kitchen
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Why Chennai Chooses{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D4A574] to-[#e8c4a0]">
              Mullai
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-white/60">
            From Anna Nagar to Tambaram, we&apos;re bringing authentic
            home-style South Indian meals to thousands of Chennai homes every
            day.
          </motion.p>
        </motion.div>

        {/* Premium Trust Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16"
        >
          {trustSignals.map((signal, index) => (
            <motion.div
              key={signal.title}
              variants={scaleIn}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="group relative"
            >
              {/* Hover Glow */}
              <div className="absolute -inset-1 bg-linear-to-r from-[#D4A574]/10 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#D4A574]/30 transition-all duration-300">
                {/* Gradient Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-[#D4A574] to-primary opacity-80 rounded-t-2xl" />

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A574] to-[#c49a6a]">
                    <signal.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {signal.title}
                    </h3>
                    <p className="text-sm text-white/60">
                      {signal.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Coverage Area */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={fadeInUp}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-2 bg-linear-to-r from-[#D4A574]/10 to-primary/10 rounded-3xl blur-2xl opacity-50" />

          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
            {/* Gradient Top Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-primary via-[#D4A574] to-primary rounded-t-3xl" />

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Info */}
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A574] to-[#c49a6a]">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Delivering Across Chennai
                  </h3>
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  We currently serve 15+ neighborhoods across Chennai with
                  same-day delivery. Enter your pincode to check availability in
                  your area.
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                  {chennaiAreas.map((area) => (
                    <span
                      key={area}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/10 text-white/80 text-xs sm:text-sm border border-white/10 hover:bg-white/20 hover:border-[#D4A574]/30 transition-all cursor-pointer"
                    >
                      {area}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-linear-to-r from-primary to-[#5a0f1a]">
                    <Users className="h-5 w-5 text-[#D4A574]" />
                    <span className="text-white font-semibold">
                      <span className="text-[#D4A574] font-bold">2,000+</span>{" "}
                      Happy Customers
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Premium Image */}
              <div className="relative h-72 rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80"
                  alt="Chef preparing meal"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 600px"
                />
                <div className="absolute inset-0 bg-linear-to-t from-primary/80 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-white font-semibold text-lg">
                    Professional chefs preparing your meals
                  </p>
                  <p className="text-white/70 text-sm">
                    Fresh ingredients, authentic recipes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
