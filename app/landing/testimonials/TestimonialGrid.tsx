"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { fadeInUp, staggerContainer } from "../animations";
import { TextTestimonialCard } from "./TextTestimonialCard";
import { VideoTestimonialCard } from "./VideoTestimonialCard";
import type { Testimonial, TestimonialFilter, VideoTestimonial } from "./types";

interface TestimonialGridProps {
  testimonials: Testimonial[];
  activeFilter: TestimonialFilter;
  onPlayVideo: (testimonial: VideoTestimonial) => void;
}

/* ------------------------------------------------------------------ */
/*  Mosaic card widths - each card gets a different width for variety  */
/* ------------------------------------------------------------------ */
const CARD_WIDTHS = [320, 280, 340, 300, 360];

function getCardWidth(index: number) {
  return CARD_WIDTHS[index % CARD_WIDTHS.length];
}

/* ------------------------------------------------------------------ */
/*  Infinite auto-scrolling row                                       */
/* ------------------------------------------------------------------ */
function MosaicScrollRow({
  items,
  renderItem,
  speed = 30,
  reverse = false,
  className = "",
}: {
  items: Testimonial[];
  renderItem: (item: Testimonial) => React.ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items for seamless infinite loop
  const duplicated = useMemo(() => [...items, ...items, ...items], [items]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || isPaused) return;

    const direction = reverse ? -1 : 1;
    let rafId: number;
    let lastTime: number | null = null;

    const step = (timestamp: number) => {
      if (lastTime === null) lastTime = timestamp;
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      el.scrollLeft += direction * speed * delta;

      // When we've scrolled past one full set, snap back seamlessly
      const oneSetWidth = el.scrollWidth / 3;
      if (!reverse && el.scrollLeft >= oneSetWidth) {
        el.scrollLeft -= oneSetWidth;
      } else if (reverse && el.scrollLeft <= 0) {
        el.scrollLeft += oneSetWidth;
      }

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [speed, reverse, isPaused, items]);

  const handleMouseEnter = useCallback(() => setIsPaused(true), []);
  const handleMouseLeave = useCallback(() => setIsPaused(false), []);

  if (items.length === 0) return null;

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-hidden scrollbar-none"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {duplicated.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="flex-shrink-0"
            style={{ width: getCardWidth(i) }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Mosaic Grid                                                  */
/* ------------------------------------------------------------------ */
export function TestimonialGrid({
  testimonials,
  activeFilter,
  onPlayVideo,
}: TestimonialGridProps) {
  const filtered =
    activeFilter === "all"
      ? testimonials
      : testimonials.filter((t) => t.type === activeFilter);

  const featured = filtered.find((t) => t.featured);
  const regular = filtered.filter((t) => !t.featured);

  const renderCard = useCallback(
    (testimonial: Testimonial) => {
      if (testimonial.type === "text") {
        return <TextTestimonialCard testimonial={testimonial} />;
      }
      return (
        <VideoTestimonialCard
          testimonial={testimonial}
          onPlay={onPlayVideo}
        />
      );
    },
    [onPlayVideo]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeFilter}
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        exit="initial"
        className="space-y-6"
      >
        {/* Featured Testimonial - full width, static */}
        {featured && (
          <motion.div variants={fadeInUp}>
            {featured.type === "text" ? (
              <TextTestimonialCard testimonial={featured} size="large" />
            ) : (
              <VideoTestimonialCard
                testimonial={featured}
                size="large"
                onPlay={onPlayVideo}
              />
            )}
          </motion.div>
        )}

        {/* Row 1: First half of regular cards, scroll right */}
        {regular.length > 0 && (
          <motion.div variants={fadeInUp}>
            <MosaicScrollRow
              items={regular.slice(0, Math.ceil(regular.length / 2))}
              renderItem={renderCard}
              speed={35}
              reverse={false}
            />
          </motion.div>
        )}

        {/* Row 2: Second half, scroll left (counter-direction) */}
        {regular.length > 2 && (
          <motion.div variants={fadeInUp}>
            <MosaicScrollRow
              items={regular.slice(Math.ceil(regular.length / 2))}
              renderItem={renderCard}
              speed={28}
              reverse={true}
            />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
