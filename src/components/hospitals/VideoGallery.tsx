"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

export interface HospitalVideo {
  title: string;
  url: string;
  type: "youtube" | "facility" | "testimonial" | "doctor";
}

const TYPE_LABELS: Record<string, string> = {
  youtube: "Video",
  facility: "Facility Tour",
  testimonial: "Patient Story",
  doctor: "Doctor Interview",
};

const TYPE_COLORS: Record<string, string> = {
  youtube: "bg-red-600",
  facility: "bg-sky-600",
  testimonial: "bg-emerald-600",
  doctor: "bg-violet-600",
};

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/
  );
  return match ? match[1] : null;
}

export function VideoGallery({ videos }: { videos: HospitalVideo[] }) {
  const [active, setActive] = useState<number | null>(null);

  const validVideos = videos.filter((v) => getYoutubeId(v.url));
  if (!validVideos.length) return null;

  return (
    <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {validVideos.map((video, i) => {
        const ytId = getYoutubeId(video.url)!;
        const typeLabel = TYPE_LABELS[video.type] ?? "Video";
        const typeBg = TYPE_COLORS[video.type] ?? "bg-gray-600";

        return (
          <div key={i} className="flex flex-col gap-2">
            {active === i ? (
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
                <button
                  onClick={() => setActive(null)}
                  className="absolute top-2 right-2 z-10 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActive(i)}
                className="group relative aspect-video w-full overflow-hidden rounded-xl bg-muted shadow hover:shadow-md transition-shadow"
              >
                {/* YouTube thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                  alt={video.title || typeLabel}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform">
                    <Play className="size-6 text-gray-900 ml-1" fill="currentColor" />
                  </div>
                </div>
                {/* Type badge */}
                <span
                  className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${typeBg}`}
                >
                  {typeLabel}
                </span>
              </button>
            )}
            {video.title && (
              <p className="text-sm font-medium line-clamp-1 px-0.5">{video.title}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
