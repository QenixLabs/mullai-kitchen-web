"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { Star, Play, BadgeCheck } from "lucide-react";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { cn } from "@/lib/utils";

const filters = ["All", "Video", "Text"];

const testimonials = {
  featured: {
    name: "Karthik Subramanian",
    role: "Software Engineer, OMR",
    quote: "The variety of dishes is incredible... Every meal feels like it's freshly prepared at home. Truly authentic flavors.",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80",
  },
  side: [
    {
      name: "Priya Sharma",
      role: "HR Manager",
      badge: "PROFESSIONAL",
      quote: "Working long shifts in Anna Nagar, I never had time for healthy eating. Mullai Elite changed that. Consistent quality every single day.",
    },
    {
      name: "Meera Krishnan",
      role: "Student, Chromepet",
      badge: "STUDENT",
      quote: "As a student away from home, the snacks and meal plans are a lifesaver. The packaging is eco-friendly and keeps food hot.",
    },
  ],
};

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-[#FAF7F2]">
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.span
            variants={fadeInUp}
            className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary tracking-wide uppercase"
          >
            Customer Love
          </motion.span>

          <motion.h2
            variants={fadeInUp}
            className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight"
          >
            What Our Customers Say
          </motion.h2>

          <motion.p variants={fadeInUp} className="individual-copy-slate mt-3">
            Join 2,000+ happy customers enjoying fresh, home-style meals every day.
          </motion.p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          className="flex justify-center gap-2 mb-10"
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium transition-all",
                activeFilter === f
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground border border-border/50 hover:bg-muted",
              )}
            >
              {f}
            </button>
          ))}
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-5"
        >
          {/* Featured Video Card */}
          <motion.div
            variants={fadeInUp}
            className="relative rounded-3xl overflow-hidden bg-primary text-white"
          >
            <div className="relative h-72 lg:h-full min-h-[22rem]">
              <Image
                src={testimonials.featured.image}
                alt="Customer testimonial"
                fill
                className="object-cover opacity-60"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
                <span className="ml-2 text-sm font-semibold text-white">{testimonials.featured.rating}</span>
              </div>
              <p className="text-lg font-medium leading-relaxed mb-4">
                &ldquo;{testimonials.featured.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-skin/20 flex items-center justify-center text-skin font-bold text-sm">
                  KS
                </div>
                <div>
                  <div className="flex items-center gap-1 font-semibold">
                    {testimonials.featured.name}
                    <BadgeCheck className="h-4 w-4 text-skin" />
                  </div>
                  <p className="text-xs text-white/70">{testimonials.featured.role}</p>
                </div>
              </div>
            </div>

            <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20">
              <Play className="h-6 w-6 text-white fill-white" />
            </button>
          </motion.div>

          {/* Side Testimonials */}
          <div className="flex flex-col gap-5">
            {testimonials.side.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeInUp}
                className="bg-white rounded-2xl border border-border/50 p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {t.badge}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                      {t.name}
                      <BadgeCheck className="h-3.5 w-3.5 text-skin" />
                    </div>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
