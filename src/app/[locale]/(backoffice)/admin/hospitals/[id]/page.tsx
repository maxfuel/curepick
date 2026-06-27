import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { LanguageTagPicker } from "@/components/backoffice/admin/LanguageTagPicker";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { YouTubePreviewInput } from "@/components/ui/YouTubePreviewInput";
import { SaveForm } from "@/components/ui/SaveForm";
import { ProcedureAddSection } from "@/components/backoffice/admin/ProcedureAddSection";
import {
  updateHospital,
  updateHospitalLogo,
  updateHospitalHero,
  removeHospitalProcedure,
  addHospitalVideo,
  removeHospitalVideo,
  addHospitalGalleryImage,
  removeHospitalGalleryImage,
  addHospitalAward,
  removeHospitalAward,
} from "@/lib/actions/admin-hospitals";
import type { Json } from "@/lib/types/database";

interface Props {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

interface HospitalVideo { title: string; url: string; type: string }
interface HospitalAward { title: string; year?: number; description?: string; image_url?: string }

function getMultilingual(val: Json | null | undefined) {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  return val as Record<string, string>;
}
function getEn(val: Json | null | undefined): string {
  return getMultilingual(val).en ?? "";
}

export default async function EditHospitalPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  const { tab = "info" } = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations("admin.hospitals");

  const [{ data: hospital }, { data: rawCategories }, { data: hospitalProcs }] = await Promise.all([
    (supabase.from("hospitals") as any).select("*").eq("id", id).single(),
    (supabase.from("categories") as any)
      .select("id, name, services(id, name, sort_order, procedures(id, name, sort_order))")
      .order("sort_order"),
    supabase
      .from("hospital_procedures")
      .select("id, procedure_id, cost_min, cost_max, cost_currency, annual_volume, specialist_count, waiting_time_days, procedures(name)")
      .eq("hospital_id", id),
  ]);

  if (!hospital) notFound();

  const handleUpdate = updateHospital.bind(null, id);
  const assignedProcedureIds = (hospitalProcs?.map((hp) => hp.procedure_id) ?? []) as string[];

  const categoryTree = (rawCategories ?? []).map((cat: any) => ({
    id: cat.id as string,
    name: getEn(cat.name),
    services: ((cat.services ?? []) as any[])
      .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((svc: any) => ({
        id: svc.id as string,
        name: getEn(svc.name),
        procedures: ((svc.procedures ?? []) as any[])
          .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((proc: any) => ({ id: proc.id as string, name: getEn(proc.name) })),
      }))
      .filter((svc: any) => svc.procedures.length > 0),
  })).filter((cat: any) => cat.services.length > 0);

  const videos: HospitalVideo[] = Array.isArray(hospital.videos) ? hospital.videos : [];
  const galleryImages: string[] = Array.isArray(hospital.gallery_images) ? hospital.gallery_images : [];
  const awards: HospitalAward[] = Array.isArray(hospital.awards) ? hospital.awards : [];

  const addVideo = addHospitalVideo.bind(null, id);
  const addGallery = addHospitalGalleryImage.bind(null, id);
  const addAward = addHospitalAward.bind(null, id);
  const uploadLogo = updateHospitalLogo.bind(null, id);
  const uploadHero = updateHospitalHero.bind(null, id);

  const tabItems = [
    { key: "info",       label: "기본 정보", href: `/${locale}/admin/hospitals/${id}` },
    { key: "media",      label: "미디어",    href: `/${locale}/admin/hospitals/${id}?tab=media` },
    { key: "procedures", label: "시술/인증", href: `/${locale}/admin/hospitals/${id}?tab=procedures` },
  ];

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold">
        {t("editHospital")}: {getEn(hospital.name)}
      </h1>

