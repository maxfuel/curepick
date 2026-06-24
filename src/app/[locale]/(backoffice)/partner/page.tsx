import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function PartnerRootPage({ params }: Props) {
  const { locale } = await params;
  redirect(`/${locale}/partner/dashboard`);
}
