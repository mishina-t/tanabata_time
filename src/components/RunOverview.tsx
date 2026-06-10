import type { ItemRuntimeState, ScheduleItem } from "../types/schedule";
import { getAdjustedStart } from "../utils/schedule";

type Entry = {
  item: ScheduleItem;
  state?: ItemRuntimeState;
  effectiveOffset: number;
};

function EventSummary({ label, entry }: { label: string; entry?: Entry }) {
  return (
    <div className="run-summary-item">
      <span>{label}</span>
      {entry ? (
        <div>
          <strong>{getAdjustedStart(entry.item, entry.effectiveOffset, entry.state)} {entry.item.title}</strong>
          <small>{entry.item.performer ?? entry.item.location ?? "詳細未定"}</small>
        </div>
      ) : (
        <strong className="run-empty">該当なし</strong>
      )}
    </div>
  );
}

export function RunOverview({ current, next }: { current?: Entry; next?: Entry }) {
  return (
    <section className={`run-overview ${current?.item.type === "stage_event" ? "stage-running" : ""}`} aria-label="現在と次の予定">
      <EventSummary label="現在" entry={current} />
      <EventSummary label="次" entry={next} />
    </section>
  );
}
