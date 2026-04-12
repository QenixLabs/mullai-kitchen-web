"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { Clock, ChefHat, UtensilsCrossed, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer } from "./animations";

const programs = [
  {
    image: "/images/home/Container.png",
    tag: "PERSONAL WELLNESS",
    title: "Individual Meal Program",
    description:
      "Tailored nutrition designed for your lifestyle. From high-protein fitness goals to mindful vegetarian diets, our chefs curate every bite for your personal excellence.",
    features: [
      { icon: Clock, label: "30 min delivery" },
      { icon: UtensilsCrossed, label: "Fresh daily" },
    ],
  },
  {
    image: "/images/home/table.png",
    tag: "CORPORATE SERVICE",
    title: "Corporate Meal Program",
    description:
      "Scalable breakfast, lunch, and dinner solutions for offices, institutions, and large teams.",
    features: [
      { icon: Building2, label: "Scheduled dispatch" },
      { icon: ChefHat, label: "Multi-kitchen operations" },
    ],
  },
];

export function HeroSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-[#FAF7F2] pt-10 pb-16 sm:pb-20 overflow-hidden">
      <div className="relative mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="text-center max-w-4xl mx-auto mb-12 sm:mb-16"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight leading-tight font-(family-name:--font-manrope)"
          >
            <span className="text-[#6B1720]">Fresh, Home-Style Meals.</span>
            <br />
            Delivered Every Day.
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-5 text-lg text-muted-foreground leading-relaxed text-balance"
          >
            Subscription meal plans for individuals and companies across Chennai. No preservatives. No compromises. Just honest food.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          animate={isInView ? "animate" : "initial"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {programs.map((program) => (
            <motion.div
              key={program.title}
              variants={fadeInUp}
              className="group bg-white rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={program.image}
                  alt={program.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="inline-block px-3 py-1.5 text-[10px] sm:text-xs font-semibold tracking-wider text-white bg-white/20 backdrop-blur-sm rounded-full border border-white/20">
                    {program.tag}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-primary">
                  {program.title}
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {program.description}
                </p>

                <div className="mt-6 flex flex-row flex-wrap items-center gap-3">
                  <Link href="/auth/signin">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-8 h-11">
                      Login
                    </Button>
                  </Link>
                  <Link href="/plans">
                    <Button
                      variant="outline"
                      className="border-border hover:bg-muted font-semibold rounded-full px-8 h-11"
                    >
                      View Plans
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {program.features.map((feature) => (
                    <div
                      key={feature.label}
                      className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap"
                    >
                      <feature.icon className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
