"use client";

import Image from "next/image";

const logos = [
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft logo" },
  { src: "/images/brands/google-logo.svg", alt: "Google logo" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft logo" },
  { src: "/images/brands/google-logo.svg", alt: "Google logo" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft logo" },
  { src: "/images/brands/google-logo.svg", alt: "Google logo" },
  { src: "/images/brands/microsoft-logo.svg", alt: "Microsoft logo" },
  { src: "/images/brands/google-logo.svg", alt: "Google logo" },
];

export function TrustedClientsTopBar() {
  return (
    <div className="bg-card border-b border-border">
      <div className="mx-auto max-w-350 px-2 sm:px-6 lg:px-8 xl:px-12 py-2">
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {logos.map((logo, index) => (
            <div
              key={`${logo.alt}-${index}`}
              className="h-10 rounded-md border border-border/70 bg-card flex items-center justify-center"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={96}
                height={24}
                className="h-5 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}