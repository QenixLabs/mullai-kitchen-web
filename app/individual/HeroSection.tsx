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
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
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
              className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-primary uppercase"
            >
              Mullai Individuals
            </motion.span>

            <motion.h1
              variants={fadeInUp}
              className="font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[76px] text-primary leading-tight"
            >
              Your Daily Meal,
              <br />
              Sorted.
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Fresh, home-cooked food delivered to you every day on a plan that fits your schedule and budget.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-row flex-wrap items-center gap-3"
            >
              <Link href="/plans">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto">
                  Start Your Subscription
                </Button>
              </Link>

              <Link href="/plans">
                <Button
                  variant="outline"
                  className="bg-secondary hover:bg-secondary/90 border-border text-foreground font-semibold rounded-full px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto"
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
            <div className="relative rounded-3xl overflow-hidden bg-[#1a3a3a] aspect-square max-w-md mx-auto lg:max-w-none">
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
              className="absolute -bottom-4 left-4 right-4 sm:left-8 sm:right-auto sm:bottom-8 sm:w-72 bg-white rounded-2xl shadow-xl p-4 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
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
