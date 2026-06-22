"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";
import { createReview } from "@/lib/actions/reviews";
import { uploadReviewMedia } from "@/lib/storage/upload";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

interface ReviewFormProps {
  hospitals: { id: string; name: unknown }[];
  procedures: { id: string; name: unknown; service_id: string | null }[];
  locale: string;
}

export function ReviewForm({ hospitals, procedures, locale }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const { user } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: ReviewInput) => {
    setIsPending(true);
    setServerError(null);

    try {
      let mediaUrls: string[] = [];
      if (user) {
        const uploads: Promise<string>[] = [
          ...photos.map((file) => uploadReviewMedia(file, user.id)),
          ...(video ? [uploadReviewMedia(video, user.id)] : []),
        ];
        mediaUrls = await Promise.all(uploads);
      }

      const result = await createReview({
        hospitalId: data.hospitalId,
        procedureId: data.procedureId || undefined,
        rating: data.rating,
        title: data.title,
        content: data.content,
        mediaUrls,
      });

      if (result?.error) {
        setServerError(result.error);
        setIsPending(false);
        return;
      }

      router.push("/reviews");
    } catch {
      setServerError("Something went wrong");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="hospitalId" className="text-sm font-medium">
          {t("selectHospital")} *
        </label>
        <select
          id="hospitalId"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register("hospitalId")}
        >
          <option value="">{t("selectHospital")}</option>
          {hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {getLocalizedName(h.name, locale)}
            </option>
          ))}
        </select>
        {errors.hospitalId && (
          <p className="text-xs text-destructive">
            {errors.hospitalId.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="procedureId" className="text-sm font-medium">
          {t("selectProcedure")}
        </label>
        <select
          id="procedureId"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register("procedureId")}
        >
          <option value="">{t("selectProcedure")}</option>
          {procedures.map((p) => (
            <option key={p.id} value={p.id}>
              {getLocalizedName(p.name, locale)}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("rating")} *</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setValue("rating", star, { shouldValidate: true })}
            >
              <Star
                className={`size-6 ${
                  star <= (hoverRating || currentRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-destructive">{errors.rating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          {t("reviewTitle")} *
        </label>
        <Input
          id="title"
          placeholder={t("reviewTitlePlaceholder")}
          aria-invalid={!!errors.title}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          {t("content")} *
        </label>
        <textarea
          id="content"
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder={t("contentPlaceholder")}
          aria-invalid={!!errors.content}
          {...register("content")}
        />
        {errors.content && (
          <p className="text-xs text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="photos" className="text-sm font-medium">
          {t("uploadPhotos")}
        </label>
        <input
          id="photos"
          type="file"
          accept="image/*"
          multiple
          className="text-sm"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).slice(0, 5);
            setPhotos(files);
          }}
        />
        {photos.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {photos.length} file(s) selected
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="video" className="text-sm font-medium">
          {t("uploadVideo")}
        </label>
        <input
          id="video"
          type="file"
          accept="video/*"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            setVideo(file);
          }}
        />
        {video && (
          <p className="text-xs text-muted-foreground">{video.name}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("submittingReview") : t("submitReview")}
      </Button>
    </form>
  );
}
