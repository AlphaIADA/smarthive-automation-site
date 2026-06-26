import { create } from "zustand";
import type { CameraPresetId, CameraVector } from "@/types/experience";

interface CameraState {
  preset: CameraPresetId;
  position: CameraVector;
  target: CameraVector;
  focus: { readonly roomId: string; readonly position: CameraVector; readonly target: CameraVector } | null;
  setPreset: (preset: CameraPresetId) => void;
  setPose: (position: CameraVector, target: CameraVector) => void;
  setFocus: (roomId: string, position: CameraVector, target: CameraVector) => void;
  clearFocus: () => void;
}

export const useCameraStore = create<CameraState>((set) => ({
  preset: "front-arrival",
  position: { x: -6, y: 6.8, z: 32 },
  target: { x: -1.5, y: 2.5, z: 4.6 },
  focus: null,
  setPreset: (preset) => set({ preset, focus: null }),
  setPose: (position, target) => set({ position, target }),
  setFocus: (roomId, position, target) => set({ focus: { roomId, position, target }, position, target }),
  clearFocus: () => set({ focus: null }),
}));
