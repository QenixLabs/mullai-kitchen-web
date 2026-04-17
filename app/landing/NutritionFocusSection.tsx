"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function NutritionFocusSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-[#FAF7F2] overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold tracking-wide text-primary uppercase">
              Who is Mullai
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-primary tracking-tight leading-[1.15]">
              Meals You Can Count On, <span className="brand-wine-text">Every Single Day.</span>
            </h2>
            <p className="individual-copy-mauve mt-5 leading-relaxed text-base sm:text-lg">
              Mullai is a Chennai-based meal subscription service. We cook fresh food every morning and deliver it to your doorstep or your office on time, every time. Whether you&apos;re one person looking for a reliable daily lunch or a company feeding hundreds of employees, we&apos;ve built our operations to handle both without cutting corners.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/home/Professional Kitchen Team (1).png"
                alt="Mullai Professional Kitchen Team"
                width={600}
                height={450}
                className="object-cover w-full h-auto"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
