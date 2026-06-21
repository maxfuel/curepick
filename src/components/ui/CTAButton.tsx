"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface CTAButtonProps {
  serviceId?: string;
  hospitalId?: string;
  procedureId?: string;
  variant?: "default" | "large";
  className?: string;
}

export function CTAButton({
  serviceId,
  hospitalId,
  procedureId,
  variant = "default",
  className,
}: CTAButtonProps) {
  const t = useTranslations("cta");

  const params = new URLSearchParams();
  if (serviceId) params.set("service", serviceId);
  if (hospitalId) params.set("hospital", hospitalId);
  if (procedureId) params.set("procedure", procedureId);

  const queryString = params.toString();
  const href = `/inquiry${queryString ? `?${queryString}` : ""}`;

  return (
    <Button
      size={variant === "large" ? "lg" : "default"}
      className={`bg-[#dc5000] text-white hover:bg-[#dc5000]/90 ${className ?? ""}`}
      render={<Link href={href} />}
    >
      {t("getConsultation")}
    </Button>
  );
}
