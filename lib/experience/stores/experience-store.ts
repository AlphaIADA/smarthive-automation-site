import { create } from "zustand";

export type ExperienceRuntimeStatus = "idle" | "loading" | "ready" | "degraded";

interface ExperienceState {
  status: ExperienceRuntimeStatus;
  mode: "orbit" | "first-person" | "walk";
  managerCount: number;
  setStatus: (status: ExperienceRuntimeStatus) => void;
  setMode: (mode: ExperienceState["mode"]) => void;
  setManagerCount: (managerCount: number) => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  status: "idle",
  mode: "orbit",
  managerCount: 0,
  setStatus: (status) => set({ status }),
  setMode: (mode) => set({ mode }),
  setManagerCount: (managerCount) => set({ managerCount }),
}));
