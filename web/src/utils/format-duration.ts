export function formatDuration(seconds: number): string {
  const totalSeconds = Math.floor(seconds); // 1717.881995 → 1717
  const h = Math.floor(totalSeconds / 3600); // 0
  const m = Math.floor((totalSeconds % 3600) / 60); // 28
  const s = totalSeconds % 60; // 37
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
