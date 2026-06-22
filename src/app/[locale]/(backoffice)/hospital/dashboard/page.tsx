import { getProfile } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HospitalDashboardPage() {
  const profile = await getProfile();
  const supabase = await createClient();
  const t = await getTranslations("hospital.dashboard");

  const hospitalId = profile!.hospital_id;

  const [{ data: recentInquiries }, { count: totalCount }, { count: newCount }] =
    await Promise.all([
      supabase
        .from("inquiries")
        .select("id, status, name, created_at")
        .eq("hospital_id", hospitalId!)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("hospital_id", hospitalId!),
      supabase
        .from("inquiries")
        .select("id", { count: "exact", head: true })
        .eq("hospital_id", hospitalId!)
        .eq("status", "new"),
    ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("newInquiries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{newCount ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("totalInquiries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-lg font-semibold mb-4">{t("recentInquiries")}</h2>
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colStatus")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colDate")}</th>
            </tr>
          </thead>
          <tbody>
            {recentInquiries && recentInquiries.length > 0 ? (
              recentInquiries.map((inq) => (
                <tr key={inq.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{inq.name}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        inq.status === "new"
                          ? "default"
                          : inq.status === "contacted"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {inq.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(inq.created_at!).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noInquiries")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
