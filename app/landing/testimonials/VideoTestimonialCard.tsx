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
  isCompact?: boolean;
  isFeatured?: boolean;
  onPlay: (testimonial: VideoTestimonial) => void;
}

export function VideoTestimonialCard({
  testimonial,
  isCompact = false,
  isFeatured = false,
  onPlay,
}: VideoTestimonialCardProps) {
  return (
    <motion.div
      whileHover={hoverScale as unknown as TargetAndTransition}
      className={cn(
        "relative group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300",
        "hover:border-skin/30 hover:shadow-[0_0_30px_rgba(212,165,116,0.1)]",
        "h-full flex flex-col"
      )}
    >
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-skin to-primary" />

      {/* Video Thumbnail - Smaller for compact cards */}
      <div
        className={cn(
          "relative overflow-hidden cursor-pointer flex-shrink-0",
          isCompact ? "aspect-video h-36" : isFeatured ? "aspect-video h-48" : "aspect-video h-40"
        )}
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

        {/* Play Button - Responsive sizing */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={tapScale}
          className="absolute inset-0 flex items-center justify-center"
          onClick={() => onPlay(testimonial)}
          aria-label={`Play testimonial video by ${testimonial.name}`}
        >
          <div className={cn(
            "flex items-center justify-center rounded-full bg-skin/90 shadow-lg shadow-skin/20 group-hover:bg-skin transition-colors",
            isCompact ? "h-10 w-10" : "h-12 w-12"
          )}>
            <Play className={cn(
              "text-white fill-white ml-0.5",
              isCompact ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
        </motion.button>

        {/* Video Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Video className="h-3 w-3 text-skin" />
          <span className="text-[10px] font-medium text-white">Video</span>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
          <span className="text-[10px] font-medium text-white">
            {testimonial.video.duration}
          </span>
        </div>
      </div>

      {/* Content - Consistent padding for uniform cards */}
      <div className={cn(
        "flex flex-col flex-grow",
        isCompact ? "p-4" : "p-5"
      )}>
        {/* Testimonial Text - Fixed height for consistency */}
        <p className={cn(
          "text-white/90 leading-relaxed line-clamp-3 flex-grow",
          isCompact ? "text-xs" : "text-sm"
        )}>
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* Author Info Strip - Fixed at bottom */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-skin/30 flex-shrink-0">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-white truncate text-xs">
                  {testimonial.name}
                </span>
                {testimonial.verified && (
                  <BadgeCheck className="h-3 w-3 text-skin flex-shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-white/50 truncate">
                {testimonial.role} &bull; {testimonial.location}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-2.5 w-2.5 fill-skin text-skin"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
