"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

export function PromoBanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      className="relative bg-primary overflow-hidden border-b border-white/10"
    >
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5">
        <div className="flex items-center justify-center text-center text-xs sm:text-sm font-medium text-white/95">
          <span>First Meal FREE on your first subscription! Use code:</span>
          <span className="ml-1 font-semibold text-skin">MULLAI50</span>
        </div>
      </div>
    </motion.div>
  );
}
