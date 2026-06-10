import type { FestivalDate } from "../types/schedule";
import { festivalDates } from "../types/schedule";

const labels: Record<FestivalDate, string> = {
  "2026-07-03": "7/3 (金)",
  "2026-07-04": "7/4 (土)",
  "2026-07-05": "7/5 (日)",
};

export function DateTabs({ selected, onSelect }: { selected: FestivalDate; onSelect: (date: FestivalDate) => void }) {
  return (
    <nav className="date-tabs" aria-label="開催日">
      {festivalDates.map((date) => (
        <button key={date} className={selected === date ? "active" : ""} onClick={() => onSelect(date)}>
          <span>{labels[date]}</span>
          {date !== "2026-07-03" && <small>本祭</small>}
        </button>
      ))}
    </nav>
  );
}
