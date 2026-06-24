"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deactivateCurePartner } from "@/lib/actions/admin-cure-partners";

interface CurePartnerRow {
  id: string;
  full_name: string | null;
  languages: string[] | null;
  specialty_areas: string[] | null;
  service_regions: string[] | null;
  status: string | null;
  vip_level: string | null;
  contact_whatsapp: string | null;
  nationality: string | null;
  base_country: string | null;
  created_at: string | null;
  profiles: { email: string | null } | null;
}

const PROTOCOL_OPTIONS = [
  { value: "airport_pickup", label: "Airport VIP Pickup (Limousine)" },
  { value: "hospital_accompany", label: "Hospital Accompaniment" },
  { value: "translation", label: "Multilingual Translation" },
  { value: "meditation_arrangement", label: "Wellness / Meditation Arrangement" },
  { value: "post_care", label: "Post-Departure Follow-up" },
  { value: "visa_support", label: "Visa & Document Support" },
  { value: "accommodation", label: "Accommodation Arrangement" },
];

const VIP_LEVELS = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" },
  { value: "vvip", label: "VVIP" },
];

const VIP_BADGE: Record<string, string> = {
  vvip: "bg-amber-100 text-amber-700",
  vip: "bg-purple-100 text-purple-700",
  standard: "bg-slate-100 text-slate-600",
};

export default function CurePartnersClient({ initialCurePartners }: { initialCurePartners: CurePartnerRow[] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);

  function toggleProtocol(value: string) {
    setSelectedProtocols((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const fd = new FormData(e.currentTarget);
    const body = {
      email: fd.get("email"),
      password: fd.get("password"),
      full_name: fd.get("full_name"),
      nationality: fd.get("nationality"),
      base_country: fd.get("base_country"),
      languages: fd.get("languages"),
      specialty_areas: fd.get("specialty_areas"),
      service_regions: fd.get("service_regions"),
      certifications: fd.get("certifications"),
      partner_hospitals: fd.get("partner_hospitals"),
      title_en: fd.get("title_en"),
      title_ko: fd.get("title_ko"),
      bio_en: fd.get("bio_en"),
      bio_ko: fd.get("bio_ko"),
      years_experience: fd.get("years_experience"),
      patient_count: fd.get("patient_count"),
      vip_level: fd.get("vip_level"),
      contact_whatsapp: fd.get("contact_whatsapp"),
      contact_wechat: fd.get("contact_wechat"),
      photo_url: fd.get("photo_url"),
      intro_video_url: fd.get("intro_video_url"),
      protocol_features: selectedProtocols,
    };
    const res = await fetch("/api/admin/cure-partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setFormSuccess(true);
      setSelectedProtocols([]);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      const { error } = await res.json();
      setFormError(error ?? "Failed to create cure partner");
    }
  }

  function handleDeactivate(cpId: string) {
    if (!confirm("Deactivate this Cure Partner?")) return;
    startTransition(async () => {
      await deactivateCurePartner(cpId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* List table */}
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">VIP Level</th>
              <th className="text-left px-4 py-3 font-medium">Languages</th>
              <th className="text-left px-4 py-3 font-medium">Service Regions</th>
              <th className="text-left px-4 py-3 font-medium">WhatsApp</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {initialCurePartners.length > 0 ? initialCurePartners.map((cp) => (
              <tr key={cp.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{cp.profiles?.email ?? "—"}</td>
                <td className="px-4 py-3">
                  <div>{cp.full_name ?? "—"}</div>
                  {cp.nationality && <div className="text-xs text-muted-foreground">{cp.nationality} · {cp.base_country}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium uppercase ${VIP_BADGE[cp.vip_level ?? "standard"] ?? VIP_BADGE.standard}`}>
                    {cp.vip_level ?? "standard"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {cp.languages?.join(", ") ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {cp.service_regions?.join(", ") ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs">{cp.contact_whatsapp ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    cp.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {cp.status ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {cp.status === "active" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleDeactivate(cp.id)}
                      className="text-destructive text-xs hover:underline disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No Cure Partners yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create form */}
      <div className="rounded-lg border p-6 space-y-6">
        <h2 className="text-lg font-semibold">Create Cure Partner Account</h2>
        <form onSubmit={handleCreate} className="space-y-6">

          {/* Account */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email *" name="email" type="email" required />
              <Field label="Password *" name="password" type="password" required minLength={8} />
            </div>
          </section>

          {/* Identity */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Identity</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Full Name" name="full_name" />
              <Field label="Nationality" name="nationality" placeholder="e.g. Korean" />
              <Field label="Based Country" name="base_country" placeholder="e.g. South Korea" />
              <Field label="Years of Experience" name="years_experience" type="number" min={0} />
              <Field label="Cumulative Patients" name="patient_count" type="number" min={0} />
              <div className="space-y-1">
                <label className="text-sm font-medium">VIP Level</label>
                <select name="vip_level" defaultValue="standard" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
                  {VIP_LEVELS.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Title & Bio */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Title & Bio</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title (EN)" name="title_en" placeholder="VVIP Medical Manager" />
              <Field label="Title (KO)" name="title_ko" placeholder="VIP 전담 메디컬 매니저" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Bio (EN)</label>
              <textarea name="bio_en" rows={3} placeholder="English biography..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Bio (KO)</label>
              <textarea name="bio_ko" rows={3} placeholder="한국어 소개글..." className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
            </div>
          </section>

          {/* Languages & Specialties */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Languages & Specialties</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Languages (comma-separated)" name="languages" placeholder="English, Korean, Chinese" />
              <Field label="Specialty Areas (comma-separated)" name="specialty_areas" placeholder="Beauty, Anti-Aging, Oncology" />
              <Field label="Service Regions (comma-separated)" name="service_regions" placeholder="China, Europe, Southeast Asia" />
            </div>
          </section>

          {/* Protocol Features */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Protocol Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {PROTOCOL_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedProtocols.includes(opt.value)}
                    onChange={() => toggleProtocol(opt.value)}
                    className="rounded"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Contact & Media */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact & Media</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="WhatsApp Number" name="contact_whatsapp" placeholder="+82 10 XXXX XXXX" />
              <Field label="WeChat ID" name="contact_wechat" placeholder="wechat_id" />
              <Field label="Profile Photo URL" name="photo_url" placeholder="https://..." className="col-span-2" />
              <Field label="Intro Video URL" name="intro_video_url" placeholder="https://youtube.com/..." className="col-span-2" />
            </div>
          </section>

          {/* Partner Info */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Partner Info</h3>
            <Field label="Partner Hospitals (comma-separated)" name="partner_hospitals" placeholder="청담Cell, Severance Hospital" />
            <Field label="Certifications (comma-separated)" name="certifications" placeholder="보건복지부 등록 외국인 환자 유치 의료기관 #12345" />
          </section>

          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600">Cure Partner created successfully.</p>}
          <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Create Cure Partner
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, name, type = "text", required, placeholder, minLength, min, rows, className = "",
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; minLength?: number; min?: number; rows?: number; className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        min={min}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
    </div>
  );
}
