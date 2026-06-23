"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  hospitals: { id: string; name: string }[];
  services: { id: string; name: string }[];
  currentHospital: string;
  currentService: string;
  labelAllHospitals: string;
  labelAllServices: string;
}

export default function InquiryFilters({
  hospitals,
  services,
  currentHospital,
  currentService,
  labelAllHospitals,
  labelAllServices,
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
        defaultValue={currentService}
        onChange={(e) => navigate("service", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">{labelAllServices}</option>
        {services.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  );
}
