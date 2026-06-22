import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

interface VerifyEmailPageProps {
  params: Promise<{ locale: string }>;
}

export default async function VerifyEmailPage({
  params,
}: VerifyEmailPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VerifyEmailContent />;
}

function VerifyEmailContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="size-8 text-primary" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">{t("verifyEmailTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("verifyEmailDescription")}
          </p>
        </div>

        <Button variant="outline" render={<Link href="/login" />}>
          {t("backToLogin")}
        </Button>
      </div>
    </div>
  );
}
