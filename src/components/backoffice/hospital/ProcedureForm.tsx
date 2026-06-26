"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProcedureOption {
  id: string;
  name: string;
  serviceName: string;
  categoryName: string;
}

interface BulletPoint { ko: string; en: string; }

interface ProcedureFormProps {
  procedures: ProcedureOption[];
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    procedureId: string;
    procedureName: string;
    nameKo: string;
    nameEn: string;
    costMin: string;
    costMax: string;
    costCurrency: string;
    differentiatorSummaryKo: string;
    differentiatorSummaryEn: string;
    bullets: BulletPoint[];
  };
  isEdit?: boolean;
}

export function ProcedureForm({ procedures, action, defaultValues, isEdit }: ProcedureFormProps) {
  const router = useRouter();
  const [bullets, setBullets] = useState<BulletPoint[]>(defaultValues?.bullets ?? []);
  const [isPending, setIsPending] = useState(false);

  const addBullet = () => setBullets((prev) => [...prev, { ko: "", en: "" }]);
  const removeBullet = (i: number) => setBullets((prev) => prev.filter((_, idx) => idx !== i));
  const updateBullet = (i: number, field: "ko" | "en", value: string) =>
    setBullets((prev) => prev.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)));

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    formData.set("differentiator_bullets", JSON.stringify(bullets));
    await action(formData);
    router.push("/hospital/procedures");
  }

  return (
    <form action={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Global procedure selector */}
      {isEdit ? (
        <div className="space-y-1.5">
          <Label>전역 시술</Label>
          <p className="text-sm border rounded-md px-3 py-2 bg-muted/40 text-muted-foreground">
            {defaultValues?.procedureName}
          </p>
          <input type="hidden" name="procedure_id" value={defaultValues?.procedureId} />
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="procedure_id">
            전역 시술 <span className="text-destructive">*</span>
          </Label>
          <select
            name="procedure_id"
            id="procedure_id"
            required
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
          >
            <option value="">-- 시술을 선택하세요 --</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>
                {p.categoryName} › {p.serviceName} › {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom name */}
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="text-sm font-medium px-1">커스텀 이름 (선택)</legend>
        <div className="space-y-1.5">
          <Label htmlFor="name_ko">한국어</Label>
          <Input
            id="name_ko"
            name="name_ko"
            defaultValue={defaultValues?.nameKo}
            placeholder="울쎄라 스페셜 케어"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name_en">영어</Label>
          <Input
            id="name_en"
            name="name_en"
            defaultValue={defaultValues?.nameEn}
            placeholder="Ulthera Special Care"
          />
        </div>
      </fieldset>

      {/* Price */}
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="text-sm font-medium px-1">가격</legend>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cost_min">최솟값</Label>
            <Input
              id="cost_min"
              name="cost_min"
              type="number"
              min="0"
              defaultValue={defaultValues?.costMin}
              placeholder="500000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost_max">최댓값</Label>
            <Input
              id="cost_max"
              name="cost_max"
              type="number"
              min="0"
              defaultValue={defaultValues?.costMax}
              placeholder="800000"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cost_currency">통화</Label>
            <select
              name="cost_currency"
              id="cost_currency"
              defaultValue={defaultValues?.costCurrency ?? "KRW"}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="KRW">KRW</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>
      </fieldset>

      {/* Differentiator summary */}
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="text-sm font-medium px-1">한 줄 차별점 요약 (선택)</legend>
        <div className="space-y-1.5">
          <Label htmlFor="differentiator_summary_ko">한국어</Label>
          <Input
            id="differentiator_summary_ko"
            name="differentiator_summary_ko"
            defaultValue={defaultValues?.differentiatorSummaryKo}
            placeholder="FDA 인증 장비와 전문의 직접 시술"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="differentiator_summary_en">영어</Label>
          <Input
            id="differentiator_summary_en"
            name="differentiator_summary_en"
            defaultValue={defaultValues?.differentiatorSummaryEn}
            placeholder="FDA-certified devices, doctor-performed only"
          />
        </div>
      </fieldset>

      {/* Bullet points */}
      <fieldset className="space-y-3 rounded-lg border p-4">
        <legend className="text-sm font-medium px-1">차별점 불릿 포인트 (선택)</legend>
        {bullets.map((b, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">KO</Label>
              <Input
                value={b.ko}
                onChange={(e) => updateBullet(i, "ko", e.target.value)}
                placeholder="FDA 인증 장비"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">EN</Label>
              <Input
                value={b.en}
                onChange={(e) => updateBullet(i, "en", e.target.value)}
                placeholder="FDA-certified device"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeBullet(i)}
              className="text-destructive hover:text-destructive"
            >
              ✕
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addBullet}>
          + 항목 추가
        </Button>
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : isEdit ? "수정 저장" : "저장"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/hospital/procedures")}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
