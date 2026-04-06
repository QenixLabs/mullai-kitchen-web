"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

const galleryItems = [
  { src: "/images/food/1.jpg", title: "Traditional South Indian Thali" },
  { src: "/images/food/2.jpg", title: "Fresh Breakfast Spread" },
  { src: "/images/food/3.jpg", title: "Corporate Lunch Setup" },
  { src: "/images/food/4.jpg", title: "Authentic Curry Selection" },
  { src: "/images/food/6.jpg", title: "Office Buffet Service" },
  { src: "/images/food/8.jpg", title: "Fresh Daily Preparation" },
  { src: "/images/food/9.jpg", title: "Kitchen Operations" },
  { src: "/images/food/1.jpg", title: "Corporate Event Catering" },
];

export function GallerySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedItem, setSelectedItem] = useState<(typeof galleryItems)[0] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (item: (typeof galleryItems)[0], index: number) => {
    setSelectedItem(item);
    setCurrentIndex(index);
  };

  const closeLightbox = () => setSelectedItem(null);

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
    setSelectedItem(galleryItems[newIndex]);
  };

  const goToNext = () => {
    const newIndex = currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
    setSelectedItem(galleryItems[newIndex]);
  };

  return (
    <section ref={ref} className="relative py-20 sm:py-24 overflow-hidden bg-[#14060a]">
      {/* Background Pattern matching SafetyMeasuresSection */}
      <div className="absolute inset-0 bg-linear-to-b from-[#14060a] via-primary to-[#14060a]" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_1px_1px,rgba(212,165,116,0.35)_1px,transparent_0)] bg-size-[32px_32px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6 }}
          className="mb-10 sm:mb-14 text-center"
        >
          <span className="inline-flex rounded-full border border-skin/30 bg-skin/10 px-4 py-2 text-xs sm:text-sm font-semibold text-skin tracking-wide">
            <ImageIcon className="h-4 w-4 mr-2" />
            Gallery
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            A Glimpse Into Our Kitchen
          </h2>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            See how we deliver authentic South Indian meals to businesses across the city.
          </p>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm"
              onClick={() => openLightbox(item, index)}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full mx-4 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden">
                <Image src={selectedItem.src} alt={selectedItem.title} fill className="object-contain" priority />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-semibold text-white">{selectedItem.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
