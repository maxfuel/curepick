"use client";

import { useState } from "react";

export function ReadMoreText({
  text,
  maxLength = 500,
  readMore = "Read more",
  readLess = "Read less",
}: {
  text: string;
  maxLength?: number;
  readMore?: string;
  readLess?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const isTruncatable = text.length > maxLength;

  return (
    <div>
      <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line leading-relaxed">
        {isTruncatable && !expanded ? text.slice(0, maxLength) + "…" : text}
      </div>
      {isTruncatable && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          {expanded ? readLess : readMore}
        </button>
      )}
    </div>
  );
}
