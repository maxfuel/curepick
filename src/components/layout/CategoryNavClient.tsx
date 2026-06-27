"use client";

import { useState, useRef } from "react";
import { Link } from "@/i18n/navigation";

interface ServiceItem {
  id: string;
  slug: string;
  name: string;
}

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  services: ServiceItem[];
}

interface CategoryNavClientProps {
  categories: CategoryItem[];
}

export function CategoryNavClient({ categories }: CategoryNavClientProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveId(id);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveId(null), 150);
  };

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {categories.map((category) => (
        <div
          key={category.id}
          className="relative"
          onMouseEnter={() => handleMouseEnter(category.id)}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            href={`/categories/${category.slug}`}
            className="block max-w-[7.5rem] overflow-hidden text-ellipsis whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {category.name}
          </Link>

          {activeId === category.id && category.services.length > 0 && (
            <div className="absolute top-full left-0 z-50 pt-1">
              <div className="min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150 rounded-md border border-border bg-background py-1 shadow-lg">
                <div className="border-b border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {category.name}
                </div>
                {category.services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="block px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
