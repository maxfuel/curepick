import { Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

interface ReviewCardProps {
  review: {
    id: string;
    title: string;
    content: string;
    rating: number;
    media: unknown;
    is_verified: boolean | null;
    created_at: string | null;
    hospitals: { name: unknown } | null;
    authorName: string | null;
  };
  locale: string;
}

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const mediaUrls = Array.isArray(review.media)
    ? (review.media as string[])
    : [];

  return (
    <Link
      href={`/reviews/${review.id}`}
      className="block rounded-xl border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${
                    i < review.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            {review.is_verified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {review.created_at
              ? new Date(review.created_at).toLocaleDateString(locale)
              : ""}
          </span>
        </div>

        <h3 className="font-medium">{review.title}</h3>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {review.content}
        </p>

        {mediaUrls.length > 0 && (
          <div className="flex gap-2">
            {mediaUrls.slice(0, 3).map((url, i) => (
              <div
                key={i}
                className="size-16 overflow-hidden rounded-lg bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </div>
            ))}
            {mediaUrls.length > 3 && (
              <div className="flex size-16 items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                +{mediaUrls.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {review.authorName && <span>{review.authorName}</span>}
          {review.hospitals && (
            <>
              {review.authorName && <span>·</span>}
              <span>{getLocalizedName(review.hospitals.name, locale)}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
