"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { StepCarousel } from "../components/StepCarousel";

const businessSteps = [
  {
    image: "/images/partner/p1.jpeg",
    step: 1,
    title: "End-to-End Management",
    description: "Procurement, cooking, serving, cleanup — all handled.",
  },
  {
    image: "/images/partner/p2.jpeg",
    step: 2,
    title: "Custom Menus",
    description: "Designed around your workforce's preferences, diets, and budget.",
  },
  {
    image: "/images/partner/p3.jpeg",
    step: 3,
    title: "Scalable",
    description: "50-person office or 2,000-worker factory — same quality.",
  },
  {
    image: "/images/partner/p4.jpeg",
    step: 4,
    title: "Transparent",
    description: "Regular reports, audits, and open communication.",
  },
];

export function BusinessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="who-mullai-is" ref={ref} className="relative bg-[#FAF7F2] py-16 sm:py-20 overflow-hidden scroll-mt-32">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="mb-10 sm:mb-14"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-primary uppercase"
          >
            Why Choose Mullai for Your Company
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-bold text-primary tracking-tight leading-[1.1]"
          >
            A <span className="brand-wine-text">Meal Partner</span> Built for Business
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <StepCarousel items={businessSteps} variant="light" />
        </motion.div>
      </div>
    </section>
  );
}