      {/* ── Tab Navigation ──────────────────────────────────────── */}
      <div className="flex gap-0 border-b">
        {tabItems.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === item.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* ── Tab: 기본 정보 ──────────────────────────────────────── */}
      {tab === "info" && (
        <SaveForm action={handleUpdate} cancelHref={`/${locale}/admin/hospitals`} saveLabel={t("save")} cancelLabel={t("cancel")}>
          <MultilingualInput name="name" label={t("fieldName")} value={getMultilingual(hospital.name)} />
          <MultilingualInput name="description" label={t("fieldDescription")} multiline value={getMultilingual(hospital.description)} />
          <MultilingualInput name="address" label={t("fieldAddress")} value={getMultilingual(hospital.address)} />

          <div className="grid grid-cols-2 gap-4">
            <Field label={t("fieldSlug")} name="slug" defaultValue={hospital.slug ?? ""} />
            <Field label={t("fieldCity")} name="city" defaultValue={hospital.city ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("fieldPhone")} name="phone" defaultValue={hospital.phone ?? ""} />
            <Field label="Email" name="email" type="email" defaultValue={hospital.email ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t("fieldWebsite")} name="website" type="url" defaultValue={hospital.website ?? ""} />
            <Field label={t("fieldAccreditation")} name="accreditation" defaultValue={hospital.accreditation ?? ""} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Founded Year" name="founded_year" type="number" defaultValue={hospital.founded_year ?? ""} />
            <Field label="Annual Patients" name="annual_patients" type="number" defaultValue={hospital.annual_patients ?? ""} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldLanguages")}</label>
            <LanguageTagPicker name="languages" defaultValue={(hospital.languages as string[] | null) ?? []} />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input name="is_featured" type="checkbox" defaultChecked={hospital.is_featured ?? false} />
              {t("fieldFeatured")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input name="international_center" type="checkbox" defaultChecked={hospital.international_center ?? false} />
              {t("fieldInternational")}
            </label>
          </div>
        </SaveForm>
      )}

      {/* ── Tab: 미디어 ─────────────────────────────────────────── */}
      {tab === "media" && (
        <div className="space-y-8">
          {/* Logo */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b pb-2">로고</h2>
            {hospital.logo_url && (
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border bg-muted">
                <Image src={hospital.logo_url} alt="Logo" fill className="object-contain" />
              </div>
            )}
            <div className="rounded-lg border p-4">
              <SaveForm action={uploadLogo} saveLabel="저장" className="space-y-3">
                <FileDropzone
                  name="logo_file"
                  accept="image/*"
                  currentPreviewUrl={hospital.logo_url}
                  label={hospital.logo_url ? "로고 교체" : "로고 업로드"}
                />
              </SaveForm>
            </div>
          </section>

          {/* Hero Image */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b pb-2">히어로 이미지</h2>
            <p className="text-sm text-muted-foreground">권장: 1920×1080px 이상. 병원 페이지 최상단 전체 너비 배경으로 표시됩니다.</p>
            {hospital.hero_image_url && (
              <div className="relative h-32 w-full overflow-hidden rounded-lg border">
                <Image src={hospital.hero_image_url} alt="Hero" fill className="object-cover" />
              </div>
            )}
            <div className="rounded-lg border p-4">
              <SaveForm action={uploadHero} saveLabel="저장" className="space-y-3">
                <FileDropzone
                  name="hero_file"
                  accept="image/*"
                  currentPreviewUrl={hospital.hero_image_url}
                  label={hospital.hero_image_url ? "히어로 이미지 교체" : "히어로 이미지 업로드"}
                />
              </SaveForm>
            </div>
          </section>

          {/* Photo Gallery */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b pb-2">사진 갤러리</h2>
            <p className="text-sm text-muted-foreground">병원 시설 사진을 업로드하세요. 최대 20장을 권장합니다.</p>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {galleryImages.map((url, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                    <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="150px" />
                    <div className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50">
                      <DeleteButton
                        action={removeHospitalGalleryImage.bind(null, id, url)}
                        label="삭제"
                        className="rounded bg-destructive px-2 py-1 text-xs text-white font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border p-4">
              <SaveForm action={addGallery} saveLabel="업로드" resetOnSuccess className="space-y-3">
                <FileDropzone name="image_file" accept="image/*" label="사진 추가" />
              </SaveForm>
            </div>
          </section>

          {/* YouTube Videos */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b pb-2">YouTube 영상</h2>
            <p className="text-sm text-muted-foreground">YouTube URL을 추가하세요. 병원 페이지 영상 갤러리에 표시됩니다.</p>

            {videos.length > 0 && (
              <div className="space-y-2">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{v.title || "(제목 없음)"}</p>
                      <p className="text-xs text-muted-foreground truncate">{v.url}</p>
                      <span className="inline-block mt-0.5 text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">{v.type}</span>
                    </div>
                    <DeleteButton
                      action={removeHospitalVideo.bind(null, id, i)}
                      label="삭제"
                      className="cursor-pointer text-xs text-destructive hover:underline shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border p-4">
              <SaveForm action={addVideo} saveLabel="영상 추가" resetOnSuccess className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="영상 제목" name="title" placeholder="예: 병원 투어" />
                  <div className="space-y-1">
                    <label className="text-sm font-medium">영상 유형</label>
                    <select name="type" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                      <option value="youtube">일반</option>
                      <option value="facility">시설 투어</option>
                      <option value="testimonial">환자 스토리</option>
                      <option value="doctor">의사 인터뷰</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <YouTubePreviewInput name="url" required label="YouTube URL *" />
                  </div>
                </div>
              </SaveForm>
            </div>
          </section>
        </div>
      )}

      {/* ── Tab: 시술/인증 ──────────────────────────────────────── */}
      {tab === "procedures" && (
        <div className="space-y-8">
          {/* Procedures */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b pb-2">{t("procedures")}</h2>

            {hospitalProcs && hospitalProcs.length > 0 && (
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-3 py-2 font-medium">{t("colProcedure")}</th>
                      <th className="text-left px-3 py-2 font-medium">{t("colCost")}</th>
                      <th className="text-left px-3 py-2 font-medium">{t("colVolume")}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {hospitalProcs.map((hp) => {
                      const procName = hp.procedures ? getEn((hp.procedures as { name: Json }).name) : hp.procedure_id;
                      return (
                        <tr key={hp.id} className="border-b last:border-0">
                          <td className="px-3 py-2">{procName}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {hp.cost_min != null ? `${hp.cost_currency} ${hp.cost_min}–${hp.cost_max}` : "—"}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{hp.annual_volume ?? "—"}</td>
                          <td className="px-3 py-2">
                            <DeleteButton action={removeHospitalProcedure.bind(null, hp.id)} label={t("remove")} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <ProcedureAddSection
              hospitalId={id}
              categories={categoryTree}
              assignedProcedureIds={assignedProcedureIds}
            />
          </section>

          {/* Awards & Accreditations */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold border-b pb-2">Awards & Accreditations</h2>

            {awards.length > 0 && (
              <div className="space-y-2">
                {awards.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                    {a.image_url && (
                      <Image src={a.image_url} alt={a.title} width={40} height={40} className="rounded object-contain shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.title}{a.year ? ` (${a.year})` : ""}</p>
                      {a.description && <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>}
                    </div>
                    <DeleteButton
                      action={removeHospitalAward.bind(null, id, i)}
                      label="삭제"
                      className="cursor-pointer text-xs text-destructive hover:underline shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}

            <form action={addAward} className="rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-medium">수상/인증 제목 *</label>
                  <input name="title" required placeholder="예: JCI Accreditation" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
                <Field label="연도" name="year" type="number" placeholder="2023" />
                <div className="space-y-1">
                  <FileDropzone name="image_file" accept="image/*" label="배지 이미지 (선택)" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-sm font-medium">설명 (선택)</label>
                  <input name="description" placeholder="간단한 설명" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
                </div>
              </div>
              <button type="submit" className="cursor-pointer rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80">
                추가
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────
function Field({
  label, name, type = "text", defaultValue = "", placeholder,
}: {
  label: string; name: string; type?: string; defaultValue?: string | number; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue as string}
        placeholder={placeholder}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
