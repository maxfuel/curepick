"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Star } from "lucide-react";
import { z } from "zod";
import { updateReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const editReviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
});

type EditReviewInput = z.infer<typeof editReviewSchema>;

interface EditReviewFormProps {
  reviewId: string;
  initialRating: number;
  initialTitle: string;
  initialContent: string;
  locale: string;
}

export function EditReviewForm({
  reviewId,
  initialRating,
  initialTitle,
  initialContent,
  locale: _locale,
}: EditReviewFormProps) {
  const t = useTranslations("reviews");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditReviewInput>({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      rating: initialRating,
      title: initialTitle,
      content: initialContent,
    },
  });

  const currentRating = watch("rating");

  const onSubmit = async (data: EditReviewInput) => {
    setIsPending(true);
    setServerError(null);

    const result = await updateReview(reviewId, data);
    if (result?.error) {
      setServerError(result.error);
      setIsPending(false);
      return;
    }

    router.push(`/reviews/${reviewId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

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

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("submittingReview") : t("saveReview")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/reviews/${reviewId}`)}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
