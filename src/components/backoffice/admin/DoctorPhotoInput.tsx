"use client";

import { FileDropzone } from "@/components/ui/FileDropzone";

interface DoctorPhotoInputProps {
  currentPhotoUrl?: string | null;
}

export function DoctorPhotoInput({ currentPhotoUrl }: DoctorPhotoInputProps) {
  return (
    <FileDropzone
      name="photo_file"
      accept="image/*"
      currentPreviewUrl={currentPhotoUrl}
      label="사진"
    />
  );
}
