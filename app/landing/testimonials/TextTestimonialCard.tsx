"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { hoverPremiumLift } from "../animations";
import { cn } from "@/lib/utils";
import type { TargetAndTransition } from "motion/react";
import type { TextTestimonial } from "./types";

interface TextTestimonialCardProps {
  testimonial: TextTestimonial;
  isCompact?: boolean;
}

export function TextTestimonialCard({
  testimonial,
  isCompact = false,
}: TextTestimonialCardProps) {
  return (
    <motion.div
      whileHover={hoverPremiumLift as unknown as TargetAndTransition}
      className={cn(
        "relative group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300",
        "hover:border-skin/30 hover:shadow-[0_0_30px_rgba(212,165,116,0.1)]",
        "h-full flex flex-col"
      )}
    >
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-skin to-primary" />

      <div className={cn(
        "flex flex-col flex-grow",
        isCompact ? "p-4" : "p-5"
      )}>
        {/* Quote Icon - Smaller for compact */}
        <Quote
          className={cn(
            "text-skin mb-3 flex-shrink-0",
            isCompact ? "h-6 w-6" : "h-8 w-8"
          )}
        />

        {/* Testimonial Text - Fixed height with line clamp for consistency */}
        <p
          className={cn(
            "text-white/90 leading-relaxed flex-grow line-clamp-4",
            isCompact ? "text-xs" : "text-sm"
          )}
        >
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* Footer - Fixed at bottom */}
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
                <h4 className="font-bold text-white truncate text-xs">
                  {testimonial.name}
                </h4>
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
          <div className="flex items-center gap-0.5 bg-gradient-to-r from-primary to-[#5a0f1a] px-2 py-0.5 rounded-full flex-shrink-0">
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
