"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, scaleIn } from "../landing/animations";
import { ArrowRight, Zap, Clock } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 26, seconds: 33 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-primary">
      <div className="absolute inset-0 bg-linear-to-b from-primary via-[#2a0a10] to-primary" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.6)_1px,transparent_0)] bg-size-[34px_34px]" />

      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <motion.div initial="initial" animate={isInView ? "animate" : "initial"} variants={staggerContainer}>
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-skin/30 bg-skin/10 mb-5"
          >
            <Clock className="h-4 w-4 text-skin" />
            <span className="text-xs font-semibold tracking-wide text-skin">Limited Time Offer</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
          >
            READY TO TRANSFORM
            <br />
            <span className="text-skin">YOUR DAILY MEALS?</span>
          </motion.h2>

          <motion.p variants={fadeInUp} className="text-lg text-muted-foreground leading-relaxed">
            Join thousands of happy customers enjoying healthy, home-style South Indian meals every day. Start with your first meal FREE!
          </motion.p>

          <motion.div variants={scaleIn} className="mt-8 inline-flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary border border-white/10">
                <Zap className="h-5 w-5 text-skin" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white uppercase tracking-wide">Next Delivery Batch Starts In</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { value: timeLeft.hours, label: "HRS" },
                { value: timeLeft.minutes, label: "MIN" },
                { value: timeLeft.seconds, label: "SEC" },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="bg-white/10 rounded-lg px-3 py-2 min-w-[2.75rem]">
                    <span className="text-xl font-bold text-white block">
                      {item.value.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/40 mt-1 block font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/auth/signup">
              <Button className="h-12 px-8 rounded-full bg-skin hover:bg-skin/90 text-primary font-semibold transition-all">
                START FREE TRIAL
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button
                variant="outline"
                className="h-12 px-8 rounded-full border-white/20 bg-transparent text-white font-semibold hover:bg-white/10 hover:border-white/30 transition-all"
              >
                VIEW FULL MENU
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/50" />
              NO CREDIT CARD REQUIRED
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/50" />
              CANCEL ANYTIME
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-white/50" />
              FSSAI CERTIFIED
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
