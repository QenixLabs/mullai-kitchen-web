"use client";

import { motion } from "motion/react";

export function HomeIntroSection() {
  return (
    <section className="bg-[#FAF7F2] pb-12 sm:pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight tracking-tight"
        >
          Fresh, Home-Style Meals. Delivered Every Day.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          Subscription meal plans for individuals and companies across Chennai. No preservatives. No compromises. Just honest food.
        </motion.p>
      </div>
    </section>
  );
}
