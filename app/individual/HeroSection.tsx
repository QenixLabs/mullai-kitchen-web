"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp, slideInRight, staggerContainer } from "../landing/animations";
import { useCounter } from "@/hooks/use-counter";
import { Users, Star, Clock, MapPin, Search, Flame, Zap } from "lucide-react";

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
      <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-skin/20">
        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-skin" />
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1 leading-none">
          <span className="text-base sm:text-lg font-bold text-white">{displayValue}</span>
          {suffix && <span className="text-xs sm:text-sm font-semibold text-skin">{suffix}</span>}
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
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80"
          alt="South Indian meal background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#39070F]/90 via-[#39070F]/70 to-[#39070F]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#39070F] via-[#39070F]/60 to-transparent" />
      </div>

      {/* Glow Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-skin/10 blur-[100px]" />
        <div className="absolute bottom-10 right-5 h-80 w-80 rounded-full bg-primary/35 blur-[120px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-center min-h-[60vh] sm:min-h-[65vh] lg:min-h-[70vh]">
          {/* Left Column - Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="space-y-8"
          >
            {/* Live Badge */}
            <motion.div variants={fadeInUp} className="inline-flex">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-[#5a0f1a] border border-skin/20 shadow-lg shadow-primary/30">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-sm font-semibold text-white tracking-wide">
                  Delivering now to Chennai
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-bold text-white leading-[1.1] tracking-tight"
            >
              Your Personal
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-skin via-skin-light to-skin">
                South Indian Kitchen
              </span>
            </motion.h1>

            {/* Subtext - Horizontal layout */}
            <motion.p
              variants={fadeInUp}
              className="text-lg text-white/70 leading-relaxed max-w-none"
            >
              Get fresh, home-cooked South Indian meals delivered to your doorstep daily. Subscribe once, eat well every day no shopping, no chopping, no cleanup. Just warm, comforting food made for you.
            </motion.p>

            {/* Pincode Checker Card */}
            <motion.div variants={fadeInUp} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-skin/30 to-primary/40 rounded-2xl opacity-70 blur-lg" />
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/40 shadow-2xl overflow-hidden">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  Enter your pincode to check availability
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input
                      type="text"
                      placeholder="600001"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) =>
                        setPincode(e.target.value.replace(/\D/g, ""))
                      }
                      className="h-12 sm:h-14 pl-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 text-base sm:text-lg font-medium rounded-xl focus:ring-2 focus:ring-skin focus:border-transparent"
                    />
                  </div>
                  <Button
                    onClick={handleCheckPincode}
                    disabled={pincode.length !== 6 || isChecking}
                    className="h-12 sm:h-14 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50"
                  >
                    {isChecking ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Check
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Stats Pills */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-2 sm:gap-3"
            >
              <StatPill value={2000} suffix="+" label="Happy Customers" icon={Users} />
              <StatPill value={5} suffix="★" label="Average Rating" icon={Star} />
              <StatPill value={30} suffix="min" label="Avg Delivery" icon={Clock} />
            </motion.div>
          </motion.div>

          {/* Right Column - Food Card */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-skin/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />

              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/50">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-skin to-primary" />

                {/* Today's Special Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-[#5a0f1a] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/30">
                    <Flame className="h-4 w-4 text-skin" />
                    Today&apos;s Special
                  </div>
                </div>

                {/* Food Image */}
                <div className="relative h-72">
                  <Image
                    src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80"
                    alt="Grand South Indian Thali"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 0vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Grand South Indian Thali
                  </h3>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    Rice, sambar, rasam, poriyal, kootu, papad, pickle & sweet
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-primary">₹149</span>
                      <span className="text-sm text-gray-500">/meal</span>
                    </div>
                    <Link href="/plans">
                      <Button className="h-12 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full shadow-lg shadow-primary/30">
                        <Zap className="w-4 h-4 mr-2" />
                        Order Now
                      </Button>
                    </Link>
                  </div>

                  {/* Features */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-skin" />
                      <span>30 min delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-4 w-4 rounded-full bg-skin/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-skin" />
                      </div>
                      <span>Fresh daily</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
