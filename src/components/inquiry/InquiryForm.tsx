"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { inquirySchema, type InquiryInput } from "@/lib/validations/inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getLocalizedName(name: unknown, locale: string): string {
  if (typeof name === "object" && name !== null) {
    const record = name as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return String(name ?? "");
}

interface InquiryFormProps {
  profile: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    nationality: string | null;
  } | null;
  services: { id: string; name: unknown; category_id?: string | null }[];
  hospitals: { id: string; name: unknown }[];
  categories?: { id: string; name: unknown }[];
  locale: string;
  defaultServiceId?: string;
  defaultHospitalId?: string;
}

export function InquiryForm({
  profile,
  services,
  hospitals,
  categories,
  locale,
  defaultServiceId,
  defaultHospitalId,
}: InquiryFormProps) {
  const t = useTranslations("inquiry");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: profile?.full_name ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      nationality: profile?.nationality ?? "",
      serviceId: defaultServiceId ?? "",
      hospitalId: defaultHospitalId ?? "",
      message: "",
    },
  });

  const onSubmit = async (data: InquiryInput) => {
    setIsPending(true);
    setServerError(null);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        setServerError(body.error || "Something went wrong");
        setIsPending(false);
        return;
      }

      router.push("/inquiry/success");
    } catch {
      setServerError("Network error");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            {t("name")} *
          </label>
          <Input
            id="name"
            placeholder={t("namePlaceholder")}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            {t("email")} *
          </label>
          <Input
            id="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            {t("phone")}
          </label>
          <Input
            id="phone"
            placeholder={t("phonePlaceholder")}
            {...register("phone")}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="nationality" className="text-sm font-medium">
            {t("nationality")}
          </label>
          <Input
            id="nationality"
            placeholder={t("nationalityPlaceholder")}
            {...register("nationality")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="serviceId" className="text-sm font-medium">
            {t("service")}
          </label>
          <select
            id="serviceId"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register("serviceId")}
          >
            <option value="">{t("servicePlaceholder")}</option>
            {categories && categories.length > 0
              ? categories.map((cat) => {
                  const catServices = services.filter((s) => s.category_id === cat.id);
                  if (catServices.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={getLocalizedName(cat.name, locale)}>
                      {catServices.map((s) => (
                        <option key={s.id} value={s.id}>
                          {getLocalizedName(s.name, locale)}
                        </option>
                      ))}
                    </optgroup>
                  );
                })
              : services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {getLocalizedName(s.name, locale)}
                  </option>
                ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="hospitalId" className="text-sm font-medium">
            {t("hospital")}
          </label>
          <select
            id="hospitalId"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register("hospitalId")}
          >
            <option value="">{t("hospitalPlaceholder")}</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {getLocalizedName(h.name, locale)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          {t("message")} *
        </label>
        <textarea
          id="message"
          rows={5}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder={t("messagePlaceholder")}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="consent"
          className="mt-1"
          {...register("consent")}
        />
        <label htmlFor="consent" className="text-sm text-muted-foreground">
          {t("consent")}
        </label>
      </div>
      {errors.consent && (
        <p className="text-xs text-destructive">{errors.consent.message}</p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
