import type { FestivalDate, ScheduleItem } from "../types/schedule";

type PerformanceSeed = {
  start: string;
  duration?: number;
  performerNumber: number;
  memo?: string;
};

function performances(date: FestivalDate, seeds: PerformanceSeed[]): ScheduleItem[] {
  return seeds.map(({ start, duration = 15, performerNumber, memo }, index) => ({
    id: `${date.replaceAll("-", "")}-classroom-${String(index + 1).padStart(2, "0")}`,
    date,
    type: "classroom_performance",
    plannedStart: start,
    durationMinutes: duration,
    title: "教室寄席",
    performer: `出演者未定${performerNumber}`,
    programTitle: "演目未定",
    location: "落研教室",
    memo,
  }));
}

const july4Performances = performances("2026-07-04", [
  { start: "11:00", performerNumber: 1 },
  { start: "11:15", performerNumber: 2 },
  { start: "11:30", performerNumber: 3 },
  { start: "11:45", performerNumber: 4 },
  { start: "12:00", performerNumber: 5 },
  { start: "12:15", performerNumber: 6 },
  { start: "12:30", performerNumber: 7 },
  { start: "12:45", performerNumber: 8 },
  { start: "13:00", performerNumber: 9 },
  { start: "13:30", performerNumber: 10 },
  { start: "13:45", performerNumber: 11 },
  { start: "14:00", performerNumber: 12 },
  { start: "14:15", performerNumber: 13 },
  { start: "14:30", duration: 30, performerNumber: 14 },
]);

const july5Performances = performances("2026-07-05", [
  { start: "11:30", performerNumber: 1 },
  { start: "11:45", performerNumber: 2 },
  { start: "12:00", performerNumber: 3 },
  { start: "12:15", performerNumber: 4 },
  { start: "12:30", performerNumber: 5 },
  { start: "12:45", performerNumber: 6 },
  { start: "13:00", performerNumber: 7 },
  { start: "13:15", performerNumber: 8 },
  { start: "13:30", performerNumber: 9 },
  { start: "15:00", performerNumber: 10 },
  { start: "15:15", performerNumber: 11 },
  { start: "15:30", performerNumber: 12 },
  { start: "15:45", performerNumber: 13 },
  { start: "16:00", performerNumber: 14 },
  { start: "16:15", performerNumber: 15 },
  { start: "16:30", performerNumber: 16 },
  { start: "16:45", performerNumber: 17 },
  { start: "17:00", performerNumber: 18 },
  { start: "17:15", performerNumber: 19 },
  { start: "17:30", performerNumber: 20 },
  { start: "17:45", performerNumber: 21 },
]);

export const scheduleItems: ScheduleItem[] = [
  {
    id: "0703-preparation",
    date: "2026-07-03",
    type: "notice",
    plannedStart: "13:00",
    durationMinutes: 240,
    title: "前日準備",
    location: "落研教室",
    memo: "教室設営・機材確認など。詳細な進行表はありません。",
  },

  {
    id: "0704-stage-001",
    date: "2026-07-04",
    type: "stage_event",
    plannedStart: "10:00",
    durationMinutes: 45,
    title: "ステージ企画",
    location: "ステージ",
    colorKey: "stage",
    stageBlocksClassroom: true,
    memo: "終了後、教室寄席の準備を行います。",
  },
  {
    id: "0704-transition-001",
    date: "2026-07-04",
    type: "break",
    plannedStart: "10:45",
    durationMinutes: 15,
    title: "教室準備・移動",
    location: "落研教室",
  },
  ...july4Performances.slice(0, 9),
  {
    id: "0704-break-001",
    date: "2026-07-04",
    type: "break",
    plannedStart: "13:15",
    durationMinutes: 15,
    title: "仲入り",
    location: "落研教室",
    memo: "進行に応じて短縮・延長できます。",
  },
  ...july4Performances.slice(9),

  ...july5Performances.slice(0, 9),
  {
    id: "0705-transition-001",
    date: "2026-07-05",
    type: "break",
    plannedStart: "13:45",
    durationMinutes: 20,
    title: "仲入り・ステージ移動",
    location: "落研教室 → ステージ",
  },
  {
    id: "0705-stage-001",
    date: "2026-07-05",
    type: "stage_event",
    plannedStart: "14:05",
    durationMinutes: 45,
    title: "ステージ企画",
    location: "ステージ",
    colorKey: "stage",
    stageBlocksClassroom: true,
    memo: "ステージ企画中は教室寄席を休止します。",
  },
  {
    id: "0705-transition-002",
    date: "2026-07-05",
    type: "break",
    plannedStart: "14:50",
    durationMinutes: 10,
    title: "教室へ移動・再開準備",
    location: "ステージ → 落研教室",
  },
  ...july5Performances.slice(9),
];
