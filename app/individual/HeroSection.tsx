"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, slideInRight, staggerContainer } from "../landing/animations";
import { BadgeCheck } from "lucide-react";

export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-[#FAF7F2] pt-10 pb-16 sm:pb-20 overflow-hidden">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.span
              variants={fadeInUp}
              className="block text-xs font-semibold tracking-[0.14em] text-primary uppercase"
            >
              Mullai Individuals
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="text-[clamp(1.9rem,4.8vw,3.8rem)]! font-black text-primary leading-[1.05]"
            >
              Your Daily Meal,
              <br />
              <span className="text-[#6B1720]">Sorted.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="individual-hero-copy text-lg leading-relaxed text-balance"
            >
              Fresh, home-cooked food delivered to you every day on a plan that fits your schedule and budget.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-row flex-wrap items-center gap-3"
            >
              <Link href="/plans">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 sm:px-8 h-11 sm:h-12">
                  Start Your Subscription
                </Button>
              </Link>

              <Link href="/plans">
                <Button
                  variant="outline"
                  className="bg-secondary hover:bg-secondary/90 border-border text-foreground font-semibold rounded-full px-6 sm:px-8 h-11 sm:h-12"
                >
                  View Today&apos;s Menu
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            className="relative"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-y-4 -inset-x-8 rounded-[2.5rem] bg-[linear-gradient(90deg,rgba(6,95,108,0.35),rgba(6,95,108,0.08),rgba(6,95,108,0))] blur-2xl"
            />
            <div
              className="relative rounded-[2rem] overflow-hidden bg-[#1a3a3a] aspect-square max-w-md mx-auto lg:max-w-none shadow-2xl"
            >
              <Image
                src="/images/individual/Gourmet Meal (1).png"
                alt="Premium grilled meal plate"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Floating Card */}
            <motion.div
              variants={fadeInUp}
              className="absolute -bottom-4 left-4 right-4 sm:left-6 sm:right-6 lg:left-6 lg:right-auto lg:bottom-6 lg:w-80 bg-white rounded-2xl shadow-xl p-4 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-primary">Concierge Quality</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Chef-curated meals prepared fresh every morning in our Mullai kitchens.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
