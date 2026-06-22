import { redirect } from "next/navigation";
import { getLocale, setRequestLocale } from "next-intl/server";
import { getUser, getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { MyPageContent } from "@/components/my/MyPageContent";

interface MyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MyPage({ params }: MyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const profile = await getProfile();
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, hospitals(name), services(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, hospitals(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <MyPageContent
      profile={profile}
      inquiries={inquiries ?? []}
      reviews={reviews ?? []}
      locale={locale}
    />
  );
}
