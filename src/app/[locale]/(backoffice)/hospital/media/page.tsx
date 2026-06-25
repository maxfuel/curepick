import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { YouTubePreviewInput } from "@/components/ui/YouTubePreviewInput";
import {
  updateHospitalLogo,
  updateHospitalHero,
  addHospitalGalleryImage,
  removeHospitalGalleryImage,
  addHospitalVideo,
  removeHospitalVideo,
} from "@/lib/actions/hospital-media";

const VIDEO_TYPES = [
  { value: "general", label: "General" },
  { value: "facility", label: "Facility Tour" },
  { value: "doctor", label: "Doctor Introduction" },
  { value: "testimonial", label: "Patient Testimonial" },
];

export default async function HospitalMediaPage() {
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: hospital } = await (supabase.from("hospitals") as any)
    .select("slug, logo_url, hero_image_url, gallery_images, videos")
    .eq("id", profile!.hospital_id!)
    .single();

  const galleryImages: string[] = (hospital?.gallery_images as string[]) ?? [];
  const videos: { title: string; url: string; type: string }[] =
    (hospital?.videos as { title: string; url: string; type: string }[]) ?? [];

  return (
    <div className="p-6 max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold">미디어 관리</h1>

      {/* ── Section 1: Logo ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">로고</h2>
          <p className="text-sm text-muted-foreground mt-1">
            검색 결과 및 병원 상세 페이지 상단에 표시됩니다.
          </p>
        </div>
        {hospital?.logo_url && (
          <div className="relative h-14 w-14 overflow-hidden rounded-lg border bg-muted">
            <Image src={hospital.logo_url} alt="Logo" fill className="object-contain" />
          </div>
        )}
        <form action={updateHospitalLogo} className="space-y-3">
          <FileDropzone
            name="logo_file"
            accept="image/*"
            currentPreviewUrl={hospital?.logo_url ?? undefined}
            label={hospital?.logo_url ? "로고 교체" : "로고 업로드"}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            저장
          </button>
        </form>
      </section>

      {/* ── Section 2: Hero Image ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">히어로 이미지</h2>
          <p className="text-sm text-muted-foreground mt-1">
            병원 상세 페이지 최상단 대표 사진입니다. 가로 비율의 고화질 이미지를 권장합니다.
          </p>
        </div>
        {hospital?.hero_image_url && (
          <div className="relative h-40 w-full overflow-hidden rounded-lg border">
            <Image src={hospital.hero_image_url} alt="Hero" fill className="object-cover" />
          </div>
        )}
        <form action={updateHospitalHero} className="space-y-3">
          <FileDropzone
            name="hero_file"
            accept="image/*"
            currentPreviewUrl={hospital?.hero_image_url ?? undefined}
            label={hospital?.hero_image_url ? "히어로 이미지 교체" : "히어로 이미지 업로드"}
          />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            저장
          </button>
        </form>
      </section>

      {/* ── Section 3: Photo Gallery ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">사진 갤러리</h2>
          <p className="text-sm text-muted-foreground mt-1">
            병원 상세 페이지 이미지 모자이크에 표시됩니다. 최대 20장을 권장합니다.
          </p>
        </div>

        {galleryImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((src, i) => (
              <div key={src} className="relative group aspect-square overflow-hidden rounded-lg border">
                <Image src={src} alt={`Gallery ${i + 1}`} fill className="object-cover" />
                <form
                  action={removeHospitalGalleryImage}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity"
                >
                  <input type="hidden" name="image_url" value={src} />
                  <button
                    type="submit"
                    className="rounded-md bg-destructive px-2 py-1 text-xs font-medium text-white hover:bg-destructive/90"
                  >
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addHospitalGalleryImage} className="space-y-3">
          <FileDropzone name="image_file" accept="image/*" label="사진 추가" />
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            사진 추가
          </button>
        </form>
      </section>

      {/* ── Section 4: YouTube Videos ── */}
      <section className="rounded-xl border p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold">YouTube 영상</h2>
          <p className="text-sm text-muted-foreground mt-1">
            병원 소개, 시설 투어, 의사 소개, 환자 후기 영상을 등록하세요.
          </p>
        </div>

        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{v.title || "(제목 없음)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{v.url}</p>
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {VIDEO_TYPES.find((t) => t.value === v.type)?.label ?? v.type}
                </span>
                <form action={removeHospitalVideo}>
                  <input type="hidden" name="index" value={i} />
                  <button
                    type="submit"
                    className="shrink-0 text-destructive text-xs hover:underline"
                  >
                    삭제
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addHospitalVideo} className="space-y-3">
          <YouTubePreviewInput
            name="url"
            label="YouTube URL *"
            placeholder="https://youtube.com/watch?v=..."
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">제목</label>
              <input
                name="title"
                type="text"
                placeholder="시설 투어 영상"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">유형</label>
              <select
                name="type"
                defaultValue="general"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {VIDEO_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            영상 추가
          </button>
        </form>
      </section>
    </div>
  );
}
