"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useMotionValue, useTransform, useSpring } from "motion/react";
import { Check, Sparkles, Shield, Clock, Leaf, Flame, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";

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
      "Cancel anytime"
    ],
    highlight: "Best for singles"
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
      "Free delivery"
    ],
    highlight: "Most Popular"
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
      "Family sharing option"
    ],
    highlight: "Premium choice"
  }
];

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
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
    <section ref={ref} className="py-20 bg-white">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4"
          >
            <Sparkles className="h-4 w-4" />
            Flexible Plans
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Choose Your Subscription
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-gray-600 mb-8"
          >
            Flexible plans for every appetite and lifestyle. Save more with monthly subscriptions.
          </motion.p>

          {/* Toggle */}
          <motion.div 
            variants={fadeInUp}
            className="flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium ${!isMonthly ? "text-[#39070F]" : "text-gray-500"}`}>
              Weekly
            </span>
            <Switch
              checked={isMonthly}
              onCheckedChange={setIsMonthly}
              className="data-[state=checked]:bg-[#39070F]"
            />
            <span className={`text-sm font-medium ${isMonthly ? "text-[#39070F]" : "text-gray-500"}`}>
              Monthly
            </span>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
              Save 15%
            </span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={scaleIn}
              className="perspective-1000"
            >
              <TiltCard
                className={`relative h-full rounded-3xl p-1 ${
                  plan.popular 
                    ? "bg-gradient-to-b from-[#39070F] to-[#D4A574]" 
                    : "bg-gray-100"
                }`}
              >
                <div className={`h-full rounded-[22px] p-6 ${
                  plan.popular ? "bg-white" : "bg-white border border-gray-200"
                }`}
                >
                  {/* Popular Badge */}
                  
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#39070F] to-[#D4A574] text-white text-xs font-bold px-4 py-1 rounded-full"
                    >
                      {plan.highlight}
                    </motion.div>
                  )}

                  {/* Plan Info */}
                  <div className="pt-4">
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mt-6 mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-[#39070F]">
                        ₹{isMonthly ? plan.monthlyPrice : plan.weeklyPrice}
                      </span>
                      <span className="text-gray-500">/{isMonthly ? "month" : "week"}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Just ₹{isMonthly ? plan.perMealMonthly : plan.perMealWeekly} per meal
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link href="/plans">
                    <Button 
                      className={`w-full rounded-full h-12 font-semibold ${
                        plan.popular 
                          ? "bg-[#39070F] hover:bg-[#39070F]/90 text-white" 
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                    >
                      {plan.popular ? "Get Started" : "Select Plan"}
                    </Button>
                  </Link>

                  {/* Features */}
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          plan.popular ? "bg-[#39070F]/10" : "bg-gray-100"
                        }`}>
                          <Check className={`h-3 w-3 ${plan.popular ? "text-[#39070F]" : "text-gray-600"}`} />
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="mt-16 flex flex-wrap justify-center gap-8"
        >
          {[
            { icon: Shield, text: "FSSAI Certified" },
            { icon: Leaf, text: "No Preservatives" },
            { icon: Clock, text: "30-min Delivery" },
            { icon: Flame, text: "Hot & Fresh" }
          ].map((badge) => (
            <div key={badge.text} className="flex items-center gap-2 text-gray-600">
              <badge.icon className="h-5 w-5 text-[#39070F]" />
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
