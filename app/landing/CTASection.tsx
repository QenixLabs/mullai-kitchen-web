"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { ArrowRight, Clock, Sparkles, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, scaleIn } from "./animations";

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
    <section ref={ref} className="py-20 bg-gradient-to-br from-[#39070F] via-[#4a0a15] to-[#2c050b] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4A574] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#39070F] rounded-full blur-[150px]" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 opacity-10"
      >
        <UtensilsCrossed className="h-32 w-32 text-white" />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 opacity-10"
      >
        <Sparkles className="h-24 w-24 text-[#D4A574]" />
      </motion.div>

      <div className="relative mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
        >
          {/* Badge */}
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium mb-6 border border-white/20"
          >
            <Clock className="h-4 w-4" />
            Limited Time Offer
          </motion.div>

          {/* Headline */}
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl sm:text-5xl font-bold text-white mb-6"
          >
            Ready to Transform
            <br />
            <span className="text-[#D4A574]">Your Daily Meals?</span>
          </motion.h2>

          {/* Subtext */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg text-white/70 mb-8"
          >
            Join thousands of happy customers enjoying healthy, home-style South Indian meals
            every day. Start with your first meal FREE!
          </motion.p>

          {/* Countdown */}
          <motion.div 
            variants={scaleIn}
            className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 mb-10 border border-white/20"
          >
            <div className="text-left">
              <p className="text-sm text-white/60 mb-1">Next delivery batch starts in</p>
              <div className="flex gap-3">
                {[
                  { value: timeLeft.hours, label: "hours" },
                  { value: timeLeft.minutes, label: "min" },
                  { value: timeLeft.seconds, label: "sec" }
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-white/20 rounded-lg px-3 py-2 min-w-[3.5rem]">
                      <span className="text-2xl font-bold text-white">
                        {item.value.toString().padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-xs text-white/60 mt-1 block">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/plans">
              <Button 
                size="lg"
                className="h-14 px-8 rounded-full bg-white text-[#39070F] font-bold hover:bg-white/90 shadow-xl shadow-black/20 group"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/plans">
              <Button 
                size="lg"
                variant="outline"
                className="h-14 px-8 rounded-full border-2 border-white/30 bg-transparent text-white font-semibold hover:bg-white/10"
              >
                View Full Menu
              </Button>
            </Link>
          </motion.div>

          {/* Trust Text */}
          <motion.p 
            variants={fadeInUp}
            className="mt-8 text-sm text-white/50"
          >
            No credit card required • Cancel anytime • FSSAI Certified
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
