"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, scaleIn } from "../landing/animations";
import {
  Clock,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Gift,
} from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      {/* Dark Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-[#1a0509] to-[#0d0205]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={{
            y: [0, -30, 0],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-0 left-1/4"
        >
          <div className="w-[500px] h-[500px] bg-skin/10 rounded-full blur-[150px]" />
        </motion.div>
        <motion.div
          animate={{
            y: [0, 30, 0],
            transition: { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
          className="absolute bottom-0 right-1/4"
        >
          <div className="w-[400px] h-[400px] bg-primary/20 rounded-full blur-[120px]" />
        </motion.div>

        {/* Floating Food Images */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute top-20 left-[5%] hidden lg:block"
        >
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-2 border-skin/20">
            <Image
              src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=200"
              alt="Meal"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
            transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
          className="absolute bottom-32 left-[8%] hidden lg:block"
        >
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=200"
              alt="Food"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 },
          }}
          className="absolute top-32 right-[5%] hidden lg:block"
        >
          <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-skin/20">
            <Image
              src="https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80&w=200"
              alt="Dish"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 },
          }}
          className="absolute bottom-24 right-[10%] hidden lg:block"
        >
          <div className="relative w-20 h-20 rounded-lg overflow-hidden shadow-2xl border-2 border-white/10">
            <Image
              src="https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&q=80&w=200"
              alt="Thali"
              fill
              className="object-cover"
            />
          </div>
        </motion.div>

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212, 165, 116, 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(212, 165, 116, 0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center"
        >
          {/* Premium Badge with Gift Icon */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-skin/20 to-primary/20 border border-skin/30 mb-8 shadow-lg shadow-skin/10"
          >
            <Gift className="h-4 w-4 text-skin" />
            <span className="text-sm font-semibold text-white tracking-wide">
              Special Launch Offer
            </span>
            <span className="text-xs text-skin font-bold ml-1">• 50% OFF</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            variants={fadeInUp}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.05]"
          >
            Start Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-skin via-skin-light to-skin">
              Meal Plan
            </span>
            <br className="hidden sm:block" />
            <span className="text-white">Today</span>
          </motion.h2>

          {/* Subtext */}
          <motion.div
            variants={fadeInUp}
            className="text-lg sm:text-xl text-white/70 mb-10 mx-auto leading-relaxed space-y-2"
          >
            <p>Join thousands of individuals enjoying healthy, home-style South Indian meals delivered daily.</p>
            <p>No cooking, no cleaning, just great food!</p>
          </motion.div>

          {/* Countdown Timer Card */}
          <motion.div
            variants={scaleIn}
            className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-xl rounded-3xl px-6 sm:px-10 py-6 mb-10 border border-white/10 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-[#5a0f1a] shadow-lg">
                <Clock className="h-5 w-5 text-skin" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Offer ends in</p>
                <p className="text-xs text-white/50">Hurry! Limited spots available</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { value: timeLeft.hours, label: "hrs" },
                { value: timeLeft.minutes, label: "min" },
                { value: timeLeft.seconds, label: "sec" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="bg-gradient-to-b from-white/15 to-white/5 rounded-xl px-4 py-3 min-w-[3.5rem] border border-white/15 shadow-inner">
                    <AnimatePresence mode="popLayout">
                      <motion.span
                        key={item.value}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-2xl font-bold text-white block"
                      >
                        {item.value.toString().padStart(2, "0")}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="text-xs text-white/40 mt-1.5 block font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="h-16 px-12 rounded-full bg-gradient-to-r from-skin to-skin-mid hover:from-skin-light hover:to-skin text-primary font-bold shadow-2xl shadow-skin/40 transition-all hover:scale-[1.03] active:scale-[0.98] group text-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/plans">
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 rounded-full border-2 border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 hover:border-skin/50 transition-all text-lg"
              >
                View Plans
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof - Customer Avatars */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-primary bg-skin/20 flex items-center justify-center overflow-hidden"
                >
                  <Users className="w-5 h-5 text-skin/70" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-primary bg-skin flex items-center justify-center">
                <span className="text-xs font-bold text-primary">+2k</span>
              </div>
            </div>
            <p className="text-sm text-white/60">
              <span className="text-skin font-semibold">2,000+</span> happy customers
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-skin" />
              First meal FREE
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
