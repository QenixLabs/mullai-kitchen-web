"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import {
  Building2,
  Users,
  Utensils,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "./animations";

const features = [
  {
    icon: Building2,
    title: "Corporate Catering",
    description:
      "Tailored meal plans for your office teams, from daily lunches to special events.",
  },
  {
    icon: Users,
    title: "Bulk Orders",
    description:
      "Perfect for family gatherings, celebrations, and community events.",
  },
  {
    icon: Utensils,
    title: "Custom Menus",
    description:
      "Work with our chefs to create the perfect menu for your specific needs.",
  },
];

export function BulkOrdersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-[#1a0509] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-full bg-linear-to-b from-primary/40 to-transparent" />
        <div className="absolute top-1/2 -right-1/4 w-[500px] h-[500px] bg-skin/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={staggerContainer}
            className="w-full space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                variants={fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <Building2 className="h-4 w-4 text-skin" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                  Corporate & Events
                </span>
              </motion.div>

              <motion.h2
                variants={fadeInUp}
                className="text-4xl sm:text-5xl font-bold text-white leading-[1.15]"
              >
                Large Scale Catering for <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-skin via-skin-light to-skin">
                  Special Occasions
                </span>
              </motion.h2>
            </div>

            <motion.p
              variants={fadeInUp}
              className="text-xl text-white/60 leading-relaxed "
            >
              Whether it&apos;s a daily corporate lunch arrangement or a
              one-time grand celebration, Mullai provides authentic,
              high-quality South Indian catering services tailored to your
              scale.
            </motion.p>

            <div className="grid gap-4 mt-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
                >
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-[#5a0f1a] flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-skin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-white/40 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4 pt-6"
            >
              <Button
                onClick={() =>
                  (window.location.href =
                    "mailto:founder@mullai.net?subject=Corporate/Bulk Order Inquiry")
                }
                className="h-14 px-10 bg-skin hover:bg-[#C39463] text-[#1a0509] font-bold rounded-xl shadow-lg shadow-skin/20 group"
              >
                <Mail className="w-5 h-5 mr-2" />
                Contact for Quote
                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "tel:+918428129262")}
                className="h-14 px-10 border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold rounded-xl"
              >
                <Phone className="w-5 h-5 mr-2 text-skin" />
                Call +91 84281 29262
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual Representation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80"
                alt="Bulk Corporate Catering"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#1a0509]/80 via-transparent to-transparent" />

              {/* Overlay Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-full border-2 border-[#1a0509] bg-gray-200 overflow-hidden relative"
                      >
                        <Image
                          src={`https://i.pravatar.cc/100?img=${i + 10}`}
                          alt="Client"
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-[#1a0509] bg-skin flex items-center justify-center text-xs font-bold text-[#1a0509]">
                      50+
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
                      Trusted by
                    </p>
                    <p className="text-lg font-bold text-white">
                      10+ Corporates
                    </p>
                  </div>
                </div>
                <div className="h-px bg-white/5 mb-6" />
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-skin mt-2 shrink-0 animate-pulse" />
                  <p className="text text-white/70 italic leading-relaxed">
                    {"\""}Exceptional service for our annual event! The food was
                    fresh and stayed hot throughout.{"\""}
                  </p>
                </div>
              </div>
            </div>

            {/* Float Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white hidden sm:block"
            >
              <div className="flex flex-col items-center">
                <Calendar className="w-10 h-10 mb-2 text-primary" />
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                  Book for
                </p>
                <p className="text-2xl font-black text-primary">2026</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
