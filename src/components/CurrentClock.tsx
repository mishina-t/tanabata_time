import { formatClock } from "../utils/time";

export function CurrentClock({ now }: { now: Date }) {
  return (
    <div className="clock" aria-live="polite">
      <span>現在時刻</span>
      <strong>{formatClock(now)}</strong>
    </div>
  );
}
