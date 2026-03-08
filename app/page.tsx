"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useInView } from "motion/react";
import {
  FaArrowRight,
  FaUtensils,
  FaStar,
  FaChevronRight,
  FaFire,
  FaCalendarAlt,
  FaTruck,
  FaHeart,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaTools,
  FaBars,
  FaCheckCircle,
  FaSmile,
  FaThumbsUp,
  FaGem,
  FaRocket,
  FaListAlt,
} from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAuthHydrated,
  useIsAuthenticated,
} from "@/hooks/useUserStore";
import { Particles } from "@/components/ui/particles";
import { AuroraText } from "@/components/ui/aurora-text";
import { GridPattern } from "@/components/ui/grid-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useCustomerPlans } from "@/api/hooks/useCustomer";
import { PlanCard } from "@/components/customer/plans/PlanCard";
import { usePlanIntentStore } from "@/providers/plan-intent-store-provider";
import type { PlanBrowseItem } from "@/api/types/customer.types";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// const scaleIn = {
//   initial: { opacity: 0, scale: 0.9 },
//   animate: { opacity: 1, scale: 1 },
// };

// Modern SaaS Hero Section
function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-linear-to-b from-background via-background to-muted/20"
    >
      {/* Base Grid Pattern */}
      <div className="absolute inset-0 z-0">
        <GridPattern
          width={60}
          height={60}
          x={-1}
          y={-1}
          strokeDasharray={"6 6"}
          className="opacity-[0.08]"
        />
      </div>

      {/* Secondary Grid - Offset for depth */}
      <div className="absolute inset-0 z-0 translate-x-7.5 translate-y-7.5">
        <GridPattern
          width={60}
          height={60}
          x={-1}
          y={-1}
          strokeDasharray={"2 4"}
          className="opacity-[0.05]"
        />
      </div>

      {/* Primary Particles Layer */}
      <Particles
        className="absolute inset-0 z-1"
        quantity={100}
        ease={70}
        size={0.5}
        staticity={35}
        color="#39070F"
      />

      {/* Secondary Particles Layer - Golden/Warm */}
      <Particles
        className="absolute inset-0 z-1"
        quantity={50}
        ease={60}
        size={0.3}
        staticity={50}
        color="#D4A574"
      />

      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 z-2 overflow-hidden">
        {/* Large Primary Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 0.2, 
            scale: 1,
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ 
            opacity: { duration: 2 },
            scale: { duration: 2 },
            x: { duration: 15, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -right-40 -top-40 h-175 w-175 rounded-full bg-linear-to-br from-primary via-primary/80 to-transparent blur-[120px]"
        />
        
        {/* Secondary Accent Orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 0.15, 
            scale: 1,
            x: [0, -20, 0],
            y: [0, 40, 0]
          }}
          transition={{ 
            opacity: { duration: 2, delay: 0.3 },
            scale: { duration: 2, delay: 0.3 },
            x: { duration: 18, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 14, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute -left-40 top-1/4 h-150 w-150 rounded-full bg-linear-to-br from-accent via-accent/70 to-transparent blur-[120px]"
        />
        
        {/* Warm Glow Orb - Bottom Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 0.12, 
            scale: 1,
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            opacity: { duration: 2, delay: 0.6 },
            scale: { duration: 2, delay: 0.6 },
            x: { duration: 20, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 16, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-0 right-1/4 h-125 w-125 rounded-full bg-linear-to-br from-amber-600/40 via-orange-500/30 to-transparent blur-[130px]"
        />

        {/* Subtle Purple/Blue Accent */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 0.08, 
            scale: 1,
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            opacity: { duration: 2, delay: 0.9 },
            scale: { duration: 2, delay: 0.9 },
            x: { duration: 22, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 18, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/2 left-1/3 h-100 w-100 rounded-full bg-linear-to-br from-purple-500/30 via-pink-500/20 to-transparent blur-[100px]"
        />
      </div>

      {/* Animated Light Beams */}
      <div className="absolute inset-0 z-3 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: [0, 0.3, 0], x: ["-100%", "200%"] }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut"
          }}
          className="absolute top-0 left-0 h-full w-32 bg-linear-to-r from-transparent via-white/10 to-transparent rotate-12 blur-xl"
        />
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: [0, 0.2, 0], x: ["-100%", "200%"] }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            repeatDelay: 7,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute top-1/3 left-0 h-3/4 w-24 bg-linear-to-r from-transparent via-primary/10 to-transparent -rotate-6 blur-xl"
        />
      </div>

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 z-4 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette Effect */}
      <div 
        className="absolute inset-0 z-5 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(var(--background), 0.8) 100%)'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex max-w-7xl items-center px-6 pt-16 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="flex flex-col justify-center"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp} 
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                <span className="text-sm font-medium text-primary">
                  Now Serving in Your City
                </span>
              </div>
            </motion.div>

            {/* Main Heading with Aurora Gradient */}
            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
            >
              <span className="text-foreground">Home-style</span>
              <br />
              <AuroraText
                className="font-extrabold"
                colors={["#39070F", "#7c2d45", "#39070F"]}
                speed={0.7}
              >
                Meals Delivered
              </AuroraText>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Subscribe to fresh, healthy meals crafted with love. 
              Pause, customize, or cancel anytime.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <Link href="/plans">
                <ShimmerButton
                  shimmerColor="#ffffff"
                  shimmerSize="0.1em"
                  shimmerDuration="2s"
                  background="hsl(var(--primary))"
                  className="h-14 px-8 text-base font-semibold shadow-xl shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    Explore Meal Plans
                    <FaArrowRight className="h-5 w-5" />
                  </span>
                </ShimmerButton>
              </Link>

              <Link href="/plans">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-2 border-border/60 bg-white/50 px-8 text-base font-semibold backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-white/80"
                >
                  View Menu
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex items-center gap-8"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-background bg-linear-to-br from-primary/20 to-primary/40 text-sm font-semibold text-primary shadow-lg"
                  >
                    {i}K
                  </motion.div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.05 }}
                    >
                      <FaStar className="h-4 w-4 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                  <span className="ml-2 text-sm font-bold text-foreground">
                    4.9
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Trusted by 2,000+ happy customers
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Glass Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-2 shadow-2xl backdrop-blur-xl">
                <div className="relative h-130 overflow-hidden rounded-2xl">
                <Image
                  src="/images/food/3.jpg"
                  alt="Delicious home-cooked Indian thali"
                  fill
                  className="object-cover"
                  priority
                />
                  <div className="absolute inset-0 bg-linear-to-t from-primary/30 via-transparent to-transparent" />
                </div>
              </div>

              {/* Floating Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 40, x: -20 }}
                animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: 40, x: -20 }}
                transition={{ duration: 0.7, delay: 0.5, type: "spring", stiffness: 100 }}
                className="absolute -left-8 top-12 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 shadow-lg shadow-emerald-200">
                    <FaCheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">100% Fresh</p>
                    <p className="text-sm text-muted-foreground">Farm to Table</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40, x: -20 }}
                animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: 40, x: -20 }}
                transition={{ duration: 0.7, delay: 0.65, type: "spring", stiffness: 100 }}
                className="absolute -left-4 bottom-24 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 shadow-lg shadow-amber-200">
                    <FaRocket className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Always On Time</p>
                    <p className="text-sm text-muted-foreground">Daily Delivery</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40, x: 20 }}
                animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: 40, x: 20 }}
                transition={{ duration: 0.7, delay: 0.8, type: "spring", stiffness: 100 }}
                className="absolute -right-4 top-8 rounded-2xl border border-white/30 bg-white/80 p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 shadow-lg shadow-rose-200">
                    <FaSmile className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Made with Love</p>
                    <p className="text-sm text-muted-foreground">Home Kitchen</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent" />
    </section>
  );
}

// Features Section Component
function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: FaUtensils,
      title: "Expert Chefs",
      description:
        "Our meals are crafted by professional chefs who understand the art of home cooking.",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: FaCalendarAlt,
      title: "Flexible Plans",
      description:
        "Choose from weekly or monthly subscriptions. Pause, modify, or cancel anytime.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: FaCheckCircle,
      title: "Quality Assured",
      description:
        "Every meal passes strict quality checks. Fresh ingredients, hygienic preparation.",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: FaHeart,
      title: "Healthy & Nutritious",
      description:
        "Balanced meals designed by nutritionists. No artificial preservatives or additives.",
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: FaFire,
      title: "Hot & Fresh",
      description:
        "Delivered in temperature-controlled packaging to ensure your food stays hot.",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: FaTruck,
      title: "Free Delivery",
      description:
        "Complimentary delivery to your doorstep. Track your meals in real-time.",
      color: "bg-indigo-100 text-indigo-600",
    },
  ];

  return (
    <section ref={ref} className="relative bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Badge
              variant="secondary"
              className="mb-4 rounded-sm bg-accent/50 px-4 py-2"
            >
              Why Choose Us
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            The Mullai Kitchen Difference
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground" 
          >
            We combine the warmth of home cooking with the convenience of modern tech
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group rounded-sm bg-card p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
            >
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center rounded-sm ${feature.color} transition-transform duration-300 group-hover:scale-110`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    {
      number: "01",
      title: "Choose Your Plan",
      description:
        "Browse our diverse meal plans and select one that fits your taste and schedule.",
      icon: FaListAlt,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      number: "02",
      title: "Build Your Own Plan",
      description:
        "Create a personalized plan based on your convenience. Choose delivery days, meal timing, and portions that fit your schedule perfectly.",
      icon: FaCalendarAlt,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      number: "03",
      title: "Customize Menu",
      description:
        "Pick your favorite dishes from our rotating weekly menu. Mix and match as you like.",
      icon: FaTools,
      color: "bg-amber-100 text-amber-600",
    },
    {
      number: "04",
      title: "We Cook & Deliver",
      description:
        "Our chefs prepare your meals fresh daily. Delivered hot to your doorstep.",
      icon: FaTruck,
      color: "bg-blue-100 text-blue-600",
    },
    {
      number: "05",
      title: "Enjoy & Repeat",
      description:
        "Savor delicious home-style food. Pause or modify your plan anytime.",
      icon: FaSmile,
      color: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden bg-background py-24">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 0.3 } : { opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute -left-40 top-1/2 h-125 w-125 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Badge
              variant="secondary"
              className="mb-4 rounded-sm bg-accent/50 px-4 py-2"
            >
              Simple Process
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            How It Works
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Getting started is easy. Five simple steps to delicious meals.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid items-stretch gap-8 md:grid-cols-2 lg:grid-cols-5"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative flex"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-linear-to-b from-border to-transparent lg:block" />
              )}

              <div className="relative flex h-full w-full flex-col rounded-sm bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl font-bold text-primary/20">
                    {step.number}
                  </span>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-sm ${step.color.split(' ')[0]}`}>
                    <step.icon className={`h-6 w-6 ${step.color.split(' ')[1]}`} />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="grow text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// Menu Preview Section Component
function MenuPreviewSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const menuItems = [
    { name: "Butter Chicken", type: "Non-Veg", calories: "450 cal" },
    { name: "Paneer Tikka", type: "Veg", calories: "320 cal" },
    { name: "Dal Makhani", type: "Veg", calories: "280 cal" },
    { name: "Biryani Special", type: "Non-Veg", calories: "520 cal" },
  ];

  return (
    <section ref={ref} className="relative bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
              <Badge
                variant="secondary"
                className="mb-4 rounded-sm bg-accent/50 px-4 py-2"
              >
                Weekly Menu
              </Badge>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Authentic Indian Cuisine
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 text-lg text-muted-foreground"
            >
              From traditional North Indian curries to South Indian delicacies, our menu celebrates the rich diversity of Indian flavors. Fresh ingredients, authentic recipes, and lots of love.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 space-y-4"
            >
              {menuItems.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-sm border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-100">
                    <FaThumbsUp className="h-5 w-5 text-emerald-600" />
                  </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.calories}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={item.type === "Veg" ? "default" : "secondary"}
                    className="rounded-sm"
                  >
                    {item.type}
                  </Badge>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.6, delay: 0.4 }}>
              <Link href="/plans">
                <Button className="h-12 rounded-sm bg-primary px-6 text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:bg-primary/90">
                  View Full Menu
                  <FaChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-48 overflow-hidden rounded-sm">
                  <Image
                    src="/images/food/4.jpg"
                    alt="Crispy dosa with chutneys"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 overflow-hidden rounded-sm">
                  <Image
                    src="/images/food/6.jpg"
                    alt="Traditional Indian thali"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative h-64 overflow-hidden rounded-sm">
                  <Image
                    src="/images/food/8.jpg"
                    alt="South Indian banana leaf meal"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-48 overflow-hidden rounded-sm">
                  <Image
                    src="/images/food/3.jpg"
                    alt="Authentic Indian cuisine"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="absolute -bottom-6 -left-6 rounded-sm bg-card p-6 shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-violet-100">
                  <FaGem className="h-7 w-7 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">50+</p>
                  <p className="text-sm text-muted-foreground">
                    Unique Dishes
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Pricing Section Component with Real Plan Cards
function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const setPlanIntent = usePlanIntentStore((store) => store.setPlanIntent);
  const setSourceRoute = usePlanIntentStore((store) => store.setSourceRoute);

  const plansQuery = useCustomerPlans({});
  const plans = plansQuery.data?.plans ?? [];

  const handleSelectPlan = (plan: PlanBrowseItem) => {
    setPlanIntent(plan._id, plan);
    setSourceRoute("/");

    const isSignedIn = hasHydrated && isAuthenticated;
    router.push(isSignedIn ? "/checkout" : "/auth/signin?redirect=/checkout");
  };

  const handleViewMenu = (plan: PlanBrowseItem) => {
    router.push(`/plans?highlight=${plan._id}`);
  };

  return (
    <section ref={ref} className="relative bg-background py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Badge
              variant="secondary"
              className="mb-4 rounded-sm bg-accent/50 px-4 py-2"
            >
              Pricing
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Choose Your Plan
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Flexible plans designed to fit your lifestyle and budget
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
        >
          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-4 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
            {plansQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 w-72 shrink-0 animate-pulse rounded-sm border border-orange-100 bg-white"
                />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onViewMenu={handleViewMenu}
                  onSelectPlan={handleSelectPlan}
                  variant="compact"
                />
              ))
            ) : null}
          </div>

          {/* Desktop: Grid */}
          <div className="hidden grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 sm:grid">
            {plansQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-104 animate-pulse rounded-sm border border-orange-100 bg-white"
                />
              ))
            ) : plans.length > 0 ? (
              plans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onViewMenu={handleViewMenu}
                  onSelectPlan={handleSelectPlan}
                  variant="default"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No plans available at the moment.</p>
                <Link href="/plans">
                  <Button className="mt-4 bg-primary text-primary-foreground">
                    View All Plans
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Working Professional",
      content:
        "Mullai Kitchen has been a lifesaver! After long work days, I don't have to worry about cooking. The food tastes just like home.",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      role: "Business Owner",
      content:
        "The quality and consistency are amazing. I've been subscribing for 6 months now and have never been disappointed.",
      rating: 5,
    },
    {
      name: "Anita Patel",
      role: "Homemaker",
      content:
        "Even though I cook, sometimes I need a break. Mullai Kitchen's meals are so authentic and delicious. My family loves it!",
      rating: 5,
    },
  ];

  return (
    <section ref={ref} className="relative bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Badge
              variant="secondary"
              className="mb-4 rounded-sm bg-accent/50 px-4 py-2"
            >
              Testimonials
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            What Our Customers Say
          </motion.h2>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid gap-8 md:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-sm bg-card p-6 shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar
                    key={i}
                    className="h-5 w-5 fill-warning text-warning"
                  />
                ))}
              </div>
              <p className="mb-6 text-foreground">&quot;{testimonial.content}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <FaSmile className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section Component
