import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LoginPageContent />;
}

function LoginPageContent() {
  const t = useTranslations("auth");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("loginSubtitle")}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <LoginForm />
          <div className="mt-6">
            <OAuthButtons />
          </div>
        </div>
      </div>
    </div>
  );
}
