"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Expand, X } from "lucide-react";

type GalleryItemProps = {
  src: string;
  title: string;
  aspect?: "square" | "tall";
  delay?: number;
  onClick: () => void;
};

function GalleryImageItem({ src, title, aspect = "square", delay = 0, onClick }: GalleryItemProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.45, delay }}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.5rem] bg-white w-full text-left block ${
        aspect === "tall" ? "aspect-[3/4]" : "aspect-square"
      }`}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        sizes="(max-width: 768px) 50vw, 25vw"
      />

      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Expand className="h-4 w-4" />
      </div>
    </motion.button>
  );
}

export function GallerySection() {
  const ref = useRef(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string } | null>(null);

  const openLightbox = (src: string, title: string) => setSelectedImage({ src, title });
  const closeLightbox = () => setSelectedImage(null);

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-[#FAF7F2]">
      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <span className="inline-flex rounded-full border border-primary/20 bg-white px-4 py-2 text-xs font-semibold text-primary tracking-wide uppercase">
            Gallery
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-bold text-primary tracking-tight">
            A <span className="brand-wine-text">Glimpse</span> Into Our Kitchen
          </h2>
          <p className="individual-copy-slate mt-3 text-base sm:text-lg">
            From fresh ingredients to your plate see how we prepare authentic South Indian meals every day.
          </p>
        </motion.div>

        {/* Masonry-style 4-column grid matching Figma */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <GalleryImageItem
              src="/images/corporate/jason-briscoe-GliaHAJ3_5A-unsplash.jpg"
              title="Kitchen Operations"
              aspect="square"
              delay={0}
              onClick={() => openLightbox("/images/corporate/jason-briscoe-GliaHAJ3_5A-unsplash.jpg", "Kitchen Operations")}
            />
            <GalleryImageItem
              src="/images/food/9.jpg"
              title="Fresh Ingredients"
              aspect="tall"
              delay={0.1}
              onClick={() => openLightbox("/images/food/9.jpg", "Fresh Ingredients")}
            />
          </div>

          {/* Column 2 — offset down */}
          <div className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8">
            <GalleryImageItem
              src="/images/corporate/Catering Buffet.png"
              title="Corporate Lunch Setup"
              aspect="tall"
              delay={0.05}
              onClick={() => openLightbox("/images/corporate/Catering Buffet.png", "Corporate Lunch Setup")}
            />
            <GalleryImageItem
              src="/images/food/8.jpg"
              title="Fresh Produce"
              aspect="square"
              delay={0.15}
              onClick={() => openLightbox("/images/food/8.jpg", "Fresh Produce")}
            />
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <GalleryImageItem
              src="/images/home/table.png"
              title="Office Catering"
              aspect="square"
              delay={0.1}
              onClick={() => openLightbox("/images/home/table.png", "Office Catering")}
            />
            <GalleryImageItem
              src="/images/food/1.jpg"
              title="Traditional Thali"
              aspect="square"
              delay={0.2}
              onClick={() => openLightbox("/images/food/1.jpg", "Traditional Thali")}
            />
          </div>

          {/* Column 4 — offset down */}
          <div className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8">
            <GalleryImageItem
              src="/images/corporate/kam-idris-hYb7kbu4x7E-unsplash.jpg"
              title="Kitchen Team"
              aspect="square"
              delay={0.15}
              onClick={() => openLightbox("/images/corporate/kam-idris-hYb7kbu4x7E-unsplash.jpg", "Kitchen Team")}
            />
            <GalleryImageItem
              src="/images/corporate/524E481C-D3A0-43C6-82DC-0DAD42403024.png"
              title="Gourmet Plate"
              aspect="square"
              delay={0.25}
              onClick={() => openLightbox("/images/corporate/524E481C-D3A0-43C6-82DC-0DAD42403024.png", "Gourmet Plate")}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={closeLightbox}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full mx-4 p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="mt-4 text-center text-white text-base sm:text-lg font-medium">{selectedImage.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