function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const faqs = [
    {
      question: "How do I pause or cancel my subscription?",
      answer:
        "You can pause or cancel your subscription anytime from your dashboard. Just go to your subscription settings and select the option you need. No questions asked!",
    },
    {
      question: "What areas do you deliver to?",
      answer:
        "We currently deliver to most areas in major cities. Enter your pincode on our plans page to check availability in your area.",
    },
    {
      question: "Can I customize my meals?",
      answer:
        "Yes! You can customize spice levels, portion sizes, and dietary preferences. Our monthly and family plans offer advanced customization options.",
    },
    {
      question: "How fresh is the food?",
      answer:
        "All meals are prepared fresh daily using high-quality ingredients. We use temperature-controlled packaging to ensure your food stays hot and fresh during delivery.",
    },
  ];

  return (
    <section ref={ref} className="relative bg-background py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeInUp} transition={{ duration: 0.6 }}>
            <Badge
              variant="secondary"
              className="mb-4 rounded-sm bg-accent/50 px-4 py-2"
            >
              FAQ
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
          >
            Frequently Asked Questions
          </motion.h2>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-sm border border-border bg-card p-6 shadow-sm"
            >
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {faq.question}
              </h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section Component
function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-primary py-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="mb-6 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl"
          >
            Ready to Transform Your Meals?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8 text-lg text-primary-foreground/90"
          >
            Join thousands of happy customers enjoying healthy, home-style meals
            every day. Start your journey to better eating today.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/plans">
              <Button
                size="lg"
                className="h-14 rounded-sm bg-background px-8 text-base font-semibold text-primary shadow-lg transition-all duration-300 hover:bg-background/90"
              >
                Get Started Now
                <FaArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/plans">
              <Button
                variant="outline"
                size="lg"
                className="h-14 rounded-sm border-2 border-primary-foreground/30 bg-transparent px-8 text-base font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/10"
              >
                View Menu
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-card py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center">
              <div className="flex h-12 w-36 items-center justify-center overflow-hidden rounded-sm">
                <Image
                  src="/logo.png"
                  alt="Mullai Kitchen"
                  width={144}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <p className="mb-6 text-muted-foreground">
              Bringing the warmth of home cooking to your doorstep. Fresh, healthy, delicious meals delivered daily.
            </p>
            <div className="flex gap-4">
              {[FaPhone, FaEnvelope].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-sm bg-muted transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-3">
              {["Home", "Meal Plans", "Menu", "About Us", "Contact"].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="/plans"
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Support</h3>
            <ul className="space-y-3">
              {[
                "Help Center",
                "FAQs",
                "Terms of Service",
                "Privacy Policy",
                "Refund Policy",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-0.5 h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  Building No./Flat No.: 51A<br />
                  Road/Street: BAJANAI KOVIL STREET<br />
                  Locality/Sub Locality: SULLAIMEDU<br />
                  City/Town/Village: Chennai<br />
                  District: Chennai<br />
                  State: Tamil Nadu<br />
                  PIN Code: 600094
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="h-5 w-5 text-primary" />
                <span className="text-muted-foreground">
                  hello@mullaikitchen.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mullai Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  const hasHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Mullai Kitchen"
              width={150}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {hasHydrated && isAuthenticated ? (
              <>
                <Link
                  href="/plans"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Meal Plans
                </Link>
                <Link
                  href="/subscription"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Subscriptions
                </Link>
                <Link href="/plans">
                  <Button className="h-10 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90">
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/plans"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Meal Plans
                </Link>
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button className="h-10 rounded-sm bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary/90">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <FaBars className="h-5 w-5" />
          </Button>
        </div>
      </nav>

      {/* Page Sections */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <MenuPreviewSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
