"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { fadeInUp, staggerContainer } from "../landing/animations";
import { CheckCircle2, UtensilsCrossed, Sliders, Users, Eye } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "End-to-End Management",
    description: "Procurement, cooking, serving, cleanup — all handled.",
  },
  {
    icon: UtensilsCrossed,
    title: "Custom Menus",
    description: "Designed around your workforce's preferences, diets, and budget.",
  },
  {
    icon: Users,
    title: "Scalable",
    description: "50-person office or 2,000-worker factory — same quality.",
  },
  {
    icon: Eye,
    title: "Transparent",
    description: "Regular reports, audits, and open communication.",
  },
];

export function BusinessSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="who-mullai-is" ref={ref} className="relative bg-[#FAF7F2] py-16 sm:py-20 overflow-hidden scroll-mt-32">
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden aspect-4/3 lg:aspect-auto lg:h-112"
          >
            <Image
              src="/images/corporate/Catering Buffet.png"
              alt="Gourmet corporate meal"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </motion.div>

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
              Why Choose Mullai for Your Company
            </motion.span>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-[1.1]"
            >
              A Meal Partner Built for Business
            </motion.h2>

            <motion.p variants={fadeInUp} className="text-muted-foreground leading-relaxed">
              Managing food for a workforce is expensive and distracting. Mullai removes that burden. Whether you need 50 meals or 5,000, we scale to your needs with zero compromise on quality.
            </motion.p>

            <div className="space-y-4">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeInUp}
                  className="flex items-start gap-4"
                >
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-primary">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
