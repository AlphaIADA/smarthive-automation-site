import { create } from "zustand";
import type { BasExecutionResult } from "@/types/experience";
import { BAS_AUTOMATION_RULES, DEFAULT_BAS_CONTEXT, executeBasRule } from "@/lib/experience/automation/bas-rule-engine";
import { BAS_SCENES } from "@/lib/experience/automation/bas-scene-engine";
import { BAS_SCHEDULES } from "@/lib/experience/automation/bas-scheduler";

interface AutomationStoreState {
  selectedRuleId: string;
  selectedSceneId: string;
  selectedScheduleId: string;
  lastExecution: BasExecutionResult | null;
  selectRule: (ruleId: string) => void;
  selectScene: (sceneId: string) => void;
  selectSchedule: (scheduleId: string) => void;
  evaluateSelectedRule: () => void;
}

export const useAutomationStore = create<AutomationStoreState>((set, get) => ({
  selectedRuleId: BAS_AUTOMATION_RULES[0]?.id ?? "",
  selectedSceneId: BAS_SCENES[0]?.id ?? "",
  selectedScheduleId: BAS_SCHEDULES[0]?.id ?? "",
  lastExecution: null,
  selectRule: (ruleId) => set({ selectedRuleId: ruleId }),
  selectScene: (sceneId) => set({ selectedSceneId: sceneId }),
  selectSchedule: (scheduleId) => set({ selectedScheduleId: scheduleId }),
  evaluateSelectedRule: () => {
    const rule = BAS_AUTOMATION_RULES.find((candidate) => candidate.id === get().selectedRuleId);
    if (!rule) return;
    set({ lastExecution: executeBasRule(rule, DEFAULT_BAS_CONTEXT) });
  },
}));
