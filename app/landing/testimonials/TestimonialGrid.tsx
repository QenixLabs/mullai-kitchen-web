"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, staggerContainer } from "../animations";
import { TextTestimonialCard } from "./TextTestimonialCard";
import { VideoTestimonialCard } from "./VideoTestimonialCard";
import type { Testimonial, TestimonialFilter, VideoTestimonial } from "./types";

interface TestimonialGridProps {
  testimonials: Testimonial[];
  activeFilter: TestimonialFilter;
  onPlayVideo: (testimonial: VideoTestimonial) => void;
}

/* ------------------------------------------------------------------ */
/*  Main Grid Layout - Balanced with smaller featured video           */
/* ------------------------------------------------------------------ */
export function TestimonialGrid({
  testimonials,
  activeFilter,
  onPlayVideo,
}: TestimonialGridProps) {
  const filtered =
    activeFilter === "all"
      ? testimonials
      : testimonials.filter((t) => t.type === activeFilter);

  const featured = filtered.find((t) => t.featured);
  const regular = filtered.filter((t) => !t.featured);

  const renderCard = useCallback(
    (testimonial: Testimonial, isCompact: boolean = false) => {
      if (testimonial.type === "text") {
        return <TextTestimonialCard testimonial={testimonial} isCompact={isCompact} />;
      }
      return (
        <VideoTestimonialCard
          testimonial={testimonial}
          onPlay={onPlayVideo}
          isCompact={isCompact}
        />
      );
    },
    [onPlayVideo]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeFilter}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="initial"
        className="space-y-8"
      >
        {/* Featured Section - Smaller, balanced layout */}
        {featured && (
          <motion.div
            variants={fadeInUp}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Main Featured Video - Compact */}
            <div className="lg:col-span-1">
              {featured.type === "video" ? (
                <VideoTestimonialCard
                  testimonial={featured}
                  onPlay={onPlayVideo}
                  isCompact={false}
                  isFeatured={true}
                />
              ) : (
                <TextTestimonialCard testimonial={featured} isCompact={false} />
              )}
            </div>

            {/* Side Content - Stats or additional info */}
            <div className="lg:col-span-1 hidden lg:flex flex-col justify-center space-y-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  Trusted by Thousands
                </h3>
                <p className="text-white/60 text-sm">
                  Our customers love the authentic taste and reliable service.
                  Join the community of happy diners.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-skin">4.9</p>
                  <p className="text-xs text-white/50">Average Rating</p>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 text-center">
                  <p className="text-2xl font-bold text-skin">2K+</p>
                  <p className="text-xs text-white/50">Reviews</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Testimonials - Uniform Grid */}
        {regular.length > 0 && (
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {regular.map((testimonial) => (
                <div key={testimonial.id} className="h-full">
                  {renderCard(testimonial, true)}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
