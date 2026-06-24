interface Props {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CurepickLogo({ showTagline = true, size = "md" }: Props) {
  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const taglineSize =
    size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs" : "text-[10px]";
  const iconSize =
    size === "sm" ? 10 : size === "lg" ? 16 : 13;
  const iconOffset =
    size === "sm" ? "-top-2.5" : size === "lg" ? "-top-4" : "-top-3";

  return (
    <div className="flex flex-col leading-none select-none">
      <div className="flex items-baseline">
        <span className={`${textSize} font-bold tracking-tight`}>Curep</span>
        <span className="relative inline-flex flex-col items-center">
          <span className={`absolute ${iconOffset} left-1/2 -translate-x-1/2`}>
            <MedicalIcon size={iconSize} />
          </span>
          <span className={`${textSize} font-bold tracking-tight`}>i</span>
        </span>
        <span className={`${textSize} font-bold tracking-tight`}>ck</span>
      </div>
      {showTagline && (
        <span
          className={`${taglineSize} font-medium tracking-wide mt-0.5`}
          style={{ color: "#2563eb" }}
        >
          The best S.Korea VIP Medical Tourism Platform
        </span>
      )}
    </div>
  );
}

function MedicalIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="12" fill="#2563eb" />
      <rect x="10" y="5" width="4" height="14" rx="1.5" fill="white" />
      <rect x="5" y="10" width="14" height="4" rx="1.5" fill="white" />
    </svg>
  );
}
