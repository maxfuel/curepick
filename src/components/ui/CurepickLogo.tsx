interface Props {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CurepickLogo({ showTagline = true, size = "md" }: Props) {
  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";
  const taglineSize =
    size === "sm" ? "text-[9px]" : size === "lg" ? "text-xs" : "text-[10px]";
  const badgeSize = size === "sm" ? 18 : size === "lg" ? 28 : 22;

  return (
    <div className="flex flex-col leading-none select-none">
      <div className="flex items-start">
        <span
          className={`${textSize} font-bold tracking-tight`}
          style={{ color: "#1c1c1c" }}
        >
          Curepick
        </span>
        <VipBadge size={badgeSize} />
      </div>
      {showTagline && (
        size === "sm" ? (
          <div
            className={`${taglineSize} font-medium tracking-wide mt-0.5 leading-tight`}
            style={{ color: "#2563eb" }}
          >
            <div className="whitespace-nowrap">The best S.Korea VIP</div>
            <div className="whitespace-nowrap">Medical Tourism Platform</div>
          </div>
        ) : (
          <span
            className={`${taglineSize} font-medium tracking-wide mt-0.5`}
            style={{ color: "#2563eb" }}
          >
            The best S.Korea VIP Medical Tourism Platform
          </span>
        )
      )}
    </div>
  );
}

function VipBadge({ size }: { size: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        border: "1.5px solid #888888",
        borderRadius: "50%",
        fontSize: Math.round(size * 0.33),
        fontWeight: 600,
        color: "#666666",
        marginLeft: 4,
        marginTop: -4,
        letterSpacing: "0.05em",
        flexShrink: 0,
      }}
    >
      VIP
    </span>
  );
}
