"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createComment } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TranslateButton } from "./TranslateButton";

interface Comment {
  id: string;
  content: string;
  created_at: string | null;
  profiles: { full_name: string | null; role: string | null } | null;
}

interface CommentSectionProps {
  reviewId: string;
  comments: Comment[];
  commentTranslations: Record<string, { content: string } | null>;
  isLoggedIn: boolean;
  locale: string;
}

interface CommentItemProps {
  comment: Comment;
  cachedTranslation: { content: string } | null;
  locale: string;
}

function CommentItem({ comment, cachedTranslation, locale }: CommentItemProps) {
  const t = useTranslations("reviews");
  const [translation, setTranslation] = useState<{ content: string } | null>(
    cachedTranslation
  );
  const [showTranslation, setShowTranslation] = useState(!!cachedTranslation);

  const displayContent =
    showTranslation && translation ? translation.content : comment.content;

  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-sm font-medium">
          {comment.profiles?.full_name ?? "Anonymous"}
        </span>
        {comment.profiles?.role === "hospital_staff" && (
          <Badge variant="secondary" className="text-xs">
            {t("officialResponse")}
          </Badge>
        )}
        {comment.created_at && (
          <span className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString(locale)}
          </span>
        )}
      </div>
      <p className="text-sm">{displayContent}</p>
      <TranslateButton
        type="comment"
        id={comment.id}
        locale={locale}
        translation={translation}
        showTranslation={showTranslation}
        onTranslated={(data) => setTranslation({ content: data.content })}
        onToggle={setShowTranslation}
      />
    </div>
  );
}

export function CommentSection({
  reviewId,
  comments,
  commentTranslations,
  isLoggedIn,
  locale,
}: CommentSectionProps) {
  const t = useTranslations("reviews");
  const [content, setContent] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsPending(true);
    await createComment(reviewId, content.trim());
    setContent("");
    setIsPending(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("comments")}</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noComments")}</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              cachedTranslation={commentTranslations[comment.id] ?? null}
              locale={locale}
            />
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("writeComment")}
            className="h-8 flex-1 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !content.trim()}
          >
            {isPending ? t("posting") : t("postComment")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">{t("loginToComment")}</p>
      )}
    </div>
  );
}
