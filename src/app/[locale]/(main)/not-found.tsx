import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "errors" });

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">{t("notFound.title")}</h1>
      <p className="max-w-md text-muted-foreground">{t("notFound.message")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
