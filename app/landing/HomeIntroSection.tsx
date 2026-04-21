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
          className="mt-4 text-[clamp(1.9rem,4.6vw,4.8rem)]! font-bold text-primary tracking-tight leading-[1.1]"
        >
          <span className="whitespace-nowrap">Fresh, Home-Style Meals.</span>
          <br />
          Delivered Every Day.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          Subscription meal plans for individuals and companies across Chennai. No preservatives. No compromises. Just honest food.
        </motion.p>
      </div>
    </section>
  );
}
