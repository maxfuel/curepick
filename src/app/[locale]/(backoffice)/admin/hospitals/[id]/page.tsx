import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MultilingualInput } from "@/components/backoffice/admin/MultilingualInput";
import {
  updateHospital,
  upsertHospitalProcedure,
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
}

interface HospitalVideo { title: string; url: string; type: string }
interface HospitalAward { title: string; year?: number; description?: string; image_url?: string }

function getMultilingual(val: Json | null | undefined) {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  return val as Record<string, string>;
}
function getEn(val: Json | null | undefined): string {
  const m = getMultilingual(val);
  return m.en ?? "";
}

export default async function EditHospitalPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const t = await getTranslations("admin.hospitals");

  const [{ data: hospital }, { data: allProcedures }, { data: hospitalProcs }] = await Promise.all([
    (supabase.from("hospitals") as any).select("*").eq("id", id).single(),
    supabase.from("procedures").select("id, name").order("name->en"),
    supabase
      .from("hospital_procedures")
      .select("id, procedure_id, cost_min, cost_max, cost_currency, annual_volume, specialist_count, waiting_time_days, procedures(name)")
      .eq("hospital_id", id),
  ]);

  if (!hospital) notFound();

  const handleUpdate = updateHospital.bind(null, id);
  const assignedProcedureIds = new Set(hospitalProcs?.map((hp) => hp.procedure_id) ?? []);
  const availableProcedures = allProcedures?.filter((p) => !assignedProcedureIds.has(p.id)) ?? [];

  const videos: HospitalVideo[] = Array.isArray(hospital.videos) ? hospital.videos : [];
  const galleryImages: string[] = Array.isArray(hospital.gallery_images) ? hospital.gallery_images : [];
  const awards: HospitalAward[] = Array.isArray(hospital.awards) ? hospital.awards : [];

  const addVideo = addHospitalVideo.bind(null, id);
  const addGallery = addHospitalGalleryImage.bind(null, id);
  const addAward = addHospitalAward.bind(null, id);

  return (
    <div className="p-6 max-w-3xl space-y-10">
      <h1 className="text-2xl font-semibold">
        {t("editHospital")}: {getEn(hospital.name)}
      </h1>

      {/* ── Basic Info ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Basic Information</h2>
        <form action={handleUpdate} className="space-y-4">
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
          <Field label={t("fieldLanguages") + " (comma-separated)"} name="languages" defaultValue={(hospital.languages as string[] | null)?.join(", ") ?? ""} />

          {/* Logo */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Logo Image</label>
            <input name="logo_file" type="file" accept="image/*" className="w-full text-sm" />
            {hospital.logo_url && (
              <div className="mt-1 flex items-center gap-2">
                <Image src={hospital.logo_url} alt="logo" width={40} height={40} className="rounded object-cover" />
                <span className="text-xs text-muted-foreground truncate">{hospital.logo_url}</span>
              </div>
            )}
          </div>

          {/* Hero image */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Hero Image</label>
            <input name="hero_file" type="file" accept="image/*" className="w-full text-sm" />
            {hospital.hero_image_url && (
              <div className="mt-1 relative h-24 w-full overflow-hidden rounded-lg">
                <Image src={hospital.hero_image_url} alt="hero" fill className="object-cover" />
              </div>
            )}
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

          <div className="flex gap-3 pt-2">
            <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {t("save")}
            </button>
            <a href={`/${locale}/admin/hospitals`} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted">
              {t("cancel")}
            </a>
          </div>
        </form>
      </section>

      {/* ── Procedures ─────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">{t("procedures")}</h2>
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
                        <form action={removeHospitalProcedure.bind(null, hp.id)} className="inline">
                          <button type="submit" className="text-destructive text-xs hover:underline">{t("remove")}</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {availableProcedures.length > 0 && (
          <form action={upsertHospitalProcedure} className="rounded-lg border p-4 space-y-3">
            <input type="hidden" name="hospital_id" value={id} />
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium">{t("addProcedure")}</label>
                <select name="procedure_id" required className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  <option value="">{t("selectProcedure")}</option>
                  {availableProcedures.map((p) => (
                    <option key={p.id} value={p.id}>{getEn(p.name)}</option>
                  ))}
                </select>
              </div>
              <Field label={t("colCostMin")} name="cost_min" type="number" />
              <Field label={t("colCostMax")} name="cost_max" type="number" />
              <Field label={t("colCurrency")} name="cost_currency" defaultValue="USD" />
              <Field label={t("colVolume")} name="annual_volume" type="number" />
            </div>
            <button type="submit" className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80">
              {t("addProcedureBtn")}
            </button>
          </form>
        )}
      </section>

      {/* ── Videos ─────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Videos</h2>
        <p className="text-sm text-muted-foreground">Add YouTube URLs (watch links or youtu.be links). These appear as a video gallery on the hospital page.</p>

        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((v, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{v.title || "(no title)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{v.url}</p>
                  <span className="inline-block mt-0.5 text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">{v.type}</span>
                </div>
                <form action={removeHospitalVideo.bind(null, id, i)}>
                  <button type="submit" className="text-xs text-destructive hover:underline shrink-0">Remove</button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addVideo} className="rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Video Title" name="title" placeholder="e.g. Hospital Tour" />
            <div className="space-y-1">
              <label className="text-sm font-medium">Video Type</label>
              <select name="type" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                <option value="youtube">General</option>
                <option value="facility">Facility Tour</option>
                <option value="testimonial">Patient Story</option>
                <option value="doctor">Doctor Interview</option>
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">YouTube URL *</label>
              <input name="url" type="url" required placeholder="https://www.youtube.com/watch?v=..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80">Add Video</button>
        </form>
      </section>

      {/* ── Gallery Images ──────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Photo Gallery</h2>
        <p className="text-sm text-muted-foreground">Upload facility photos — up to 20 recommended. Shown in a grid with lightbox on the hospital page.</p>

        {galleryImages.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {galleryImages.map((url, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                <Image src={url} alt={`Gallery ${i + 1}`} fill className="object-cover" sizes="150px" />
                <form action={removeHospitalGalleryImage.bind(null, id, url)} className="absolute inset-0 hidden group-hover:flex items-center justify-center bg-black/50">
                  <button type="submit" className="rounded bg-destructive px-2 py-1 text-xs text-white font-medium">Remove</button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addGallery} className="rounded-lg border p-4">
          <label className="text-sm font-medium">Add Photo</label>
          <div className="mt-2 flex items-center gap-3">
            <input name="image_file" type="file" accept="image/*" required className="flex-1 text-sm" />
            <button type="submit" className="rounded-md bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80 whitespace-nowrap">Upload</button>
          </div>
        </form>
      </section>

      {/* ── Awards & Accreditations ─────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">Awards & Accreditations</h2>

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
                <form action={removeHospitalAward.bind(null, id, i)}>
                  <button type="submit" className="text-xs text-destructive hover:underline shrink-0">Remove</button>
                </form>
              </div>
            ))}
          </div>
        )}

        <form action={addAward} className="rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Award / Certification Title *</label>
              <input name="title" required placeholder="e.g. JCI Accreditation" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <Field label="Year" name="year" type="number" placeholder="2023" />
            <div className="space-y-1">
              <label className="text-sm font-medium">Badge Image (optional)</label>
              <input name="image_file" type="file" accept="image/*" className="w-full text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-sm font-medium">Description (optional)</label>
              <input name="description" placeholder="Short description" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80">Add Award</button>
        </form>
      </section>
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
