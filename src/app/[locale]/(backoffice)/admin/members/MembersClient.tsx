"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/lib/actions/admin-members";

type Role = "patient" | "hospital_staff" | "admin" | "local_agent" | "cure_partner";

interface Member {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  hospital_id: string | null;
  created_at: string | null;
  hospitals: { name: unknown } | null;
}

interface Hospital {
  id: string;
  name: unknown;
}

interface MembersClientProps {
  members: Member[];
  hospitals: Hospital[];
  locale: string;
}

const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  hospital_staff: "Hospital Staff",
  admin: "Admin",
  local_agent: "Local Agent",
  cure_partner: "Cure Partner",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/20",
  hospital_staff: "bg-green-500/10 text-green-700 border-green-500/20",
  cure_partner: "bg-purple-500/10 text-purple-700 border-purple-500/20",
  local_agent: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  patient: "bg-muted text-muted-foreground border-border",
};

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: "all", label: "전체" },
  { key: "patient", label: "Patient" },
  { key: "hospital_staff", label: "Hospital Staff" },
  { key: "cure_partner", label: "Cure Partner" },
  { key: "local_agent", label: "Local Agent" },
  { key: "admin", label: "Admin" },
];

const ASSIGNABLE_ROLES: Array<{ value: string; label: string }> = [
  { value: "patient", label: "Patient" },
  { value: "hospital_staff", label: "Hospital Staff" },
  { value: "cure_partner", label: "Cure Partner" },
  { value: "local_agent", label: "Local Agent" },
];

function getLocalizedName(name: unknown, locale: string): string {
  if (!name) return "—";
  if (typeof name === "string") return name;
  const obj = name as Record<string, string>;
  return obj[locale] || obj["en"] || Object.values(obj)[0] || "—";
}

export function MembersClient({ members, hospitals, locale }: MembersClientProps) {
  const [filterRole, setFilterRole] = useState("all");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered =
    filterRole === "all" ? members : members.filter((m) => m.role === filterRole);

  function openEdit(member: Member) {
    setEditingMember(member);
    setSelectedRole(member.role ?? "patient");
    setSelectedHospital(member.hospital_id ?? "");
    setError(null);
  }

  function closeEdit() {
    setEditingMember(null);
    setError(null);
  }

  function handleSave() {
    if (!editingMember) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRole(
          editingMember.id,
          selectedRole as Role,
          selectedRole === "hospital_staff" ? (selectedHospital || null) : null
        );
        closeEdit();
      } catch (e) {
        setError(e instanceof Error ? e.message : "저장 실패");
      }
    });
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterRole(tab.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterRole === tab.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 opacity-60">
                ({members.filter((m) => m.role === tab.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">이름</th>
              <th className="text-left px-4 py-3 font-medium">이메일</th>
              <th className="text-left px-4 py-3 font-medium">역할</th>
              <th className="text-left px-4 py-3 font-medium">소속 병원</th>
              <th className="text-left px-4 py-3 font-medium">가입일</th>
              <th className="text-left px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{m.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{m.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${
                        ROLE_COLORS[m.role ?? "patient"] ?? ROLE_COLORS.patient
                      }`}
                    >
                      {ROLE_LABELS[m.role ?? "patient"] ?? m.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.hospitals ? getLocalizedName(m.hospitals.name, locale) : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleDateString("ko-KR")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {m.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(m)}
                        className="text-xs h-7"
                      >
                        역할 변경
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Role Change Dialog */}
      <Dialog open={!!editingMember} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>역할 변경</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium mb-1">{editingMember.full_name ?? editingMember.email}</p>
                <p className="text-xs text-muted-foreground">{editingMember.email}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">새 역할</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRole === "hospital_staff" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">소속 병원 (선택)</label>
                  <Select
                    value={selectedHospital}
                    onValueChange={setSelectedHospital}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="병원 선택..." />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitals.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {getLocalizedName(h.name, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={isPending}>
              취소
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
