// utils/date.ts
export function getRelativeTime(dateString: string) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const now = new Date();
  const past = new Date(dateString);
  const diff = (now.getTime() - past.getTime()) / 1000;

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];

  let duration = diff;
  for (const [unitValue, unitName] of units) {
    if (duration < unitValue) {
      return rtf.format(-Math.floor(duration), unitName);
    }
    duration /= unitValue;
  }
  return rtf.format(-Math.floor(duration), "year");
}
