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
    description: "Start your day with wholesome South Indian breakfast.",
    weeklyPrice: 899,
    monthlyPrice: 2999,
    popular: false,
    features: [
      "Idli, Dosa, Pongal varieties",
      "Fresh chutneys",
      "Sambar",
      "Hot coffee/tea",
    ],
    highlight: "MORNING ENERGY",
    highlightColor: "muted",
  },
  {
    id: "lunch",
    name: "Lunch Plan",
    description: "Complete midday meal with rice, curry, and sides.",
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
    highlight: "MOST POPULAR",
    highlightColor: "gold",
  },
  {
    id: "dinner",
    name: "Dinner Plan",
    description: "Light and nutritious evening meals.",
    weeklyPrice: 999,
    monthlyPrice: 3299,
    popular: false,
    features: [
      "Variety rice options",
      "Chapati with curry",
      "Light tiffin items",
      "Soup",
    ],
    highlight: "EVENING COMFORT",
    highlightColor: "muted",
  },
  {
    id: "fullday",
    name: "Full Day Plan",
    description: "Complete nutrition with breakfast, lunch \u0026 dinner.",
    weeklyPrice: 2499,
    monthlyPrice: 7999,
    popular: false,
    features: [
      "All meals included",
      "Customizable menu",
      "Priority delivery",
      "Nutrition balanced",
    ],
    highlight: "BEST VALUE",
    highlightColor: "green",
  },
];

export function PlansSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-[#FAF7F2]">
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white mb-5"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">
              Individual Meal Plans
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight"
          >
            Choose Your <span className="text-primary">Perfect Plan</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="mt-4 text-muted-foreground">
            Flexible meal plans designed for individuals. Save more with monthly subscriptions.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                !isMonthly ? "text-primary" : "text-muted-foreground",
              )}
            >
              Weekly
            </span>
            <Switch
              checked={isMonthly}
              onCheckedChange={setIsMonthly}
              className="data-[state=checked]:bg-primary"
            />
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isMonthly ? "text-primary" : "text-muted-foreground",
              )}
            >
              Monthly
            </span>
            {isMonthly && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                SAVE 20%
              </span>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={scaleIn}
              className={cn(
                "relative rounded-3xl overflow-hidden transition-all",
                plan.popular
                  ? "bg-primary text-white"
                  : "bg-white border border-border/50",
              )}
            >
              <div className="p-6 sm:p-6">
                <div
                  className={cn(
                    "inline-block text-[10px] font-bold tracking-wide px-2.5 py-1 rounded mb-4",
                    plan.popular
                      ? "bg-skin text-primary"
                      : plan.highlightColor === "green"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {plan.highlight}
                </div>

                <h3
                  className={cn(
                    "text-xl font-bold mb-2",
                    plan.popular ? "text-white" : "text-primary",
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "text-sm mb-5",
                    plan.popular ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {plan.description}
                </p>

                <div className="mb-5">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      plan.popular ? "text-white" : "text-primary",
                    )}
                  >
                    ₹{isMonthly ? plan.monthlyPrice : plan.weeklyPrice}
                  </span>
                  <span
                    className={cn(
                      "text-sm",
                      plan.popular ? "text-white/60" : "text-muted-foreground",
                    )}
                  >
                    /{isMonthly ? "month" : "week"}
                  </span>
                </div>

                <Link href="/plans">
                  <Button
                    className={cn(
                      "w-full rounded-full h-11 font-semibold transition-all",
                      plan.popular
                        ? "bg-skin hover:bg-skin/90 text-primary"
                        : "bg-transparent hover:bg-muted text-primary border border-primary",
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

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          plan.popular ? "bg-white/10" : "bg-primary/10",
                        )}
                      >
                        <Check
                          className={cn(
                            "h-3 w-3",
                            plan.popular ? "text-skin" : "text-primary",
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-sm",
                          plan.popular ? "text-white/80" : "text-muted-foreground",
                        )}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
