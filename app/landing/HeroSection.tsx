"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { MapPin, Search, ArrowRight, Star, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeInUp, staggerContainer, slideInRight, scaleIn } from "./animations";

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
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#39070F] via-[#4a0a15] to-[#2c050b]"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1920&q=80"
          alt="South Indian Thali"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#39070F] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#39070F]/90 via-[#39070F]/70 to-transparent" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { duration: 30, repeat: Infinity, ease: "linear" }
          }}
          className="absolute -right-40 top-1/4 w-80 h-80 rounded-full border border-[#D4A574]/10"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            transition: { duration: 25, repeat: Infinity, ease: "linear" }
          }}
          className="absolute -right-20 top-1/3 w-60 h-60 rounded-full border border-[#D4A574]/5"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12 pt-32 pb-20">
        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-16 items-center min-h-[70vh]">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Live Badge */}
            <motion.div variants={fadeInUp} className="inline-flex">
              <div className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/20">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </div>
                <span className="text-sm font-medium text-white">Delivering now to Chennai</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1]"
            >
              Authentic South Indian
              <br />
              <span className="text-[#D4A574]">Meals Delivered Daily</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-white/80 leading-relaxed"
            >
              Cloud kitchen serving fresh, preservative-free South Indian delicacies. 
              Subscribe for daily breakfast, lunch, or dinner delivered hot to your door.
            </motion.p>

            {/* Pincode Checker */}
            <motion.div 
              variants={fadeInUp}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
            >
              <p className="text-sm text-white/70 mb-3">Enter your pincode to check availability</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="600001"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="h-14 pl-10 bg-white border-0 text-gray-900 placeholder:text-gray-400 text-lg font-medium"
                  />
                </div>
                <Button 
                  onClick={handleCheckPincode}
                  disabled={pincode.length !== 6 || isChecking}
                  className="h-14 px-6 bg-[#D4A574] hover:bg-[#c49a6a] text-[#39070F] font-semibold rounded-lg disabled:opacity-50 whitespace-nowrap"
                >
                  {isChecking ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-[#39070F]/30 border-t-[#39070F] rounded-full"
                    />
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Check
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              variants={fadeInUp}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-[#FBBF24] text-[#FBBF24]" />
                  ))}
                </div>
                <span className="text-white font-semibold">4.9</span>
                <span className="text-white/60">(2,000+ reviews)</span>
              </div>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="h-4 w-4" />
                <span className="text-sm">30 min delivery</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Today's Special Card */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            className="hidden lg:block"
          >
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Card Header */}
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center gap-2 bg-[#39070F] text-white px-3 py-1.5 rounded-full text-sm font-medium">
                  <Flame className="h-4 w-4 text-[#D4A574]" />
                  Today&apos;s Special
                </div>
              </div>

              {/* Card Image */}
              <div className="relative h-64">
                <Image
                  src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80"
                  alt="Grand South Indian Thali"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grand South Indian Thali</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Rice, sambar, rasam, poriyal, kootu, papad, pickle & sweet
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#39070F]">₹149</span>
                    <span className="text-sm text-gray-500">/meal</span>
                  </div>
                  <Button className="bg-[#39070F] hover:bg-[#39070F]/90 text-white rounded-full px-6">
                    Order Now
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
