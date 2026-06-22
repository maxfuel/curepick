"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { updateProfile } from "@/lib/actions/profile";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tables } from "@/lib/types/database";

interface ProfileFormProps {
  profile: Tables<"profiles"> | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const t = useTranslations("myPage");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      nationality: profile?.nationality ?? "",
    },
  });

  const onSubmit = async (data: ProfileInput) => {
    setIsPending(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("fullName", data.fullName);
    if (data.phone) formData.append("phone", data.phone);
    if (data.nationality) formData.append("nationality", data.nationality);

    const result = await updateProfile(formData);
    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage(t("profileUpdated"));
    }
    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md space-y-4">
      {message && (
        <div className="rounded-lg bg-muted p-3 text-sm">{message}</div>
      )}

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium">
          {t("fullName")}
        </label>
        <Input
          id="fullName"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          {t("phone")}
        </label>
        <Input id="phone" {...register("phone")} />
      </div>

      <div className="space-y-2">
        <label htmlFor="nationality" className="text-sm font-medium">
          {t("nationality")}
        </label>
        <Input id="nationality" {...register("nationality")} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? t("saving") : t("saveProfile")}
      </Button>
    </form>
  );
}
