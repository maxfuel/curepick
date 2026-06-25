"use client";

import { useState } from "react";
import { X } from "lucide-react";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

interface YouTubePreviewInputProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function YouTubePreviewInput({
  name,
  defaultValue = "",
  required,
  placeholder = "https://www.youtube.com/watch?v=...",
  label,
  className = "",
}: YouTubePreviewInputProps) {
  const [url, setUrl] = useState(defaultValue);
  const [playing, setPlaying] = useState(false);

  const videoId = extractYouTubeId(url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <input
        type="url"
        name={name}
        value={url}
        required={required}
        placeholder={placeholder}
        onChange={(e) => { setUrl(e.target.value); setPlaying(false); }}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      {thumbnailUrl && (
        <div className="relative w-full overflow-hidden rounded-lg border bg-black" style={{ aspectRatio: "16/9" }}>
          {playing ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                allow="autoplay; fullscreen"
                className="absolute inset-0 h-full w-full"
                title="YouTube video"
              />
              <button
                type="button"
                onClick={() => setPlaying(false)}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                title="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group relative flex h-full w-full items-center justify-center"
              title="영상 재생"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="YouTube 썸네일"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 shadow-lg transition-transform group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5 translate-x-0.5">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
