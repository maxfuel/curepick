"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface DoctorPhotoInputProps {
  currentPhotoUrl?: string | null;
}

export function DoctorPhotoInput({ currentPhotoUrl }: DoctorPhotoInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const prevPreviewRef = useRef<string | null>(null);

  useEffect(() => {
    prevPreviewRef.current = preview;
    return () => {
      if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current);
    };
  }, [preview]);

  const displaySrc = preview ?? currentPhotoUrl ?? null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">사진</label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
          {displaySrc ? (
            <Image
              src={displaySrc}
              alt="의사 사진"
              width={80}
              height={80}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-xs text-muted-foreground text-center px-1">사진 없음</span>
          )}
        </div>
        <div className="space-y-1">
          <input
            name="photo_file"
            type="file"
            accept="image/*"
            className="block text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:text-xs file:font-medium file:cursor-pointer cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (preview) URL.revokeObjectURL(preview);
              setPreview(URL.createObjectURL(file));
            }}
          />
          {currentPhotoUrl && !preview && (
            <p className="text-xs text-muted-foreground">파일 미선택 시 현재 사진 유지</p>
          )}
        </div>
      </div>
    </div>
  );
}
