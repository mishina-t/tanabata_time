import type { ItemRuntimeState, ScheduleItem } from "../types/schedule";
import { getAdjustedDuration, getAdjustedEnd, getAdjustedStart } from "../utils/schedule";
import { festivalTimeToTimestamp, formatTimestamp, formatTimestampForInput, getTimestamp } from "../utils/time";

const typeLabels = {
  classroom_performance: "教室寄席",
  stage_event: "ステージ企画",
  break: "休憩・調整",
  notice: "お知らせ",
} as const;

const statusLabels = {
  pending: "未開始",
  current: "進行中",
  done: "終了",
  skipped: "スキップ",
  cancelled: "中止",
} as const;

type Props = {
  item: ScheduleItem;
  state?: ItemRuntimeState;
  globalOffset: number;
  highlighted: boolean;
  editable: boolean;
  onUpdate: (patch: Partial<ItemRuntimeState>) => void;
};

export function EventCard({ item, state, globalOffset, highlighted, editable, onUpdate }: Props) {
  const adjustedStart = getAdjustedStart(item, globalOffset, state);
  const adjustedEnd = getAdjustedEnd(item, globalOffset, state);
  const duration = getAdjustedDuration(item, state);
  const status = state?.status ?? "pending";
  const typeClass = item.type.replace("_performance", "").replace("_event", "");
  const actualStart = formatTimestamp(state?.actualStart);
  const actualEnd = formatTimestamp(state?.actualEnd);

  return (
    <article id={`event-${item.id}`} className={`event-card type-${typeClass} ${highlighted ? "is-current" : ""}`}>
      <div className="event-time">
        <span>{item.plannedStart}</span>
        <strong>{adjustedStart}</strong>
        <small>〜 {adjustedEnd}</small>
      </div>
      <div className="event-body">
        <div className="event-labels">
          <span className="type-label">{typeLabels[item.type]}</span>
          <span className={`status status-${status}`}>{statusLabels[status]}</span>
          {highlighted && <span className="now-label">NOW</span>}
        </div>
        <h3>{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.title}</a> : item.title}</h3>
        {(item.performer || item.programTitle) && (
          <div className="performance-details">
            <p><span>出演</span>{item.performer ?? "未定"}</p>
            <p><span>演目</span>{item.programTitle ?? "未定"}</p>
          </div>
        )}
        <div className="meta-row">
          {item.location && <span>会場: {item.location}</span>}
          <span>持ち時間: {duration}分</span>
        </div>
        {(actualStart || actualEnd) && (
          <div className="actual-times">
            {actualStart && <span>実績開始 <strong>{actualStart}</strong></span>}
            {actualEnd && <span>実績終了 <strong>{actualEnd}</strong></span>}
          </div>
        )}
        {item.stageBlocksClassroom && <p className="stage-notice">この時間帯はステージ企画のため、教室寄席は休止します</p>}
        {item.memo && <p className="preset-memo">{item.memo}</p>}
        {item.type !== "notice" && (
          <>
            <div className="button-row action-row">
              <button disabled={!editable} className="button-start" onClick={() => onUpdate({ status: "current", actualStart: getTimestamp() })}>開始</button>
              <button disabled={!editable} className="button-done" onClick={() => onUpdate({ status: "done", actualEnd: getTimestamp() })}>終了</button>
              <button
                disabled={!editable}
                className="button-subtle"
                onClick={() => onUpdate({ status: status === "skipped" ? "pending" : "skipped" })}
              >
                {status === "skipped" ? "スキップ取消" : "スキップ"}
              </button>
            </div>
            <div className="duration-control">
              <span>持ち時間調整</span>
              <div className="button-row compact">
                <button disabled={!editable} onClick={() => onUpdate({ adjustedDurationMinutes: Math.max(1, duration - 5) })}>-5</button>
                <button disabled={!editable} onClick={() => onUpdate({ adjustedDurationMinutes: Math.max(1, duration - 1) })}>-1</button>
                <button disabled={!editable} onClick={() => onUpdate({ adjustedDurationMinutes: duration + 1 })}>+1</button>
                <button disabled={!editable} onClick={() => onUpdate({ adjustedDurationMinutes: duration + 5 })}>+5</button>
              </div>
            </div>
            <label className="memo-field">
              <span>当日メモ</span>
              <textarea
                key={state?.memo ?? ""}
                disabled={!editable}
                defaultValue={state?.memo ?? ""}
                onBlur={(event) => {
                  if (event.target.value !== (state?.memo ?? "")) onUpdate({ memo: event.target.value });
                }}
                placeholder="集合・進行メモなど"
                rows={2}
              />
            </label>
            <details className="correction-panel">
              <summary>記録を修正</summary>
              <div className="correction-grid">
                <label>
                  <span>状態</span>
                  <select
                    disabled={!editable}
                    value={status === "current" ? "current" : status}
                    onChange={(event) => onUpdate({ status: event.target.value as Exclude<typeof status, "current"> })}
                  >
                    {status === "current" && <option value="current">進行中</option>}
                    <option value="pending">未開始</option>
                    <option value="done">終了</option>
                    <option value="skipped">スキップ</option>
                    <option value="cancelled">中止</option>
                  </select>
                </label>
                <label>
                  <span>実績開始</span>
                  <input
                    key={`start-${state?.actualStart ?? ""}`}
                    disabled={!editable}
                    type="time"
                    defaultValue={formatTimestampForInput(state?.actualStart)}
                    onBlur={(event) => event.target.value && onUpdate({ actualStart: festivalTimeToTimestamp(item.date, event.target.value) })}
                  />
                </label>
                <label>
                  <span>実績終了</span>
                  <input
                    key={`end-${state?.actualEnd ?? ""}`}
                    disabled={!editable}
                    type="time"
                    defaultValue={formatTimestampForInput(state?.actualEnd)}
                    onBlur={(event) => event.target.value && onUpdate({ actualEnd: festivalTimeToTimestamp(item.date, event.target.value) })}
                  />
                </label>
              </div>
            </details>
          </>
        )}
      </div>
    </article>
  );
}
