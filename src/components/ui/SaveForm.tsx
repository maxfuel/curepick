"use client";

import { useRef, useState, useTransition } from "react";

interface SaveFormProps {
  action: (formData: FormData) => Promise<void>;
  cancelHref?: string;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
  children: React.ReactNode;
}

export function SaveForm({
  action,
  cancelHref,
  saveLabel = "저장",
  cancelLabel = "취소",
  className = "space-y-4",
  resetOnSuccess = false,
  children,
}: SaveFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "pending" | "saved" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setStatus("pending");
    startTransition(async () => {
      try {
        await action(formData);
        setStatus("saved");
        if (resetOnSuccess) formRef.current?.reset();
        setTimeout(() => setStatus("idle"), 3000);
      } catch (err: unknown) {
        // redirect() throws NEXT_REDIRECT — let Next.js handle the navigation
        const digest = (err as { digest?: string })?.digest ?? "";
        if (digest.startsWith("NEXT_REDIRECT")) return;
        setStatus("error");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={className}>
      {children}

      <div className="flex items-center gap-3 pt-2">
        {status === "saved" ? (
          <p className="text-sm font-medium text-green-600">✓ 저장완료</p>
        ) : (
          <>
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? "저장 중..." : saveLabel}
            </button>
            {cancelHref && (
              <a
                href={cancelHref}
                className="cursor-pointer rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {cancelLabel}
              </a>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">저장에 실패했습니다. 다시 시도해주세요.</p>
            )}
          </>
        )}
      </div>
    </form>
  );
}
