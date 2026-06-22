"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deactivateAccount } from "@/lib/actions/admin-accounts";
import { useRouter } from "next/navigation";
import type { AccountRow, HospitalOption } from "./page";
import type { Json } from "@/lib/types/database";

interface Props {
  initialAccounts: AccountRow[];
  hospitals: HospitalOption[];
}

function getEn(val: Json | null | undefined): string {
  if (!val) return "";
  if (typeof val === "object" && !Array.isArray(val)) {
    return ((val as Record<string, unknown>).en as string) || "";
  }
  return String(val);
}

export function AccountsClient({ initialAccounts, hospitals }: Props) {
  const t = useTranslations("admin.accounts");
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const fd = new FormData(e.currentTarget);
    const body = {
      email: fd.get("email"),
      password: fd.get("password"),
      full_name: fd.get("full_name"),
      hospital_id: fd.get("hospital_id") || null,
    };
    const res = await fetch("/api/admin/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setFormSuccess(true);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } else {
      const { error } = await res.json();
      setFormError(error ?? t("createError"));
    }
  }

  function handleDeactivate(userId: string) {
    if (!confirm(t("confirmDeactivate"))) return;
    startTransition(async () => {
      await deactivateAccount(userId);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      {/* Account list */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">{t("colEmail")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colName")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colHospital")}</th>
              <th className="text-left px-4 py-3 font-medium">{t("colDate")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {initialAccounts.length > 0 ? initialAccounts.map((acc) => (
              <tr key={acc.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">{acc.email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{acc.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {acc.hospitals ? getEn(acc.hospitals.name) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {acc.created_at ? new Date(acc.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={isPending}
                    onClick={() => handleDeactivate(acc.id)}
                    className="text-destructive text-xs hover:underline disabled:opacity-50"
                  >
                    {t("deactivate")}
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  {t("noAccounts")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create account form */}
      <div className="rounded-lg border p-4 max-w-lg space-y-4">
        <h2 className="text-lg font-semibold">{t("createTitle")}</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldEmail")}</label>
            <input name="email" type="email" required className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldPassword")}</label>
            <input name="password" type="password" required minLength={8} className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldFullName")}</label>
            <input name="full_name" type="text" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">{t("fieldHospital")}</label>
            <select name="hospital_id" className="w-full rounded-md border bg-background px-3 py-2 text-sm">
              <option value="">{t("noHospital")}</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{getEn(h.name)}</option>
              ))}
            </select>
          </div>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          {formSuccess && <p className="text-sm text-green-600">{t("createSuccess")}</p>}
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("create")}
          </button>
        </form>
      </div>
    </div>
  );
}
