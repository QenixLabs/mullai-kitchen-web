"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Sparkles, Clock, ArrowRight, X, Gift, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "./animations";
import { cn } from "@/lib/utils";

export function PromoBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
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

  if (!isVisible) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      className="relative overflow-hidden"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#39070F] via-[#5a1120] to-[#39070F]" />

      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Dots */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Glow Orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            opacity: [0.3, 0.6, 0.3],
            transition: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-0 left-1/4 w-32 h-32 bg-[#D4A574]/30 rounded-full blur-[60px]"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            opacity: [0.3, 0.6, 0.3],
            transition: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
          className="absolute bottom-0 right-1/4 w-24 h-24 bg-[#D4A574]/20 rounded-full blur-[40px]"
        />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Offer */}
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574] to-[#c49a6a] shadow-lg shadow-[#D4A574]/30"
            >
              <Sparkles className="h-6 w-6 text-[#39070F]" />
            </motion.div>

            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-2xl font-bold text-white">First Meal FREE</span>
                <span className="text-sm text-white/80">on your first subscription!</span>
              </div>
              <p className="text-sm text-white/60">
                Use code: <span className="font-mono font-bold text-[#D4A574]">MULLAI50</span>
              </p>
            </div>
          </div>

          {/* Center: Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Clock className="h-5 w-5 text-[#D4A574]" />
            </div>
            <span className="text-white/70 text-sm font-medium">Offer ends in:</span>
            <div className="flex gap-1.5">
              {[
                timeLeft.hours.toString().padStart(2, '0'),
                timeLeft.minutes.toString().padStart(2, '0'),
                timeLeft.seconds.toString().padStart(2, '0')
              ].map((time, i) => (
                <span key={i} className="flex items-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={time}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="bg-white/20 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-white font-mono font-bold min-w-[2.5rem] text-center text-sm"
                    >
                      {time}
                    </motion.span>
                  </AnimatePresence>
                  {i < 2 && <span className="text-white/40 mx-1 font-bold">:</span>}
                </span>
              ))}
            </div>
          </div>

          {/* Right: CTA */}
          <Link href="/plans">
            <Button className="bg-gradient-to-r from-[#D4A574] to-[#c49a6a] hover:from-[#e8c4a0] hover:to-[#D4A574] text-[#39070F] font-semibold rounded-full px-6 shadow-lg shadow-[#D4A574]/30 transition-all hover:scale-[1.02] active:scale-[0.98] group">
              <Gift className="h-4 w-4 mr-2" />
              Claim Offer
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 sm:static p-1.5 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
