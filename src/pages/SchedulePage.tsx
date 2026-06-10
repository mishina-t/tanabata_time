import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CurrentClock } from "../components/CurrentClock";
import { DayTimeline } from "../components/DayTimeline";
import { DateTabs } from "../components/DateTabs";
import { EventCard } from "../components/EventCard";
import { OffsetControl } from "../components/OffsetControl";
import { OperatorBar } from "../components/OperatorBar";
import { RunOverview } from "../components/RunOverview";
import { scheduleItems } from "../data/schedule";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useOperatorAccess } from "../hooks/useOperatorAccess";
import { useRuntimeState } from "../hooks/useRuntimeState";
import { festivalDates, type FestivalDate } from "../types/schedule";
import { getAdjustedDuration, isItemCurrent } from "../utils/schedule";
import { getCurrentTimeValue } from "../utils/time";

function isFestivalDate(value: string | null): value is FestivalDate {
  return festivalDates.includes(value as FestivalDate);
}

export function SchedulePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const operatorAccess = useOperatorAccess();
  const { runtime, setGlobalOffset, updateItem, reset, sharedMode, syncStatus, syncMessage } = useRuntimeState(operatorAccess.operatorCode);
  const online = useNetworkStatus();
  const now = useCurrentTime();
  const queryDate = searchParams.get("date");
  const selectedDate = isFestivalDate(queryDate) ? queryDate : "2026-07-04";

  useEffect(() => {
    if (!isFestivalDate(queryDate)) setSearchParams({ date: selectedDate }, { replace: true });
  }, [queryDate, selectedDate, setSearchParams]);

  const items = useMemo(
    () => scheduleItems.filter((item) => item.date === selectedDate),
    [selectedDate],
  );
  const today = now.toLocaleDateString("sv-SE");
  const nowTime = getCurrentTimeValue(now);
  const select = (date: FestivalDate) => {
    setSearchParams({ date });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const timelineItems = useMemo(() => {
    return items.reduce<{
      entries: Array<{ item: (typeof items)[number]; state: (typeof runtime.itemStates)[string]; effectiveOffset: number }>;
      durationOffset: number;
    }>((result, item) => {
      const state = runtime.itemStates[item.id];
      const entry = {
        item,
        state,
        effectiveOffset: runtime.globalOffsetMinutes + result.durationOffset,
      };
      return {
        entries: [...result.entries, entry],
        durationOffset: result.durationOffset + getAdjustedDuration(item, state) - item.durationMinutes,
      };
    }, { entries: [], durationOffset: 0 }).entries;
  }, [items, runtime]);
  const isSelectedToday = today === selectedDate;
  const activeTimelineItem = timelineItems.find(({ item, state, effectiveOffset }) =>
    (isSelectedToday || state?.status === "current") && isItemCurrent(item, effectiveOffset, nowTime, state),
  );
  const activeIndex = activeTimelineItem ? timelineItems.findIndex(({ item }) => item.id === activeTimelineItem.item.id) : -1;
  const nextTimelineItem = activeIndex >= 0
    ? timelineItems[activeIndex + 1]
    : timelineItems.find(({ state }) => !["done", "skipped", "cancelled"].includes(state?.status ?? ""));
  const canEdit = Boolean(operatorAccess.operator) && online && (!sharedMode || syncStatus === "connected");

  return (
    <main className="schedule-page">
      <header className="schedule-header">
        <Link to="/" className="back-link">← ホーム</Link>
        <div><p className="eyebrow">RAKUGO TIMETABLE</p><h1>七夕落研</h1></div>
        <CurrentClock now={now} />
      </header>
      <div className="schedule-content">
        <div className="sticky-schedule-tools">
          <DateTabs selected={selectedDate} onSelect={select} />
          <DayTimeline
            entries={timelineItems}
            nowTime={nowTime}
            isToday={isSelectedToday}
            activeItemId={activeTimelineItem?.item.id}
          />
        </div>
        <OperatorBar
          runtime={runtime}
          online={online}
          sharedMode={sharedMode}
          syncStatus={syncStatus}
          syncMessage={syncMessage}
          operatorName={operatorAccess.operator?.name}
          checking={operatorAccess.checking}
          onLogin={() => void operatorAccess.login()}
          onLogout={operatorAccess.logout}
        />
        <RunOverview current={activeTimelineItem} next={nextTimelineItem} />
        <OffsetControl
          value={runtime.globalOffsetMinutes}
          disabled={!canEdit}
          onChange={(value) => setGlobalOffset(value, operatorAccess.operator?.name ?? "不明")}
        />
        <section className="timeline" aria-label={`${selectedDate}の予定`}>
          <div className="timeline-heading">
            <div><p className="eyebrow">TIMETABLE</p><h2>{selectedDate.replace("2026-", "").replace("-", "/")} の予定</h2></div>
            <span>{items.length} events</span>
          </div>
          {timelineItems.map(({ item, state, effectiveOffset }) => (
            <EventCard
              key={item.id}
              item={item}
              state={state}
              globalOffset={effectiveOffset}
              highlighted={item.id === activeTimelineItem?.item.id}
              editable={canEdit}
              onUpdate={(patch) => {
                if (
                  patch.status === "current"
                  && activeTimelineItem
                  && activeTimelineItem.item.id !== item.id
                  && !window.confirm(`現在進行中の「${activeTimelineItem.item.title}」を終了し、この枠を開始しますか？`)
                ) return;
                updateItem(item.id, patch, operatorAccess.operator?.name ?? "不明");
              }}
            />
          ))}
        </section>
        <button disabled={!canEdit} className="danger-link" onClick={() => window.confirm("当日の進行状態をすべてリセットしますか？") && reset(operatorAccess.operator?.name ?? "不明")}>保存した進行状態をリセット</button>
      </div>
    </main>
  );
}
