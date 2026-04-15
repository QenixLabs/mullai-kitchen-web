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
];

export function TrustedCompaniesSection() {
  const loopedLogos = [...companyLogos, ...companyLogos];

  return (
    <section className="bg-[#F2EEE7] border-b border-primary/10">
      <div className="mx-auto max-w-350 px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5">
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-primary/75">
            Trusted by Companies
          </p>
          <div className="relative flex-1 overflow-hidden">
            <motion.div
              className="flex items-center gap-6 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 22, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            >
              {loopedLogos.map((logo, index) => (
                <div
                  key={`${logo.alt}-${index}`}
                  className="flex h-9 w-28 sm:h-10 sm:w-32 items-center justify-center rounded-md border border-primary/10 bg-white/80"
                >
                  <Image
                    src={logo.src}
                    alt={`${logo.alt} logo`}
                    width={96}
                    height={24}
                    className="h-4 sm:h-5 w-auto object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
