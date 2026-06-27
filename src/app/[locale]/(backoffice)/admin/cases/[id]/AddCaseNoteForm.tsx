"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminAddCaseNote } from "@/lib/actions/admin-cases";

export default function AddCaseNoteForm({ caseId }: { caseId: string }) {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    startTransition(async () => {
      await adminAddCaseNote(caseId, content.trim());
      setContent("");
      router.refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Add a note…"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none"
      />
      {saved ? (
        <p className="text-sm font-medium text-green-600">✓ 저장완료</p>
      ) : (
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add Note"}
        </button>
      )}
    </form>
  );
}
