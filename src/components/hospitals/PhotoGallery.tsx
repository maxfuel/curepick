"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";

export function PhotoGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (!images.length) return null;

  const prev = () =>
    setLightbox((i) =>
      i !== null ? (i - 1 + images.length) % images.length : null
    );
  const next = () =>
    setLightbox((i) => (i !== null ? (i + 1) % images.length : null));

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
    if (e.key === "Escape") setLightbox(null);
  };

  // Show first 8 in grid; rest shown via lightbox
  const preview = images.slice(0, 8);
  const remaining = images.length - preview.length;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {preview.map((url, i) => (
          <button
            key={i}
            onClick={() => setLightbox(i)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={url}
              alt={`${alt} — photo ${i + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* "see more" overlay on last visible tile */}
            {i === preview.length - 1 && remaining > 0 && (
              <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white">
                <Camera className="size-6 mb-1" />
                <span className="text-lg font-bold">+{remaining}</span>
                <span className="text-xs">more photos</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
          onKeyDown={handleKey}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* Prev */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="size-7" />
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[80vh]">
              <Image
                src={images[lightbox]}
                alt={`${alt} — photo ${lightbox + 1}`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="size-7" />
          </button>

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightbox + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
