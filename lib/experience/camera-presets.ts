import type { CameraPreset } from "@/types/experience";

export const CAMERA_PRESETS: readonly CameraPreset[] = [
  { id: "default", label: "Default", position: { x: 9, y: 7, z: 11 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "top", label: "Top", position: { x: 0, y: 16, z: 0.01 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "front", label: "Front", position: { x: 0, y: 4, z: 14 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "rear", label: "Rear", position: { x: 0, y: 4, z: -14 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "left", label: "Left", position: { x: -14, y: 4, z: 0 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "right", label: "Right", position: { x: 14, y: 4, z: 0 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "perspective", label: "Perspective", position: { x: 12, y: 9, z: 12 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "first-person", label: "First Person", position: { x: 0, y: 1.7, z: 5 }, target: { x: 0, y: 1.7, z: 0 }, enabled: false },
  { id: "walk", label: "Walk Mode", position: { x: 0, y: 1.7, z: 7 }, target: { x: 0, y: 1.7, z: 0 }, enabled: false },
] as const;

export const DEFAULT_CAMERA_PRESET = CAMERA_PRESETS[0];

export function getCameraPreset(id: CameraPreset["id"]): CameraPreset {
  return CAMERA_PRESETS.find((preset) => preset.id === id) ?? DEFAULT_CAMERA_PRESET;
}
