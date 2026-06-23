import { getCameraPreset } from "@/lib/experience/camera-presets";
import type { EventBus } from "@/lib/experience/event-bus";
import type { CameraPresetId } from "@/types/experience";

export function requestCameraPreset(eventBus: EventBus, presetId: CameraPresetId): boolean {
  const preset = getCameraPreset(presetId);
  if (!preset.enabled) return false;
  eventBus.emit("CAMERA_CHANGED", { preset: presetId });
  return true;
}
