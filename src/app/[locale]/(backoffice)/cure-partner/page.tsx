import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function CurePartnerRootPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/cure-partner/dashboard`);
}
