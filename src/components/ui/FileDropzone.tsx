"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface FileDropzoneProps {
  name: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  currentPreviewUrl?: string | null;
  onChange?: (files: File[]) => void;
  label?: string;
}

export function FileDropzone({
  name,
  accept,
  multiple,
  maxFiles,
  currentPreviewUrl,
  onChange,
  label,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  const processFiles = (incoming: File[]) => {
    const limited = maxFiles ? incoming.slice(0, maxFiles) : multiple ? incoming : [incoming[0]];
    previewUrlsRef.current.forEach((p) => { if (p) URL.revokeObjectURL(p); });
    const newPreviews = limited.map((f) =>
      f.type.startsWith("image/") ? URL.createObjectURL(f) : ""
    );
    previewUrlsRef.current = newPreviews;
    setFiles(limited);
    setPreviews(newPreviews);
    if (inputRef.current) {
      const dt = new DataTransfer();
      limited.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
    onChange?.(limited);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const imagePreviews = previews.filter(Boolean);
  const hasFiles = files.length > 0;
  const showCurrentPreview = !hasFiles && currentPreviewUrl;

  return (
    <div className="space-y-1.5">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/20"
        }`}
      >
        {showCurrentPreview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={currentPreviewUrl} alt="현재 파일" className="mb-1 h-20 w-20 rounded-md object-cover" />
        ) : imagePreviews.length > 0 ? (
          <div className="mb-1 flex flex-wrap justify-center gap-1">
            {imagePreviews.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img key={i} src={src} alt={`미리보기 ${i + 1}`} className="h-16 w-16 rounded-md object-cover" />
            ))}
          </div>
        ) : (
          <UploadCloud className="h-7 w-7 text-muted-foreground" />
        )}

        {hasFiles ? (
          <p className="text-sm text-foreground">
            {files.length === 1
              ? files[0].name
              : `${files.length}개 파일 선택됨`}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">클릭</span>하거나 파일을 드래그하세요
            {maxFiles && ` (최대 ${maxFiles}개)`}
          </p>
        )}

        {showCurrentPreview && (
          <p className="text-xs text-muted-foreground">파일 미선택 시 현재 파일 유지</p>
        )}

        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => processFiles(Array.from(e.target.files ?? []))}
        />
      </div>
    </div>
  );
}
