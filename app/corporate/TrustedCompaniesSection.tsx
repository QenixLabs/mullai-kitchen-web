"use client";

import Image from "next/image";

const companyLogos = [
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft" },
  { src: "/images/brands/google-logo.svg", alt: "Google" },
];

export function TrustedCompaniesSection() {
  return (
    <section className="bg-[#F2EEE7] border-b border-primary/10">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-center gap-6 sm:gap-8 py-2">
          {companyLogos.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <Image
                src={logo.src}
                alt={`${logo.alt} logo`}
                width={100}
                height={24}
                className="h-4 sm:h-5 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
