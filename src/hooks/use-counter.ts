"use client";

import { useState, useRef, useEffect } from "react";
import { useInView, animate } from "motion/react";

export function useCounter(target: number, duration: number = 2) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, target, {
        duration,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.round(latest))
      });
      return controls.stop;
    }
  }, [isInView, target, duration]);

  return { ref, displayValue };
}
