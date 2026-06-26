"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface Props {
  hospitals: { id: string; name: string }[];
  services: { id: string; name: string; category_id?: string }[];
  categories?: { id: string; label: string }[];
  currentHospital: string;
  currentService: string;
  currentSource: string;
  labelAllHospitals: string;
  labelAllServices: string;
  labelAllSources: string;
  sourceOptions: Array<{ value: string; label: string }>;
}

export default function InquiryFilters({
  hospitals,
  services,
  categories,
  currentHospital,
  currentService,
  currentSource,
  labelAllHospitals,
  labelAllServices,
  labelAllSources,
  sourceOptions,
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
        defaultValue={currentSource}
        onChange={(e) => navigate("source", e.target.value)}
        className="rounded-md border bg-background px-3 py-1.5 text-sm"
      >
        <option value="">{labelAllSources}</option>
        {sourceOptions.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

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
        {categories && categories.length > 0
          ? categories.map((cat) => {
              const catServices = services.filter((s) => s.category_id === cat.id);
              if (catServices.length === 0) return null;
              return (
                <optgroup key={cat.id} label={cat.label}>
                  {catServices.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              );
            })
          : services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
      </select>
    </div>
  );
}
