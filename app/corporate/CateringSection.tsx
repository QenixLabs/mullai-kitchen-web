"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { fadeInUp, slideInRight, staggerContainer } from "../landing/animations";
import { CalendarDays, Users, UtensilsCrossed, Phone, ClipboardList } from "lucide-react";

const services = [
  {
    icon: CalendarDays,
    title: "Corporate Catering",
    description: "Tailored meal plans for your office teams, from daily lunches to large town hall events.",
  },
  {
    icon: Users,
    title: "Bulk Orders",
    description: "Perfect for family gatherings, community celebrations, and festive home occasions.",
  },
  {
    icon: UtensilsCrossed,
    title: "Custom Menus",
    description: "Work with our chefs to create the perfect menu for your specific needs.",
  },
];

export function CateringSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-[#FAF7F2] py-16 sm:py-20 overflow-hidden">
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
              Corporate & Events
            </motion.span>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-[1.1]"
            >
              Large Scale Catering for Special Occasions
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed">
              Whether it&apos;s a daily corporate lunch arrangement or a one-time grand celebration, Mullai provides authentic, high-quality South Indian catering services tailored to your scale.
            </motion.p>

            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={fadeInUp}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border/50"
                >
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-primary">{service.title}</h4>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="flex flex-row flex-wrap items-center gap-3">
              <Link href="/auth/corporate-signup">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-6 h-11">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Contact for Quote
                </Button>
              </Link>
              <Link href="tel:+918428129262">
                <Button variant="outline" className="border-border hover:bg-muted font-semibold rounded-full px-6 h-11">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="initial"
            animate={isInView ? "animate" : "initial"}
            variants={slideInRight}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-4/3 lg:aspect-3/4">
              <Image
                src="/images/corporate/Catering Buffet.png"
                alt="Large scale catering buffet"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <motion.div
              variants={fadeInUp}
              className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-3 border border-border/50"
            >
              <div className="text-center">
                <CalendarDays className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Bookings for</p>
                <p className="text-sm font-bold text-primary">2026</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-border/50"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex -space-x-2">
                  {["KS", "PS", "MK", "+"].map((initial, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary"
                    >
                      {initial}
                    </div>
                  ))}
                </div>
                <p className="text-xs font-semibold text-primary">Trusted by 20+ Corporates</p>
              </div>
              <p className="text-xs text-muted-foreground italic">
                &ldquo;Exceptional service for our annual event! The food was fresh, authentic, and stayed hot throughout the entire lunch service.&rdquo;
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
