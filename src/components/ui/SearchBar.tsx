"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface Suggestion {
  type: "service" | "hospital" | "doctor";
  slug: string;
  name: string;
}

interface SearchBarProps {
  locale: string;
  variant?: "hero" | "compact";
}

export function SearchBar({ locale, variant = "compact" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("search");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchSuggestions = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const pattern = `%${q}%`;

      const orPattern = `name->>en.ilike.${pattern},name->>ko.ilike.${pattern},name->>zh.ilike.${pattern},name->>ja.ilike.${pattern}`;

      const [{ data: services }, { data: hospitals }, { data: doctors }] =
        await Promise.all([
          supabase
            .from("services")
            .select("slug, name")
            .or(orPattern)
            .limit(3),
          supabase
            .from("hospitals")
            .select("slug, name")
            .or(orPattern)
            .limit(3),
          supabase
            .from("doctors")
            .select("slug, name")
            .or(orPattern)
            .limit(3),
        ]);

      const results: Suggestion[] = [];

      for (const s of services ?? []) {
        const nameMap = s.name as Record<string, string> | null;
        results.push({
          type: "service",
          slug: s.slug,
          name: nameMap?.[locale] || nameMap?.en || s.slug,
        });
      }
      for (const h of hospitals ?? []) {
        const nameMap = h.name as Record<string, string> | null;
        results.push({
          type: "hospital",
          slug: h.slug,
          name: nameMap?.[locale] || nameMap?.en || h.slug,
        });
      }
      for (const d of doctors ?? []) {
        const nameMap = d.name as Record<string, string> | null;
        results.push({
          type: "doctor",
          slug: d.slug,
          name: nameMap?.[locale] || nameMap?.en || d.slug,
        });
      }

      setSuggestions(results);
      setOpen(results.length > 0);
      setLoading(false);
    },
    [locale]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleSelect(suggestion: Suggestion) {
    setOpen(false);
    setQuery("");
    const pathMap = {
      service: "/services",
      hospital: "/hospitals",
      doctor: "/doctors",
    };
    router.push(`${pathMap[suggestion.type]}/${suggestion.slug}`);
  }

  const typeLabel = {
    service: t("servicesSection"),
    hospital: t("hospitalsSection"),
    doctor: t("doctorsSection"),
  };

  const isHero = variant === "hero";

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isHero ? "text-white/70" : "text-muted-foreground"}`} />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={t("placeholder")}
            className={`pl-10 ${isHero ? "h-12 text-base bg-white/15 border-white/30 text-white placeholder:text-white/60 focus-visible:border-white/60 focus-visible:ring-white/20" : "h-10"}`}
          />
        </div>
        <Button
          type="submit"
          size={isHero ? "lg" : "default"}
          className="bg-[#dc5000] text-white hover:bg-[#dc5000]/90"
        >
          {t("button")}
        </Button>
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover shadow-md">
          <ul className="py-1">
            {suggestions.map((s, i) => (
              <li key={`${s.type}-${s.slug}-${i}`}>
                <button
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted text-left"
                >
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                    {typeLabel[s.type]}
                  </span>
                  <span className="truncate">{s.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && query.length >= 2 && !open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border bg-popover px-4 py-3 text-sm text-muted-foreground shadow-md">
          ...
        </div>
      )}
    </div>
  );
}
