import type { ItemRuntimeState, ScheduleItem } from "../types/schedule";
import { addMinutes, timeToMinutes } from "./time";

export function getAdjustedDuration(item: ScheduleItem, state?: ItemRuntimeState): number {
  return state?.adjustedDurationMinutes ?? item.durationMinutes;
}

export function getAdjustedStart(item: ScheduleItem, globalOffset: number, state?: ItemRuntimeState): string {
  return addMinutes(item.plannedStart, globalOffset + (state?.manualOffsetMinutes ?? 0));
}

export function getAdjustedEnd(item: ScheduleItem, globalOffset: number, state?: ItemRuntimeState): string {
  return addMinutes(getAdjustedStart(item, globalOffset, state), getAdjustedDuration(item, state));
}

export function isItemCurrent(item: ScheduleItem, globalOffset: number, nowTime: string, state?: ItemRuntimeState): boolean {
  if (state?.status === "current") return true;
  if (["done", "skipped", "cancelled"].includes(state?.status ?? "")) return false;
  const now = timeToMinutes(nowTime);
  const start = timeToMinutes(getAdjustedStart(item, globalOffset, state));
  const end = timeToMinutes(getAdjustedEnd(item, globalOffset, state));
  return now >= start && now < end;
}

export function formatOffset(minutes: number): string {
  if (minutes === 0) return "定刻";
  return minutes > 0 ? `+${minutes}分遅れ` : `${Math.abs(minutes)}分巻き`;
}
