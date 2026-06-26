import type { BasSchedule, BasScheduleType } from "@/types/experience";
import { BAS_AUTOMATION_RULES } from "./bas-rule-engine";
import { BAS_SCENES } from "./bas-scene-engine";

function schedule(
  id: string,
  name: string,
  type: BasScheduleType,
  expression: string,
  targetRuleId: string | null,
  targetSceneId: string | null,
  randomizedWindowMinutes?: number,
): BasSchedule {
  return {
    id,
    name,
    type,
    expression,
    targetRuleId,
    targetSceneId,
    randomizedWindowMinutes,
    holidayCalendarReady: type === "holiday" || type === "calendar" || type === "yearly",
  };
}

export const BAS_SCHEDULES: readonly BasSchedule[] = [
  schedule("bas-schedule-cron-night", "Night Mode Cron", "cron", "0 22 * * *", null, "bas-scene-night"),
  schedule("bas-schedule-calendar-guest", "Guest Arrival Calendar", "calendar", "calendar:guest-arrival", BAS_AUTOMATION_RULES[0].id, null),
  schedule("bas-schedule-weekly-garden", "Weekly Garden Irrigation", "weekly", "Mon,Wed,Fri 06:15", null, "bas-scene-morning"),
  schedule("bas-schedule-monthly-filter", "Monthly HVAC Filter Check", "monthly", "1st day 09:00", BAS_AUTOMATION_RULES[2].id, null),
  schedule("bas-schedule-yearly-vacation", "Yearly Vacation Simulation", "yearly", "December 20 18:30", null, "bas-scene-vacation"),
  schedule("bas-schedule-holiday-away", "Holiday Away Guard", "holiday", "public-holidays sunset", null, "bas-scene-away"),
  schedule("bas-schedule-randomized-presence", "Randomized Presence Lighting", "randomized", "sunset +/- 45m", null, BAS_SCENES.find((scene) => scene.type === "vacation")?.id ?? "bas-scene-vacation", 45),
] as const;

export function getBasSchedule(scheduleId: string) {
  return BAS_SCHEDULES.find((scheduleItem) => scheduleItem.id === scheduleId) ?? null;
}
