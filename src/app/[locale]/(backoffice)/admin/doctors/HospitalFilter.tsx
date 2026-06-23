"use client";

import { useRouter, usePathname } from "next/navigation";

interface Props {
  hospitals: { id: string; name: string }[];
  current: string;
  label: string;
}

export default function HospitalFilter({ hospitals, current, label }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    const url = val ? `${pathname}?hospital=${val}` : pathname;
    router.push(url);
  }

  return (
    <select
      defaultValue={current}
      onChange={handleChange}
      className="rounded-md border bg-background px-3 py-2 text-sm"
    >
      <option value="">{label}</option>
      {hospitals.map((h) => (
        <option key={h.id} value={h.id}>{h.name}</option>
      ))}
    </select>
  );
}
