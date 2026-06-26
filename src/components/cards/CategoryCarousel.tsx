"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CategoryCard } from "./CategoryCard";

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  servicesLabel: string;
}

export function CategoryCarousel({ categories }: { categories: CategoryItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const smoothScroll = (el: HTMLElement, target: number, duration = 520) => {
    const start = el.scrollLeft;
    const distance = target - start;
    if (Math.abs(distance) < 1) return;
    let startTime: number | null = null;

    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2; // easeInOutCubic

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
            gridTemplateRows: "repeat(2, auto)",
            gridAutoFlow: "column",
            gridAutoColumns: "minmax(200px, 270px)",
            width: "fit-content",
            margin: "0 auto",
          }}
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              slug={cat.slug}
              name={cat.name}
              imageUrl={cat.imageUrl}
              servicesLabel={cat.servicesLabel}
            />
          ))}
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
