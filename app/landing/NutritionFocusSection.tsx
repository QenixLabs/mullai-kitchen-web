"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Apple, BadgeCheck, Leaf, Scale } from "lucide-react";

const nutritionPoints = [
  {
    icon: BadgeCheck,
    title: "Dietician Planned Meals",
    description: "Meal combinations are reviewed to support sustained energy for working teams.",
  },
  {
    icon: Scale,
    title: "Balanced Nutrition",
    description: "Balanced split of proteins, complex carbs, and fiber-led sides in every menu cycle.",
  },
  {
    icon: Apple,
    title: "Calorie Conscious Portions",
    description: "Portions are standardized for consistency without compromising satiety and taste.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "High-turnover produce and whole spices maintain flavor and nutrient quality.",
  },
];

export function NutritionFocusSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-[#120407] overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-[#120407] via-[#1a060a] to-[#120407]" />
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="relative grid lg:grid-cols-[1.05fr_1fr] gap-8 sm:gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl min-h-75 sm:min-h-105"
          >
            <Image
              src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80"
              alt="Nutrition focused meal preparation"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/25 bg-black/35 p-4 backdrop-blur-sm">
              <p className="text-sm sm:text-base text-white font-medium">
                Nutrition planning aligned to workplace routines and team wellbeing.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full border border-skin/30 bg-skin/10 px-4 py-2 text-xs sm:text-sm font-semibold tracking-wide text-skin">
              Nutrition Focus
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Meals Built For Health, Not Just Fullness
            </h2>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {nutritionPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-skin/20">
                    <point.icon className="h-5 w-5 text-skin" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{point.title}</h3>
                  <p className="mt-1.5 text-sm text-white/70 leading-relaxed">
                    {point.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
