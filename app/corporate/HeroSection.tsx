"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    src: "/images/corporate/h1.png",
    alt: "Fresh home-style meals",
  },
  {
    src: "/images/corporate/h2.jpeg",
    alt: "Daily meal delivery",
  },
];

export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, []);

  return (
    <section ref={ref} className="relative bg-[#FAF7F2] pt-0 pb-12 overflow-hidden">
      {/* Full-width Image Carousel — no side margins */}
      <motion.div
        initial="initial"
        animate={isInView ? "animate" : "initial"}
        variants={staggerContainer}
        className="relative w-full"
      >
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.4/1] overflow-hidden bg-muted">
          {/* Subtle dark overlay — matches reference site's 10% opacity */}
          <div className="absolute inset-0 bg-black/10 z-[1] pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0 z-[2]"
            >
              <Image
                src={slides[current].src}
                alt={slides[current].alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={current === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Arrow Buttons */}
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[3] h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[3] h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[3] flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === current
                    ? "w-6 bg-white"
                    : "w-2 bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Headline + Subtext — constrained container */}
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto mt-10 sm:mt-14"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-[clamp(2.15rem,5.6vw,4.7rem)]! font-extrabold text-primary tracking-tight leading-[1.02]"
          >
            <span className="whitespace-nowrap text-[#6B1720]">Fresh, Home-Style Meals.</span>
            <br />
            Delivered Every Day.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Subscription meal plans for individuals and companies across Chennai. No preservatives. No compromises. Just honest food.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-row flex-wrap items-center justify-center gap-3 mt-8"
          >
            <Link href="/enquiry">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base">
                Get a Quote
              </Button>
            </Link>

            <Link href="/plans">
              <Button
                variant="outline"
                className="bg-secondary hover:bg-secondary/90 border-border text-foreground font-semibold rounded-full px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base"
              >
                View Corporate Plans
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
