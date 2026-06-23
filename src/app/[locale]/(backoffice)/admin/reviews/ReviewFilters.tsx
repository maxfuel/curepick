"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  hospitals: { id: string; name: string }[];
  currentHospital: string;
  currentRating: string;
  labelAllHospitals: string;
  labelAllRatings: string;
}

export default function ReviewFilters({
  hospitals,
  currentHospital,
  currentRating,
  labelAllHospitals,
  labelAllRatings,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function navigate(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <select
        defaultValue={currentHospital}
        onChange={(e) => navigate("hospital", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">{labelAllHospitals}</option>
        {hospitals.map((h) => (
          <option key={h.id} value={h.id}>{h.name}</option>
        ))}
      </select>

      <select
        defaultValue={currentRating}
        onChange={(e) => navigate("rating", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">{labelAllRatings}</option>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={String(r)}>★ {r}</option>
        ))}
      </select>
    </div>
  );
}
