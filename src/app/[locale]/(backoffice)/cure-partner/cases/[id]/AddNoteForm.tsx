"use client";

import { useState, useTransition, useRef } from "react";
import { addCaseNote } from "@/lib/actions/cure-partner-cases";

interface Props {
  caseId: string;
}

export function AddNoteForm({ caseId }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = textareaRef.current?.value.trim() ?? "";
    if (!content) return;
    setError(null);
    startTransition(async () => {
      try {
        await addCaseNote(caseId, content);
        if (textareaRef.current) textareaRef.current.value = "";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add note");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        ref={textareaRef}
        placeholder="Add a note…"
        rows={3}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Add Note"}
      </button>
    </form>
  );
}
