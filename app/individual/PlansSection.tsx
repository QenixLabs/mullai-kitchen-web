"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Check, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "../landing/animations";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "breakfast",
    name: "Breakfast Plan",
    description: "Start your day with wholesome South Indian breakfast",
    weeklyPrice: 899,
    monthlyPrice: 2999,
    popular: false,
    features: [
      "Idli, Dosa, Pongal varieties",
      "Fresh chutneys",
      "Sambar",
      "Hot coffee/tea",
    ],
    highlight: "Morning Energy",
  },
  {
    id: "lunch",
    name: "Lunch Plan",
    description: "Complete midday meal with rice, curry, and sides",
    weeklyPrice: 1049,
    monthlyPrice: 3499,
    popular: true,
    features: [
      "Steamed rice",
      "2 Vegetables",
      "Sambar/Rasam",
      "Curd",
      "Appalam",
    ],
    highlight: "Most Popular",
  },
  {
    id: "dinner",
    name: "Dinner Plan",
    description: "Light and nutritious evening meals",
    weeklyPrice: 999,
    monthlyPrice: 3299,
    popular: false,
    features: [
      "Variety rice options",
      "Chapati with curry",
      "Light tiffin items",
      "Soup",
    ],
    highlight: "Evening Comfort",
  },
  {
    id: "fullday",
    name: "Full Day Plan",
    description: "Complete nutrition with breakfast, lunch & dinner",
    weeklyPrice: 2499,
    monthlyPrice: 7999,
    popular: false,
    features: [
      "All meals included",
      "Customizable menu",
      "Priority delivery",
      "Nutrition balanced",
    ],
    highlight: "Best Value",
  },
];

export function PlansSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#1a0509] via-[#0d0205] to-[#1a0509]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-1/4 left-1/4"
        >
          <div className="w-96 h-96 bg-skin/5 rounded-full blur-[120px]" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, -20, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
          className="absolute bottom-1/4 right-1/4"
        >
          <div className="w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        </motion.div>

        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 165, 116, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 165, 116, 0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary to-[#5a0f1a] border border-skin/20 mb-6"
          >
            <Sparkles className="h-4 w-4 text-skin" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Individual Meal Plans
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
          >
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-skin to-skin-light">
              Perfect Plan
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-white/60 mb-8">
            Flexible meal plans designed for individuals. Save more with monthly subscriptions.
          </motion.p>

          {/* Premium Toggle */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-4"
          >
            <span
              className={cn(
                "text-sm font-semibold transition-colors",
                !isMonthly ? "text-skin" : "text-white/50",
              )}
            >
              Weekly
            </span>
            <Switch
              checked={isMonthly}
              onCheckedChange={setIsMonthly}
              className="data-[state=checked]:bg-linear-to-r data-[state=checked]:from-primary data-[state=checked]:to-[#5a0f1a]"
            />
            <span
              className={cn(
                "text-sm font-semibold transition-colors",
                isMonthly ? "text-skin" : "text-white/50",
              )}
            >
              Monthly
            </span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: isMonthly ? 1 : 0 }}
              className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-emerald-500/30"
            >
              Save 20%
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Plans Grid */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={scaleIn}
              className={cn(
                "perspective-1000",
                plan.popular && "lg:-mt-4 lg:mb-4",
              )}
            >
              <div className="relative h-full">
                {/* Popular Glow Effect */}
                {plan.popular && (
                  <div className="absolute -inset-1 bg-linear-to-r from-skin to-primary rounded-3xl opacity-50 blur-xl" />
                )}

                <div
                  className={cn(
                    "relative h-full rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1",
                    plan.popular
                      ? "bg-gradient-to-b from-primary to-[#5a0f1a] border-2 border-skin/30"
                      : "bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20",
                  )}
                >
                  {/* Gradient Top Border */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                      plan.popular
                        ? "from-skin via-white/50 to-skin"
                        : "from-white/20 via-white/40 to-white/20",
                    )}
                  />

                  <div className="p-5 sm:p-6 pt-6 sm:pt-8">
                    {/* Highlight Badge */}
                    {plan.popular ? (
                      <motion.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="inline-flex bg-gradient-to-r from-skin to-skin-mid text-primary text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-skin/30 mb-4"
                      >
                        {plan.highlight}
                      </motion.div>
                    ) : (
                      <div className="inline-flex bg-white/10 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                        {plan.highlight}
                      </div>
                    )}

                    {/* Plan Info */}
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-white/50">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mt-6 mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">
                          ₹{isMonthly ? plan.monthlyPrice : plan.weeklyPrice}
                        </span>
                        <span className="text-white/50">
                          /{isMonthly ? "month" : "week"}
                        </span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link href={`/plans/${plan.id}`}>
                      <Button
                        className={cn(
                          "w-full rounded-full h-11 font-semibold transition-all",
                          plan.popular
                            ? "bg-gradient-to-r from-skin to-skin-mid hover:from-skin-light hover:to-skin text-primary shadow-lg shadow-skin/30 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-white/10 hover:bg-white/20 text-white border border-white/20",
                        )}
                      >
                        {plan.popular ? (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Get Started
                          </>
                        ) : (
                          "Select Plan"
                        )}
                      </Button>
                    </Link>

                    {/* Features */}
                    <div className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                              plan.popular ? "bg-skin/20" : "bg-white/10",
                            )}
                          >
                            <Check
                              className={cn(
                                "h-3 w-3",
                                plan.popular
                                  ? "text-skin"
                                  : "text-white/70",
                              )}
                            />
                          </div>
                          <span className="text-sm text-white/70">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
