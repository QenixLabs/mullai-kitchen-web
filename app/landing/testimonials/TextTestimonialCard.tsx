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
  size?: "default" | "large";
}

export function TextTestimonialCard({
  testimonial,
  size = "default",
}: TextTestimonialCardProps) {
  const isLarge = size === "large";

  return (
    <motion.div
      whileHover={hoverPremiumLift as unknown as TargetAndTransition}
      className={cn(
        "relative group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300",
        "hover:border-[#D4A574]/30 hover:shadow-[0_0_30px_rgba(212,165,116,0.1)]",
        isLarge && "hover:shadow-[0_0_40px_rgba(212,165,116,0.15)]"
      )}
    >
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-[#D4A574] to-primary" />

      <div
        className={cn(
          "flex flex-col",
          isLarge ? "p-6 sm:p-8" : "p-5 sm:p-6"
        )}
      >
        {/* Quote Icon */}
        <Quote
          className={cn(
            "text-[#D4A574] mb-4",
            isLarge ? "h-10 w-10" : "h-8 w-8"
          )}
        />

        {/* Testimonial Text */}
        <p
          className={cn(
            "text-white/90 leading-relaxed flex-grow",
            isLarge
              ? "text-lg sm:text-xl font-medium"
              : "text-sm sm:text-base font-medium"
          )}
        >
          &ldquo;{testimonial.content}&rdquo;
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#D4A574]/30 flex-shrink-0">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4
                  className={cn(
                    "font-bold text-white truncate",
                    isLarge ? "text-base" : "text-sm"
                  )}
                >
                  {testimonial.name}
                </h4>
                {testimonial.verified && (
                  <BadgeCheck className="h-4 w-4 text-[#D4A574] flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-white/50 truncate">
                {testimonial.role} &bull; {testimonial.location}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-0.5 bg-gradient-to-r from-primary to-[#5a0f1a] px-2.5 py-1 rounded-full flex-shrink-0">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-[#D4A574] text-[#D4A574]"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
