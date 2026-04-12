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
    src: "/images/corporate/Container (1).png",
    alt: "Elegant corporate dining setup",
  },
  {
    src: "/images/corporate/Catering Buffet.png",
    alt: "Corporate catering buffet",
  },
  {
    src: "/images/corporate/524E481C-D3A0-43C6-82DC-0DAD42403024.png",
    alt: "Gourmet plated dish",
  },
  {
    src: "/images/corporate/4CCBF73A-73F3-41C5-8297-5F4B788673B7_4_5005_c.jpeg",
    alt: "Corporate office",
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
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Image Carousel */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="relative w-screen left-1/2 -translate-x-1/2"
        >
          <div className="relative w-full aspect-16/10 sm:aspect-video lg:aspect-21/9 rounded-none overflow-hidden bg-muted shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
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
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
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

        {/* Headline + Subtext */}
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto mt-10 sm:mt-14"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-[60px] font-extrabold text-primary tracking-tight leading-tight font-(family-name:--font-manrope)"
          >
            Fresh, Home-Style Meals.
            <br />
            Delivered Every Day.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-5 text-lg text-muted-foreground leading-relaxed text-balance"
          >
            Subscription meal plans for individuals and companies across Chennai. No preservatives. No compromises. Just honest food.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-row flex-wrap items-center justify-center gap-3 mt-8"
          >
            <Link href="/auth/corporate-signup">
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
