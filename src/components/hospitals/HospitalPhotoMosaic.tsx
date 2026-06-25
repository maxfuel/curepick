"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface HospitalPhotoMosaicProps {
  heroImageUrl: string | null;
  galleryImages: string[];
  altText: string;
  children: React.ReactNode;
}

export function HospitalPhotoMosaic({
  heroImageUrl,
  galleryImages,
  altText,
  children,
}: HospitalPhotoMosaicProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // All images in order: hero first, then gallery
  const allImages = [
    ...(heroImageUrl ? [heroImageUrl] : []),
    ...galleryImages,
  ];

  const gridImages = galleryImages.slice(0, 4);
  const showGrid = gridImages.length > 0;
  const extraCount = galleryImages.length > 4 ? galleryImages.length - 3 : 0;

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + allImages.length) % allImages.length));
  }, [allImages.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % allImages.length));
  }, [allImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIndex, prev, next]);

  // Gallery image index in allImages: hero occupies index 0 if present
  const heroOffset = heroImageUrl ? 1 : 0;

  return (
    <>
      <section className="relative h-[480px] md:h-[560px] bg-gray-900 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-1">

          {/* ── LEFT: Main hero image + text overlay ── */}
          <div
            className="relative flex items-end overflow-hidden cursor-pointer group"
            onClick={() => heroImageUrl && openLightbox(0)}
          >
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={altText}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            ) : null}
            <div
              className={`absolute inset-0 ${
                heroImageUrl
                  ? "bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                  : "bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/30"
              }`}
            />
            {children}
          </div>

          {/* ── RIGHT: 2×2 gallery grid (desktop only) ── */}
          {showGrid && (
            <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-1">
              {Array.from({ length: 4 }).map((_, i) => {
                const src = gridImages[i];
                const isLast = i === 3;
                const lightboxIdx = heroOffset + i;

                return (
                  <div
                    key={i}
                    className="relative overflow-hidden bg-gray-800 cursor-pointer group"
                    onClick={() => src && openLightbox(lightboxIdx)}
                  >
                    {src ? (
                      <>
                        <Image
                          src={src}
                          alt={`${altText} ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="20vw"
                        />
                        {isLast && extraCount > 0 && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openLightbox(lightboxIdx); }}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white hover:bg-black/65 transition-colors"
                          >
                            <Images className="h-6 w-6" />
                            <span className="text-sm font-semibold">+{extraCount} 사진 더 보기</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gray-700/50" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── "전체 사진 보기" button (bottom-right of section, mobile hidden) ── */}
        {allImages.length > 1 && (
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 hidden md:flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow hover:bg-white transition-colors"
          >
            <Images className="h-3.5 w-3.5" />
            전체 사진 보기 ({allImages.length})
          </button>
        )}
      </section>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}
          <p className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {lightboxIndex + 1} / {allImages.length}
          </p>

          {/* Image */}
          <div
            className="relative h-[80vh] w-[90vw] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIndex]}
              alt={`${altText} ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>

          {/* Prev */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
