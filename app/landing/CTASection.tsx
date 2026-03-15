"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "motion/react";
import { ArrowRight, Clock, Sparkles, UtensilsCrossed, ChefHat, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, scaleIn, floatAnimation } from "./animations";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 34,
    seconds: 12
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#39070F] via-[#1a0509] to-[#0d0205]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-0 left-1/3"
        >
          <div className="w-96 h-96 bg-[#D4A574]/10 rounded-full blur-[150px]" />
        </motion.div>
        <motion.div
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 3 } }}
          className="absolute bottom-0 right-1/3"
        >
          <div className="w-80 h-80 bg-[#39070F]/20 rounded-full blur-[120px]" />
        </motion.div>

        {/* Floating Decorative Icons */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-20 left-20 opacity-10"
        >
          <UtensilsCrossed className="h-32 w-32 text-white" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-20 right-20 opacity-10"
        >
          <Sparkles className="h-24 w-24 text-[#D4A574]" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
            transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
          className="absolute top-1/3 right-1/4 opacity-5"
        >
          <ChefHat className="h-20 w-20 text-[#D4A574]" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
            transition: { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
          className="absolute bottom-1/3 left-1/4 opacity-5"
        >
          <Heart className="h-16 w-16 text-[#D4A574]" />
        </motion.div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(rgba(212, 165, 116, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 165, 116, 0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
        >
          {/* Premium Badge */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D4A574]/20 to-[#39070F]/20 border border-[#D4A574]/30 mb-8"
          >
            <Clock className="h-4 w-4 text-[#D4A574]" />
            <span className="text-sm font-semibold text-white tracking-wide">Limited Time Offer</span>
          </motion.div>

          {/* Premium Headline */}
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]"
          >
            Ready to Transform
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] via-[#e8c4a0] to-[#D4A574]">
              Your Daily Meals?
            </span>
          </motion.h2>

          {/* Premium Subtext */}
          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/70 mb-10"
          >
            Join thousands of happy customers enjoying healthy, home-style South Indian meals
            every day. Start with your <span className="text-[#D4A574] font-semibold">first meal FREE!</span>
          </motion.p>

          {/* Premium Countdown Timer */}
          <motion.div
            variants={scaleIn}
            className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-xl rounded-3xl px-8 py-6 mb-10 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#39070F] to-[#5a0f1a]">
                <Zap className="h-5 w-5 text-[#D4A574]" />
              </div>
              <div className="text-left">
                <p className="text-sm text-white/60">Next delivery batch starts in</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { value: timeLeft.hours, label: "hrs" },
                { value: timeLeft.minutes, label: "min" },
                { value: timeLeft.seconds, label: "sec" }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-xl px-4 py-3 min-w-[4rem] border border-white/10">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={item.value}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl font-bold text-white"
                      >
                        {item.value.toString().padStart(2, '0')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-white/50 mt-2 block">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Premium CTAs */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/plans">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full bg-gradient-to-r from-[#D4A574] to-[#c49a6a] hover:from-[#e8c4a0] hover:to-[#D4A574] text-[#39070F] font-bold shadow-xl shadow-[#D4A574]/30 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/plans">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 rounded-full border-2 border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 hover:border-[#D4A574]/50 transition-all"
              >
                View Full Menu
              </Button>
            </Link>
          </motion.div>

          {/* Premium Trust Text */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40"
          >
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              FSSAI Certified
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
