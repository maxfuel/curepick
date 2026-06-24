import { createClient } from "@/lib/supabase/server";

export default async function PartnerResourcesPage() {
  const supabase = await createClient();

  const { data: files, error } = await supabase.storage
    .from("partner-resources")
    .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Resources</h1>
      <p className="text-sm text-muted-foreground">
        Download guides, contracts, and reference materials provided by Curepick.
      </p>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Could not load resources. The storage bucket may not be set up yet.
        </div>
      )}

      {!error && (files ?? []).length === 0 && (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          No resources available yet.
        </div>
      )}

      {(files ?? []).length > 0 && (
        <div className="rounded-lg border divide-y overflow-hidden">
          {files!.filter((f) => f.name !== ".emptyFolderPlaceholder").map((file) => {
            const { data: { publicUrl } } = supabase.storage
              .from("partner-resources")
              .getPublicUrl(file.name);
            return (
              <div key={file.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                    {file.name.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    {file.metadata?.size && (
                      <p className="text-xs text-muted-foreground">{formatBytes(file.metadata.size as number)}</p>
                    )}
                  </div>
                </div>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  Download
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
