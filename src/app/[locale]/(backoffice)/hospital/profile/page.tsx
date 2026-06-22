import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { EditRequestForm } from "@/components/backoffice/hospital/EditRequestForm";
import type { Json } from "@/lib/types/database";

function getLocalizedString(value: Json | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;
    return (obj.en as string) || (obj.ko as string) || "";
  }
  return "";
}

export default async function HospitalProfilePage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.profile");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", profile!.hospital_id!)
    .single();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      {hospital ? (
        <div className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
            <Row label={t("name")} value={getLocalizedString(hospital.name)} />
            <Row label={t("city")} value={hospital.city ?? ""} />
            <Row
              label={t("description")}
              value={getLocalizedString(hospital.description)}
            />
            <Row
              label={t("address")}
              value={getLocalizedString(hospital.address)}
            />
            <Row label={t("phone")} value={hospital.phone ?? ""} />
            <Row label={t("email")} value={hospital.email ?? ""} />
            <Row label={t("website")} value={hospital.website ?? ""} />
            <Row label={t("accreditation")} value={hospital.accreditation ?? ""} />
            <Row
              label={t("internationalCenter")}
              value={hospital.international_center ? t("yes") : t("no")}
            />
            {hospital.languages && hospital.languages.length > 0 && (
              <Row label={t("languages")} value={hospital.languages.join(", ")} />
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">{t("notFound")}</p>
      )}

      <EditRequestForm section="Profile" />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex gap-4 text-sm">
      <span className="w-36 shrink-0 font-medium text-muted-foreground">
        {label}
      </span>
      <span className="flex-1">{value}</span>
    </div>
  );
}
