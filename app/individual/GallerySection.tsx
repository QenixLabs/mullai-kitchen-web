"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Expand, Play, X } from "lucide-react";

type MediaItem = {
  src: string;
  title: string;
  type: "image" | "video";
  poster?: string;
  aspect?: "square" | "tall";
};

const galleryItems: MediaItem[] = [
  { src: "/images/food/9.jpg", title: "Kitchen Operations", type: "image", aspect: "square" },
  { src: "/images/food/3.jpg", title: "Corporate Lunch Setup", type: "image", aspect: "tall" },
  {
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    poster: "/images/home/table.png",
    title: "Meal Prep Reel",
    type: "video",
    aspect: "square",
  },
  { src: "/images/food/8.jpg", title: "Fresh Ingredients", type: "image", aspect: "square" },
  { src: "/images/food/6.jpg", title: "Buffet Service", type: "image", aspect: "tall" },
  {
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm",
    poster: "/images/home/Container.png",
    title: "Kitchen Service Flow",
    type: "video",
    aspect: "square",
  },
  { src: "/images/food/1.jpg", title: "Traditional Thali", type: "image", aspect: "square" },
  { src: "/images/home/Container.png", title: "Gourmet Plate", type: "image", aspect: "square" },
];

function GalleryItem({ item, delay = 0, onClick }: { item: MediaItem; delay?: number; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.45, delay }}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.5rem] bg-white w-full text-left block ${
        item.aspect === "tall" ? "aspect-[3/4]" : "aspect-square"
      }`}
      onClick={onClick}
    >
      {item.type === "video" ? (
        <video
          src={item.src}
          poster={item.poster}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          muted
          loop
          autoPlay
          playsInline
        />
      ) : (
        <Image
          src={item.src}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {item.type === "video" ? <Play className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
      </div>
    </motion.button>
  );
}

export function GallerySection() {
  const ref = useRef(null);
  const lightboxContentRef = useRef<HTMLDivElement | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const openLightbox = (item: MediaItem) => setSelectedItem(item);
  const closeLightbox = () => setSelectedItem(null);

  const openFullscreen = async () => {
    if (!lightboxContentRef.current?.requestFullscreen) {
      return;
    }

    try {
      await lightboxContentRef.current.requestFullscreen();
    } catch {
      // Ignore if browser denies fullscreen request.
    }
  };

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
            A <span className="text-primary">Glimpse</span> Into Our Kitchen
          </h2>
          <p className="individual-copy-slate mt-3 text-base sm:text-lg">
            From fresh ingredients to your plate see how we prepare authentic South Indian meals every day.
          </p>
        </motion.div>

        {/* Masonry-style 4-column grid matching corporate */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <GalleryItem
              item={galleryItems[0]}
              delay={0}
              onClick={() => openLightbox(galleryItems[0])}
            />
            <GalleryItem
              item={galleryItems[4]}
              delay={0.1}
              onClick={() => openLightbox(galleryItems[4])}
            />
          </div>

          {/* Column 2 — offset down */}
          <div className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8">
            <GalleryItem
              item={galleryItems[1]}
              delay={0.05}
              onClick={() => openLightbox(galleryItems[1])}
            />
            <GalleryItem
              item={galleryItems[5]}
              delay={0.15}
              onClick={() => openLightbox(galleryItems[5])}
            />
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-4 sm:gap-5">
            <GalleryItem
              item={galleryItems[2]}
              delay={0.1}
              onClick={() => openLightbox(galleryItems[2])}
            />
            <GalleryItem
              item={galleryItems[6]}
              delay={0.2}
              onClick={() => openLightbox(galleryItems[6])}
            />
          </div>

          {/* Column 4 — offset down */}
          <div className="flex flex-col gap-4 sm:gap-5 mt-6 sm:mt-8">
            <GalleryItem
              item={galleryItems[3]}
              delay={0.15}
              onClick={() => openLightbox(galleryItems[3])}
            />
            <GalleryItem
              item={galleryItems[7]}
              delay={0.25}
              onClick={() => openLightbox(galleryItems[7])}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
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
                onClick={(event) => {
                  event.stopPropagation();
                  void openFullscreen();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Open fullscreen"
              >
                <Expand className="h-5 w-5" />
              </button>
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
              ref={lightboxContentRef}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-5xl max-h-[85vh] w-full mx-4 p-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black">
                {selectedItem.type === "video" ? (
                  <video
                    src={selectedItem.src}
                    poster={selectedItem.poster}
                    controls
                    autoPlay
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
              <p className="mt-4 text-center text-white text-base sm:text-lg font-medium">{selectedItem.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
