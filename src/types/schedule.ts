export const festivalDates = ["2026-07-03", "2026-07-04", "2026-07-05"] as const;

export type FestivalDate = (typeof festivalDates)[number];
export type EventType = "classroom_performance" | "stage_event" | "break" | "notice";
export type EventStatus = "pending" | "current" | "done" | "skipped" | "cancelled";

export type ScheduleItem = {
  id: string;
  date: FestivalDate;
  type: EventType;
  plannedStart: string;
  plannedEnd?: string;
  durationMinutes: number;
  title: string;
  performer?: string;
  programTitle?: string;
  location?: string;
  url?: string;
  colorKey?: string;
  memo?: string;
  stageBlocksClassroom?: boolean;
};

export type ItemRuntimeState = {
  status?: EventStatus;
  actualStart?: string;
  actualEnd?: string;
  manualOffsetMinutes?: number;
  adjustedDurationMinutes?: number;
  memo?: string;
  skippedCompressMode?: "compress" | "keep_gap";
};

export type RuntimeState = {
  globalOffsetMinutes: number;
  itemStates: Record<string, ItemRuntimeState>;
  revision: number;
  updatedAt?: string;
  updatedBy?: string;
};
