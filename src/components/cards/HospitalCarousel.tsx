"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

interface HospitalItem {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  heroImageUrl: string | null;
  logoUrl: string | null;
}

export function HospitalCarousel({ hospitals }: { hospitals: HospitalItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const smoothScroll = (el: HTMLElement, target: number, duration = 520) => {
    const start = el.scrollLeft;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;
    let startTime: number | null = null;

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const t = Math.min((now - startTime) / duration, 1);
      el.scrollLeft = start + distance * ease(t);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth;
    const target = ref.current.scrollLeft + (dir === "right" ? amount : -amount);
    smoothScroll(ref.current, target);
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden h-10 w-10 items-center justify-center rounded-full border bg-background shadow-md hover:bg-muted sm:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={ref}
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div
          className="grid gap-4"
          style={{
            gridTemplateRows: "1fr",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(220px, 280px)",
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {hospitals.map((hospital) => {
            const imgSrc = hospital.heroImageUrl ?? hospital.logoUrl;
            return (
              <Link
                key={hospital.id}
                href={`/hospitals/${hospital.slug}`}
                className="block"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={hospital.name}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs">
                      {hospital.name}
                    </div>
                  )}
                  {hospital.city && (
                    <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                      {hospital.city}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold truncate">
                  {hospital.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden h-10 w-10 items-center justify-center rounded-full border bg-background shadow-md hover:bg-muted sm:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
