"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Star, BadgeCheck } from "lucide-react";
import type { VideoTestimonial } from "./types";

interface VideoPlayerDialogProps {
  testimonial: VideoTestimonial | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDialog({
  testimonial,
  open,
  onOpenChange,
}: VideoPlayerDialogProps) {
  if (!testimonial) return null;

  const getVideoEmbedUrl = () => {
    if (testimonial.video.provider === "youtube") {
      const videoId = testimonial.video.src.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return null;
  };

  const embedUrl = getVideoEmbedUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#1a0509] border-white/10 rounded-2xl p-0 overflow-hidden max-w-4xl"
        showCloseButton
      >
        <DialogTitle className="sr-only">
          Video testimonial by {testimonial.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Watch {testimonial.name}&apos;s video testimonial about their experience
          with Mullai Kitchen
        </DialogDescription>

        {/* Video Player */}
        <div className="relative aspect-video bg-black">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`Testimonial by ${testimonial.name}`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={testimonial.video.src}
              autoPlay
              controls
              className="absolute inset-0 w-full h-full object-contain"
            />
          )}
        </div>

        {/* Author Info Strip */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#D4A574]/30 flex-shrink-0">
              <Image
                src={testimonial.image}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm truncate">
                  {testimonial.name}
                </span>
                {testimonial.verified && (
                  <BadgeCheck className="h-4 w-4 text-[#D4A574] flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-white/50">
                {testimonial.role} &bull; {testimonial.location}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-[#D4A574] text-[#D4A574]"
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
