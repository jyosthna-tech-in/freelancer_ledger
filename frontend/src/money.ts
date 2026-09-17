export function formatAmountMinor(amountMinor: number): string {
  const sign = amountMinor < 0 ? "-" : "";
  const absolute = Math.abs(amountMinor);
  const major = Math.trunc(absolute / 100);
  const minor = absolute % 100;
  return `${sign}$${major}.${minor.toString().padStart(2, "0")}`;
}
