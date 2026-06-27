import { updateHeroImage, removeHeroImage } from "@/lib/actions/admin-settings";
import { readSiteSettings } from "@/lib/site-settings";
import Image from "next/image";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { SaveForm } from "@/components/ui/SaveForm";

export default async function AdminSettingsPage() {
  const { hero_image_url: heroImageUrl } = await readSiteSettings();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-8">Site Settings</h1>

      {/* Hero Image */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">Hero Background Image</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Homepage 상단 Hero 섹션의 배경 이미지입니다.
          </p>
        </div>

        {heroImageUrl ? (
          <div className="space-y-3">
            <div className="relative h-48 w-full overflow-hidden rounded-lg border">
              <Image
                src={heroImageUrl}
                alt="Hero background"
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground break-all">{heroImageUrl}</p>
            <form action={removeHeroImage}>
              <button
                type="submit"
                className="text-sm text-destructive hover:underline"
              >
                이미지 제거
              </button>
            </form>
          </div>
        ) : (
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            이미지가 설정되지 않았습니다
          </div>
        )}

        <SaveForm action={updateHeroImage} saveLabel="저장" className="space-y-3">
          <FileDropzone
            name="hero_file"
            accept="image/*"
            currentPreviewUrl={heroImageUrl}
            label={heroImageUrl ? "이미지 교체" : "이미지 업로드"}
          />
        </SaveForm>
      </section>
    </div>
  );
}
