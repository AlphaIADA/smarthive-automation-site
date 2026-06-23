import { create } from "zustand";
import type { CameraPresetId, CameraVector } from "@/types/experience";

interface CameraState {
  preset: CameraPresetId;
  position: CameraVector;
  target: CameraVector;
  setPreset: (preset: CameraPresetId) => void;
  setPose: (position: CameraVector, target: CameraVector) => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  preset: "default",
  position: { x: 9, y: 7, z: 11 },
  target: { x: 0, y: 0, z: 0 },
  setPreset: (preset) => set({ preset }),
  setPose: (position, target) => set({ position, target }),
}));
