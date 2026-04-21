"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface StepItem {
  image: string;
  step: number;
  title: string;
  description: string;
}

interface StepCarouselProps {
  items: StepItem[];
  variant: "light" | "dark";
}

export function StepCarousel({ items, variant }: StepCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);

  const bgColor = variant === "light" ? "#FAF7F2" : "#39070F";
  const allItems = [...items, ...items];

  const scrollByCard = useCallback((direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    const cardWidth = container.scrollWidth / allItems.length;
    const scrollAmount = direction === "left" ? -cardWidth : cardWidth;

    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }, [allItems.length]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let lastTime = performance.now();
    const speed = 0.03; // pixels per ms

    const animate = (time: number) => {
      if (!isPaused && container) {
        const delta = time - lastTime;
        container.scrollLeft += speed * delta;

        const halfScroll = container.scrollWidth / 2;
        if (container.scrollLeft >= halfScroll) {
          container.scrollLeft = container.scrollLeft - halfScroll;
        }
      }
      lastTime = time;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation arrows - top right */}
      <div className="absolute -top-14 right-0 flex items-center gap-2 z-20">
        <button
          onClick={() => scrollByCard("left")}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
            variant === "dark"
              ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
              : "border-primary/20 bg-white hover:bg-primary/5 text-primary"
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scrollByCard("right")}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
            variant === "dark"
              ? "border-white/20 bg-white/10 hover:bg-white/20 text-white"
              : "border-primary/20 bg-white hover:bg-primary/5 text-primary"
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Edge fade gradients */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 sm:w-20"
        style={{
          background: `linear-gradient(to right, ${bgColor}, transparent)`,
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 sm:w-20"
        style={{
          background: `linear-gradient(to left, ${bgColor}, transparent)`,
        }}
      />

      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allItems.map((item, index) => (
          <motion.div
            key={`${item.step}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (index % items.length) * 0.1 }}
            className="relative shrink-0 snap-start overflow-hidden rounded-2xl sm:rounded-3xl"
            style={{
              width: "calc(25% - 15px)",
              minWidth: "260px",
              aspectRatio: "3/4",
            }}
          >
            {/* Background image */}
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 25vw"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
              {/* Step number */}
              <span className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-5xl sm:text-6xl font-bold text-white/15 leading-none select-none">
                {String(item.step).padStart(2, "0")}
              </span>

              <div className="relative z-10">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-white/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
