"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star, BadgeCheck, Play, Video } from "lucide-react";
import { hoverScale, tapScale } from "../animations";
import { cn } from "@/lib/utils";
import type { TargetAndTransition } from "motion/react";
import type { VideoTestimonial } from "./types";

interface VideoTestimonialCardProps {
  testimonial: VideoTestimonial;
  size?: "default" | "large";
  onPlay: (testimonial: VideoTestimonial) => void;
}

export function VideoTestimonialCard({
  testimonial,
  size = "default",
  onPlay,
}: VideoTestimonialCardProps) {
  const isLarge = size === "large";

  return (
    <motion.div
      whileHover={hoverScale as TargetAndTransition}
      className={cn(
        "relative group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300",
        "hover:border-[#D4A574]/30 hover:shadow-[0_0_30px_rgba(212,165,116,0.1)]"
      )}
    >
      {/* Video Thumbnail */}
      <div
        className="relative aspect-video overflow-hidden cursor-pointer"
        onClick={() => onPlay(testimonial)}
      >
        <Image
          src={testimonial.video.thumbnail}
          alt={`Video testimonial by ${testimonial.name}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={tapScale}
          className="absolute inset-0 flex items-center justify-center"
          onClick={() => onPlay(testimonial)}
          aria-label={`Play testimonial video by ${testimonial.name}`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D4A574]/90 shadow-lg shadow-[#D4A574]/20 group-hover:bg-[#D4A574] transition-colors">
            <Play className="h-6 w-6 text-white fill-white ml-1" />
          </div>
        </motion.button>

        {/* Video Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <Video className="h-3 w-3 text-[#D4A574]" />
          <span className="text-xs font-medium text-white">Video</span>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
          <span className="text-xs font-medium text-white">
            {testimonial.video.duration}
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex flex-col",
          isLarge ? "p-6 sm:p-8" : "p-5"
        )}
      >
        {/* Truncated Quote */}
        <p
          className={cn(
            "text-white/90 leading-relaxed line-clamp-2",
            isLarge ? "text-base sm:text-lg" : "text-sm"
          )}
        >
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* Author Info Strip */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#D4A574]/30 flex-shrink-0">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "font-bold text-white truncate",
                    isLarge ? "text-sm" : "text-xs"
                  )}
                >
                  {testimonial.name}
                </span>
                {testimonial.verified && (
                  <BadgeCheck className="h-3.5 w-3.5 text-[#D4A574] flex-shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-white/50 truncate">
                {testimonial.role} &bull; {testimonial.location}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 fill-[#D4A574] text-[#D4A574]"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
