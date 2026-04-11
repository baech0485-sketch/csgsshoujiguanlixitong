function normalizePart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((item) => item.type === type)?.value ?? "";
}

export function formatBeijingDateTime(value: string | Date | null | undefined) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const year = normalizePart(parts, "year");
  const month = normalizePart(parts, "month");
  const day = normalizePart(parts, "day");
  const hour = normalizePart(parts, "hour");
  const minute = normalizePart(parts, "minute");

  return `${year}-${month}-${day} ${hour}:${minute}`;
}
