"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView, useMotionValue, useTransform, animate } from "motion/react";
import { MapPin, Search, ArrowRight, Star, Flame, Clock, Users, ChefHat, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer, slideInRight, floatAnimation } from "./animations";
import { cn } from "@/lib/utils";

// Counter animation hook
function useCounter(target: number, duration: number = 2) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.round(latest))
      });
      return controls.stop;
    }
  }, [isInView, target, duration]);

  return { ref, displayValue };
}

// Stat Pill Component
function StatPill({
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
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
    >
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574] to-[#c49a6a] flex-shrink-0">
        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#39070F]" />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-0.5 sm:gap-1 leading-none">
          <span className="text-base sm:text-lg font-bold text-white">
            {displayValue}
          </span>
          {suffix && (
            <span className="text-xs sm:text-sm font-semibold text-[#D4A574]">{suffix}</span>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 leading-none">{label}</p>
      </div>
    </motion.div>
  );
}

export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [pincode, setPincode] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckPincode = () => {
    if (pincode.length === 6) {
      setIsChecking(true);
      setTimeout(() => {
        setIsChecking(false);
        window.location.href = "/plans";
      }, 800);
    }
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Background Image with Premium Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1920&q=80"
          alt="South Indian Thali"
          fill
          className="object-cover"
          priority
        />
        {/* Premium Gradient Overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-[#39070F]/90 via-[#39070F]/70 to-[#39070F]" />
        <div className="absolute inset-0 bg-linear-to-r from-[#39070F] via-[#39070F]/60 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rotating Circles */}
        <motion.div
          animate={{
            rotate: 360,
            transition: { duration: 30, repeat: Infinity, ease: "linear" }
          }}
          className="absolute -right-40 top-1/4 w-96 h-96 rounded-full border border-[#D4A574]/10"
        />
        <motion.div
          animate={{
            rotate: -360,
            transition: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
          className="absolute -right-20 top-1/3 w-72 h-72 rounded-full border border-[#D4A574]/5"
        />

        {/* Floating Elements */}
        <motion.div
          animate={floatAnimation}
          className="absolute right-[15%] top-[20%]"
        >
          <div className="w-4 h-4 rounded-full bg-[#D4A574]/30 blur-sm" />
        </motion.div>
        <motion.div
          animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 } }}
          className="absolute left-[10%] bottom-[30%]"
        >
          <div className="w-3 h-3 rounded-full bg-[#D4A574]/20 blur-sm" />
        </motion.div>

        {/* Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#D4A574]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#39070F]/30 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-center min-h-[60vh] sm:min-h-[70vh]">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Premium Live Badge */}
            <motion.div variants={fadeInUp} className="inline-flex">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-linear-to-r from-[#39070F] to-[#5a0f1a] border border-[#D4A574]/20 shadow-lg shadow-[#39070F]/30">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-sm font-semibold text-white tracking-wide">Delivering now to Chennai</span>
              </div>
            </motion.div>

            {/* Premium Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-[3.75rem] font-bold text-white leading-[1.1] tracking-tight"
            >
              Authentic South Indian
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#D4A574] via-[#e8c4a0] to-[#D4A574]">
                Meals Delivered Daily
              </span>
            </motion.h1>

            {/* Premium Subtext */}
            <motion.p
              variants={fadeInUp}
              className="text-lg text-white/70 leading-relaxed"
            >
              Cloud kitchen serving fresh, preservative-free South Indian delicacies.
              Subscribe for daily breakfast, lunch, or dinner delivered hot to your door.
            </motion.p>

            {/* Premium Pincode Card */}
            <motion.div
              variants={fadeInUp}
              className="relative"
            >
              <div className="absolute -inset-1 bg-linear-to-r from-[#D4A574] to-[#39070F] rounded-2xl opacity-20 blur-lg" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-2xl overflow-hidden">
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#39070F] via-[#D4A574] to-[#39070F] rounded-t-2xl" />

                <p className="text-sm text-gray-600 mb-3 font-medium">Enter your pincode to check availability</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#39070F]" />
                    <Input
                      type="text"
                      placeholder="600001"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="h-12 sm:h-14 pl-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 text-base sm:text-lg font-medium rounded-xl focus:ring-2 focus:ring-[#D4A574] focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleCheckPincode}
                    disabled={pincode.length !== 6 || isChecking}
                    className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-[#39070F] to-[#5a0f1a] hover:from-[#4a0a15] hover:to-[#6b1020] text-white font-semibold rounded-xl shadow-lg shadow-[#39070F]/30 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isChecking ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        <span className="sm:hidden">Check</span>
                        <span className="hidden sm:inline">Check</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Premium Stats Pills */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-2 sm:gap-3"
            >
              <StatPill
                value={2000}
                suffix="+"
                label="Happy Customers"
                icon={Users}
              />
              <StatPill
                value={4.9}
                suffix="★"
                label="Average Rating"
                icon={Star}
              />
              <StatPill
                value={30}
                suffix="min"
                label="Avg Delivery"
                icon={Truck}
              />
            </motion.div>
          </motion.div>

          {/* Right Content - Premium Today's Special Card */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            className="hidden lg:block"
          >
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative"
            >
              {/* Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#D4A574]/20 to-[#39070F]/20 rounded-3xl blur-2xl opacity-60" />

              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/50">
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-[#39070F] via-[#D4A574] to-[#39070F]" />

                {/* Card Header */}
                <div className="absolute top-4 left-4 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#39070F] to-[#5a0f1a] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-[#39070F]/30"
                  >
                    <Flame className="h-4 w-4 text-[#D4A574]" />
                    Today&apos;s Special
                  </motion.div>
                </div>

                {/* Card Image */}
                <div className="relative h-72">
                  <Image
                    src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80"
                    alt="Grand South Indian Thali"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Grand South Indian Thali</h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    Rice, sambar, rasam, poriyal, kootu, papad, pickle & sweet
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#39070F]">₹149</span>
                      <span className="text-sm text-gray-500">/meal</span>
                    </div>
                    <Button className="h-12 px-6 bg-gradient-to-r from-[#39070F] to-[#5a0f1a] hover:from-[#4a0a15] hover:to-[#6b1020] text-white font-semibold rounded-full shadow-lg shadow-[#39070F]/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      <Zap className="w-4 h-4 mr-2" />
                      Order Now
                    </Button>
                  </div>
                </div>

                {/* Quick Info Badge */}
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#D4A574]" />
                      <span>30 min delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ChefHat className="h-4 w-4 text-[#D4A574]" />
                      <span>Fresh daily</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
