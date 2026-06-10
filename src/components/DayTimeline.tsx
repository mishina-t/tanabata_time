import type { ItemRuntimeState, ScheduleItem } from "../types/schedule";
import { getAdjustedEnd, getAdjustedStart } from "../utils/schedule";
import { timeToMinutes } from "../utils/time";

type TimelineEntry = {
  item: ScheduleItem;
  state?: ItemRuntimeState;
  effectiveOffset: number;
};

type Props = {
  entries: TimelineEntry[];
  nowTime: string;
  isToday: boolean;
  activeItemId?: string;
};

const typeLabels: Record<ScheduleItem["type"], string> = {
  classroom_performance: "寄席",
  stage_event: "ステージ",
  break: "休憩",
  notice: "案内",
};

export function DayTimeline({ entries, nowTime, isToday, activeItemId }: Props) {
  if (entries.length === 0) return null;

  const positioned = entries.map((entry) => ({
    ...entry,
    start: timeToMinutes(getAdjustedStart(entry.item, entry.effectiveOffset, entry.state)),
    end: timeToMinutes(getAdjustedEnd(entry.item, entry.effectiveOffset, entry.state)),
    itemIds: [entry.item.id],
  }));
  const displayBlocks = positioned.reduce<typeof positioned>((blocks, entry) => {
    const previous = blocks.at(-1);
    if (
      previous?.item.type === "classroom_performance"
      && entry.item.type === "classroom_performance"
      && previous.end === entry.start
    ) {
      return [
        ...blocks.slice(0, -1),
        { ...previous, end: entry.end, itemIds: [...previous.itemIds, entry.item.id] },
      ];
    }
    return [...blocks, entry];
  }, []);
  const rangeStart = Math.floor(Math.min(...positioned.map((entry) => entry.start)) / 60) * 60;
  const rangeEnd = Math.ceil(Math.max(...positioned.map((entry) => entry.end)) / 60) * 60;
  const range = Math.max(60, rangeEnd - rangeStart);
  const activeEntry = positioned.find((entry) => entry.item.id === activeItemId);
  const isStageActive = activeEntry?.item.type === "stage_event";
  const currentMinutes = timeToMinutes(nowTime);
  const showNowMarker = isToday && currentMinutes >= rangeStart && currentMinutes <= rangeEnd;
  const halfHourTicks = Array.from({ length: Math.floor(range / 30) + 1 }, (_, index) => rangeStart + index * 30);

  const scrollToItem = (itemId: string) => {
    document.getElementById(`event-${itemId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section className={`day-overview ${isStageActive ? "stage-active" : ""}`} aria-label="1日のタイムバー">
      <div className="day-overview-header">
        <strong>{isStageActive ? "ステージ企画中" : activeEntry ? `進行中: ${activeEntry.item.title}` : "1日の進行"}</strong>
        <span>{isToday ? `現在 ${nowTime}` : "予定時刻"}</span>
      </div>
      <div className="day-scale" aria-hidden="true">
        {halfHourTicks.map((tick) => {
          const isHour = tick % 60 === 0;
          return (
            <span
              key={tick}
              className={`scale-line ${isHour ? "scale-line-hour" : "scale-line-half"}`}
              style={{ left: `${((tick - rangeStart) / range) * 100}%` }}
            >
              {isHour && <small>{String(Math.floor(tick / 60)).padStart(2, "0")}:00</small>}
            </span>
          );
        })}
      </div>
      <div className="day-track" aria-label="30分間隔のタイムライン">
        {halfHourTicks.map((tick) => (
          <span
            key={`grid-${tick}`}
            className={`track-grid-line ${tick % 60 === 0 ? "major" : "minor"}`}
            style={{ left: `${((tick - rangeStart) / range) * 100}%` }}
          />
        ))}
        {displayBlocks.map((entry) => (
            <button
              key={entry.item.id}
              className={`day-block day-block-${entry.item.type} ${activeItemId && entry.itemIds.includes(activeItemId) ? "active" : ""}`}
              style={{
                left: `${((entry.start - rangeStart) / range) * 100}%`,
                width: `${Math.max(1.4, ((entry.end - entry.start) / range) * 100)}%`,
              }}
              aria-label={`${getAdjustedStart(entry.item, entry.effectiveOffset, entry.state)} ${entry.item.title}`}
              title={`${getAdjustedStart(entry.item, entry.effectiveOffset, entry.state)} ${entry.item.title}`}
              onClick={() => scrollToItem(entry.item.id)}
            >
              <span>{typeLabels[entry.item.type]}</span>
            </button>
          ))}
        {showNowMarker && <span className="now-marker" style={{ left: `${((currentMinutes - rangeStart) / range) * 100}%` }} />}
      </div>
      <div className="day-legend">
        <span><i className="legend-classroom" />教室寄席</span>
        <span><i className="legend-stage" />ステージ</span>
        <span><i className="legend-break" />休憩</span>
      </div>
    </section>
  );
}
