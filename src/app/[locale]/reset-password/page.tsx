"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/lib/auth/actions";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/navigation";

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsPending(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("email", data.email);

    const result = await resetPassword(formData);
    if (result?.error) {
      setServerError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    setIsPending(false);
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-2xl font-bold">{t("resetEmailSentTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("resetEmailSentDescription")}
          </p>
          <Button variant="outline" render={<Link href="/login" />} nativeButton={false}>
            {t("backToLogin")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("resetPasswordTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("resetPasswordSubtitle")}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t("email")}
              </label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? t("sending") : t("sendResetLink")}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                {t("backToLogin")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
