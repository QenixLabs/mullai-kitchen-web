"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Heart, Users, ChefHat, Star } from "lucide-react";
import { fadeInUp, staggerContainer, floatAnimation } from "./animations";
import { useCounter } from "@/hooks/use-counter";
import { testimonials } from "./testimonials/data";
import { TestimonialFilter } from "./testimonials/TestimonialFilter";
import { TestimonialGrid } from "./testimonials/TestimonialGrid";
import { VideoPlayerDialog } from "./testimonials/VideoPlayerDialog";
import type { TestimonialFilter as FilterValue, VideoTestimonial } from "./testimonials/types";

// Animated Stat Component
function AnimatedStat({
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#D4A574]/20 to-primary/20 mb-3">
        <Icon className="h-5 w-5 text-[#D4A574]" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{displayValue}</span>
        {suffix && (
          <span className="text-xl font-semibold text-[#D4A574]">{suffix}</span>
        )}
      </div>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);

  const counts = {
    all: testimonials.length,
    video: testimonials.filter((t) => t.type === "video").length,
    text: testimonials.filter((t) => t.type === "text").length,
  };

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0205] via-[#1a0509] to-[#0d0205]" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow Orbs */}
        <motion.div
          animate={floatAnimation}
          className="absolute top-1/4 left-1/4"
        >
          <div className="w-80 h-80 bg-[#D4A574]/5 rounded-full blur-[100px]" />
        </motion.div>
        <motion.div
          animate={{
            ...floatAnimation,
            transition: { ...floatAnimation.transition, delay: 2 },
          }}
          className="absolute bottom-1/4 right-1/4"
        >
          <div className="w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        </motion.div>

        {/* Decorative Quote Marks */}
        <div className="absolute top-20 left-10 text-[#D4A574]/5 text-[200px] font-serif leading-none select-none">
          &ldquo;
        </div>
        <div className="absolute bottom-20 right-10 text-[#D4A574]/5 text-[200px] font-serif leading-none select-none rotate-180">
          &ldquo;
        </div>
      </div>

      <div className="relative">
        {/* Header + Filter + Stats: centered, constrained */}
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-[#5a0f1a] border border-[#D4A574]/20 mb-6"
            >
              <Heart className="h-4 w-4 text-[#D4A574]" />
              <span className="text-sm font-semibold text-white tracking-wide">
                Customer Love
              </span>
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight px-2 sm:px-0"
            >
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A574] to-[#e8c4a0]">
                Customers Say
              </span>
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-lg text-white/60">
              Join 2,000+ happy customers enjoying fresh, home-style meals every
              day.
            </motion.p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={fadeInUp}
            className="flex justify-center mb-10"
          >
            <TestimonialFilter
              value={activeFilter}
              onValueChange={setActiveFilter}
              counts={counts}
            />
          </motion.div>
        </div>

        {/* Mosaic Scrolling Rows - full bleed with edge fades */}
        <div className="relative">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#0d0205] to-transparent z-10 pointer-events-none" />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#0d0205] to-transparent z-10 pointer-events-none" />

          {/* Featured card - centered */}
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
            <TestimonialGrid
              testimonials={testimonials}
              activeFilter={activeFilter}
              onPlayVideo={setSelectedVideo}
            />
          </div>
        </div>

        {/* Video Player Dialog */}
        <VideoPlayerDialog
          testimonial={selectedVideo}
          open={!!selectedVideo}
          onOpenChange={(open) => {
            if (!open) setSelectedVideo(null);
          }}
        />

        {/* Premium Trust Stats */}
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-white/10"
          >
            <AnimatedStat
              value={4.9}
              suffix="★"
              label="Average Rating"
              icon={Star}
            />
            <AnimatedStat
              value={2000}
              suffix="+"
              label="Happy Customers"
              icon={Users}
            />
            <AnimatedStat
              value={50000}
              suffix="+"
              label="Meals Delivered"
              icon={ChefHat}
            />
            <AnimatedStat
              value={98}
              suffix="%"
              label="Would Recommend"
              icon={Heart}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
