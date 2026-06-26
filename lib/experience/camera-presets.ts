import type { CameraPreset } from "@/types/experience";

export const CAMERA_PRESETS: readonly CameraPreset[] = [
  { id: "front-arrival", label: "Front Arrival", position: { x: -6, y: 6.8, z: 32 }, target: { x: -1.5, y: 2.5, z: 4.6 }, enabled: true },
  { id: "exterior-arrival", label: "Exterior Arrival", position: { x: -10.5, y: 5.8, z: 30 }, target: { x: 0, y: 2.2, z: 3.8 }, enabled: true },
  { id: "living-room", label: "Living Room", position: { x: -6.8, y: 2.3, z: 6.6 }, target: { x: -4.2, y: 1.7, z: 1.8 }, enabled: true },
  { id: "kitchen", label: "Kitchen", position: { x: 8.8, y: 2.45, z: 5.4 }, target: { x: 6.2, y: 1.5, z: 0.8 }, enabled: true },
  { id: "master-bedroom", label: "Master Bedroom", position: { x: -10.2, y: 5.2, z: -7.2 }, target: { x: -5.7, y: 4.7, z: -2.7 }, enabled: true },
  { id: "cinema", label: "Cinema", position: { x: -17.4, y: 2.45, z: 3.9 }, target: { x: -14.4, y: 1.55, z: 1.2 }, enabled: true },
  { id: "gym", label: "Gym", position: { x: -14.6, y: 2.8, z: 4.2 }, target: { x: -10.8, y: 1.45, z: 0.9 }, enabled: true },
  { id: "pool-area", label: "Pool Area", position: { x: 17.5, y: 4.4, z: -30 }, target: { x: 2.6, y: 1.4, z: -18.8 }, enabled: true },
  { id: "security-overview", label: "Security Overview", position: { x: 29, y: 14, z: 26 }, target: { x: 1.5, y: 2.2, z: 1.5 }, enabled: true },
  { id: "full-house-top", label: "Full House Top", position: { x: 0, y: 42, z: 0.01 }, target: { x: 0, y: 0, z: 0 }, enabled: true },
  { id: "driveway", label: "Driveway", position: { x: 17, y: 4.5, z: 27 }, target: { x: 10, y: 1.8, z: 7.5 }, enabled: true },
  { id: "pool", label: "Pool", position: { x: 15.5, y: 4.1, z: -29 }, target: { x: 2, y: 1.4, z: -19.5 }, enabled: true },
  { id: "garden", label: "Garden", position: { x: -31, y: 4.9, z: -7 }, target: { x: -12.5, y: 2.1, z: -5.5 }, enabled: true },
  { id: "aerial", label: "Aerial", position: { x: 25, y: 31, z: 27 }, target: { x: 0, y: 1.6, z: -2 }, enabled: true },
  { id: "front-door", label: "Front Door", position: { x: -2.2, y: 2.5, z: 12.5 }, target: { x: -1.9, y: 1.8, z: 5.1 }, enabled: true },
  { id: "backyard", label: "Backyard", position: { x: -9.5, y: 5.5, z: -29.5 }, target: { x: 0.8, y: 2.1, z: -7.2 }, enabled: true },
  { id: "terrace", label: "Terrace", position: { x: -12.5, y: 8.8, z: -13.5 }, target: { x: -3.6, y: 5.1, z: -6.5 }, enabled: true },
] as const;

export const DEFAULT_CAMERA_PRESET = CAMERA_PRESETS[0];

export function getCameraPreset(id: CameraPreset["id"]): CameraPreset {
  return CAMERA_PRESETS.find((preset) => preset.id === id) ?? DEFAULT_CAMERA_PRESET;
}
