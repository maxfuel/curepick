export function getLocalizedField(
  field: unknown,
  locale: string,
  fallback?: string
): string {
  const map = field as Record<string, string> | null;
  return map?.[locale] || map?.en || fallback || "";
}
