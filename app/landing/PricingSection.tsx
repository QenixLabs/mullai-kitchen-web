"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useMotionValue,
  useTransform,
  useSpring,
  animate,
} from "motion/react";
import { Check, Sparkles, Shield, Clock, Leaf, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
  floatAnimation,
} from "./animations";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "basic",
    name: "Basic Tiffin",
    description: "Perfect for light breakfast or dinner",
    weeklyPrice: 999,
    monthlyPrice: 3499,
    perMealWeekly: 71,
    perMealMonthly: 62,
    popular: false,
    features: [
      "2 meals per day",
      "Choice of breakfast items",
      "Daily sambar & chutney",
      "Standard delivery",
      "Cancel anytime",
    ],
    highlight: "Best for singles",
  },
  {
    id: "daily",
    name: "Daily Meals",
    description: "Complete lunch or dinner subscription",
    weeklyPrice: 1499,
    monthlyPrice: 5299,
    perMealWeekly: 107,
    perMealMonthly: 94,
    popular: true,
    features: [
      "Full thali (rice, dal, 2 veg)",
      "Appalam & curd included",
      "Customizable menu",
      "Priority delivery",
      "Pause/skip days",
      "Free delivery",
    ],
    highlight: "Most Popular",
  },
  {
    id: "executive",
    name: "Executive Plus",
    description: "Premium ingredients & desserts",
    weeklyPrice: 2199,
    monthlyPrice: 7999,
    perMealWeekly: 157,
    perMealMonthly: 142,
    popular: false,
    features: [
      "Organic ingredients",
      "Includes sweet & beverage",
      "Zero delivery fees",
      "Nutritionist consultation",
      "Exclusive dishes",
      "Family sharing option",
    ],
    highlight: "Premium choice",
  },
];

// Counter animation hook
import { useCounter } from "@/hooks/use-counter";

// Tilt Card Component
function TiltCard({
  children,
  className,
  popular,
}: {
  children: React.ReactNode;
  className?: string;
  popular?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isMonthly, setIsMonthly] = useState(false);

  return (
    <section ref={ref} className="relative py-12 lg:py-16 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-linear-to-b from-[#1a0509] via-[#0d0205] to-[#1a0509]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-1/4 left-1/4"
        >
          <div className="w-96 h-96 bg-skin/5 rounded-full blur-[120px]" />
        </motion.div>
        <motion.div
          animate={{
            ...floatAnimation,
            transition: { ...floatAnimation.transition, delay: 2 },
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
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-primary to-[#5a0f1a] border border-skin/20 mb-4"
          >
            <Sparkles className="h-3.5 w-3.5 text-skin" />
            <span className="text-xs font-semibold text-white tracking-wide">
              Flexible Plans
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 tracking-tight"
          >
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-skin to-skin-light">
              Subscription
            </span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-base text-white/60 mb-6">
            Flexible plans for every appetite and lifestyle. Save more with
            monthly subscriptions.
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
              Save 15%
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Premium Pricing Cards */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
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
              <TiltCard popular={plan.popular} className="relative h-full">
                {/* Popular Glow Effect */}
                {plan.popular && (
                  <div className="absolute -inset-0.5 bg-linear-to-r from-skin to-primary rounded-2xl opacity-40 blur-lg" />
                )}

                <div
                  className={cn(
                    "relative h-full rounded-2xl overflow-hidden",
                    plan.popular
                      ? "bg-gradient-to-b from-primary to-[#5a0f1a] border border-skin/30"
                      : "bg-white/5 backdrop-blur-xl border border-white/10",
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

                  <div className="p-4 sm:p-5 lg:p-6 pt-5 sm:pt-6">
                    {/* Popular Badge */}
                    {plan.popular && (
                      <motion.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="inline-flex bg-gradient-to-r from-skin to-skin-mid text-primary text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-skin/30 mb-3"
                      >
                        {plan.highlight}
                      </motion.div>
                    )}
                    {/* Plan Info */}
                    <div className="pt-4">
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
                        <span className="text-4xl font-bold text-white">
                          ₹{isMonthly ? plan.monthlyPrice : plan.weeklyPrice}
                        </span>
                        <span className="text-white/50">
                          /{isMonthly ? "month" : "week"}
                        </span>
                      </div>
                      <p className="text-sm text-white/50 mt-1">
                        Just ₹
                        {isMonthly ? plan.perMealMonthly : plan.perMealWeekly}{" "}
                        per meal
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Link href="/plans">
                      <Button
                        className={cn(
                          "w-full rounded-full h-12 font-semibold transition-all",
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
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Premium Trust Badges */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="mt-16 flex flex-wrap justify-center gap-6"
        >
          {[
            { icon: Shield, text: "FSSAI Certified" },
            { icon: Leaf, text: "No Preservatives" },
            { icon: Clock, text: "30-min Delivery" },
            { icon: Flame, text: "Hot & Fresh" },
          ].map((badge) => (
            <div
              key={badge.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              <badge.icon className="h-4 w-4 text-skin" />
              <span className="text-sm font-medium text-white/70">
                {badge.text}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
