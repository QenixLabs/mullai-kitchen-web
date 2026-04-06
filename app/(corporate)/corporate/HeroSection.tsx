"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "../../landing/animations";
import { Building2, Users, Utensils, ArrowRight } from "lucide-react";

export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/food/1.jpg"
          alt="Corporate catering background"
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
                <Building2 className="h-4 w-4 text-skin" />
                <span className="text-sm font-semibold text-white tracking-wide">
                  Corporate Solutions
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-white leading-[1.1] tracking-tight"
            >
              Premium Corporate
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-skin via-skin-light to-skin">
                Dining Solutions
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeInUp}
              className="text-lg text-white/70 leading-relaxed max-w-none"
            >
              Elevate your workplace dining experience with customized meal programs.
              From daily office lunches to special events, we deliver fresh,
              authentic South Indian cuisine that keeps your team energized and satisfied.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link href="/auth/corporate-signup">
                <Button className="h-12 sm:h-14 px-6 sm:px-8 bg-skin hover:bg-skin/90 text-primary font-semibold rounded-full shadow-lg shadow-skin/30">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#contact">
                <Button
                  variant="outline"
                  className="h-12 sm:h-14 px-6 sm:px-8 border-white/30 text-white hover:bg-white/10 font-semibold rounded-full"
                >
                  Contact Sales
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center gap-6 pt-4"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skin/20">
                  <Building2 className="h-5 w-5 text-skin" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">100+</p>
                  <p className="text-xs text-white/60">Companies Served</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skin/20">
                  <Users className="h-5 w-5 text-skin" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">10,000+</p>
                  <p className="text-xs text-white/60">Employees Fed Daily</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-skin/20">
                  <Utensils className="h-5 w-5 text-skin" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">50,000+</p>
                  <p className="text-xs text-white/60">Meals Delivered</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-skin/20 to-primary/20 rounded-3xl blur-2xl opacity-60" />

              <div className="relative grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  <div className="relative h-40 rounded-2xl overflow-hidden border border-white/20">
                    <Image
                      src="/images/food/1.jpg"
                      alt="Corporate meal"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-56 rounded-2xl overflow-hidden border border-white/20">
                    <Image
                      src="/images/food/2.jpg"
                      alt="Team lunch"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-8">
                  <div className="relative h-56 rounded-2xl overflow-hidden border border-white/20">
                    <Image
                      src="/images/food/3.jpg"
                      alt="Office catering"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative h-40 rounded-2xl overflow-hidden border border-white/20">
                    <Image
                      src="/images/food/4.jpg"
                      alt="Buffet setup"
                      fill
                      className="object-cover"
                    />
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
