"use client";

import Image from "next/image";
import { motion } from "motion/react";

const companyLogos = [
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
];

export function TrustedCompaniesSection() {
  const loopedLogos = [...companyLogos, ...companyLogos];

  return (
    <section className="bg-[#F2EEE7] border-b border-primary/10">
      <div className="relative overflow-hidden py-3">
        <motion.div
          className="flex items-center gap-12 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
        >
          {loopedLogos.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="flex h-10 w-auto items-center justify-center opacity-80"
            >
              <Image
                src={logo.src}
                alt={`${logo.alt} logo`}
                width={120}
                height={32}
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
