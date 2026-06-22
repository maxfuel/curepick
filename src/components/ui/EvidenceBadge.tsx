"use client";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ShieldCheck, ExternalLink } from "lucide-react";

interface EvidenceSource {
  sourceType: string;
  sourceUrl: string | null;
  description: string | null;
}

interface EvidenceBadgeProps {
  score: number;
  sources?: EvidenceSource[];
  label: string;
}

function scoreColor(score: number): string {
  if (score >= 8) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 5) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export function EvidenceBadge({ score, sources, label }: EvidenceBadgeProps) {
  const badge = (
    <Badge
      variant="outline"
      className={`gap-1 cursor-pointer ${scoreColor(score)}`}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {label}: {score}/10
    </Badge>
  );

  if (!sources || sources.length === 0) {
    return badge;
  }

  return (
    <Popover>
      <PopoverTrigger>{badge}</PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            {label}: {score}/10
          </PopoverTitle>
        </PopoverHeader>
        <ul className="space-y-2">
          {sources.map((source, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                {source.sourceType}
              </span>
              <div className="min-w-0">
                {source.sourceUrl ? (
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {source.description || source.sourceUrl}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    {source.description}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
