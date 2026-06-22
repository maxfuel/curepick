interface PriceRangeProps {
  costMin: number | null;
  costMax: number | null;
  currency: string | null;
  locale?: string;
}

const currencyLocaleMap: Record<string, string> = {
  USD: "en-US",
  KRW: "ko-KR",
  JPY: "ja-JP",
  CNY: "zh-CN",
  EUR: "de-DE",
};

export function PriceRange({
  costMin,
  costMax,
  currency,
  locale,
}: PriceRangeProps) {
  if (costMin == null && costMax == null) return null;

  const cur = currency || "USD";
  const fmtLocale = locale || currencyLocaleMap[cur] || "en-US";

  const formatter = new Intl.NumberFormat(fmtLocale, {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  });

  if (costMin != null && costMax != null) {
    return (
      <span className="font-semibold text-foreground">
        {formatter.format(costMin)} - {formatter.format(costMax)}
      </span>
    );
  }

  const value = costMin ?? costMax;
  return (
    <span className="font-semibold text-foreground">
      {formatter.format(value!)}
    </span>
  );
}
