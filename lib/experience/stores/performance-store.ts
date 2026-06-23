import { create } from "zustand";
import type { PerformanceSnapshot } from "@/types/experience";

const EMPTY_SNAPSHOT: PerformanceSnapshot = {
  fps: 0,
  memoryMb: null,
  drawCalls: 0,
  triangles: 0,
  sceneObjects: 0,
  textures: 0,
  geometries: 0,
  cameraPosition: { x: 0, y: 0, z: 0 },
};

interface PerformanceState {
  snapshot: PerformanceSnapshot;
  quality: "high" | "balanced" | "performance";
  update: (snapshot: PerformanceSnapshot) => void;
  setQuality: (quality: PerformanceState["quality"]) => void;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  snapshot: EMPTY_SNAPSHOT,
  quality: "balanced",
  update: (snapshot) => set({ snapshot }),
  setQuality: (quality) => set({ quality }),
}));
