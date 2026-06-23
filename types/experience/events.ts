import type { CameraPresetId, CameraVector } from "./camera";
import type { ExperiencePluginManifest } from "./plugins";

export interface PerformanceSnapshot {
  readonly fps: number;
  readonly memoryMb: number | null;
  readonly drawCalls: number;
  readonly triangles: number;
  readonly sceneObjects: number;
  readonly textures: number;
  readonly geometries: number;
  readonly cameraPosition: CameraVector;
}

export interface ExperienceEventMap {
  EXPERIENCE_READY: { readonly managerCount: number; readonly pluginCount: number };
  EXPERIENCE_DISPOSED: { readonly timestamp: number };
  MANAGER_READY: { readonly manager: string };
  MANAGER_ERROR: { readonly manager: string; readonly code: string; readonly message: string };
  LIGHT_TOGGLE: { readonly lightId: string; readonly enabled: boolean };
  DEVICE_SELECTED: { readonly deviceId: string | null };
  ROOM_SELECTED: { readonly roomId: string | null };
  SCENE_CHANGED: { readonly sceneId: string };
  CAMERA_CHANGED: { readonly preset: CameraPresetId };
  MODE_CHANGED: { readonly mode: "orbit" | "first-person" | "walk" };
  SELECTION_CHANGED: { readonly kind: "none" | "room" | "device"; readonly id: string | null };
  PERFORMANCE_UPDATED: PerformanceSnapshot;
  PLUGIN_REGISTERED: { readonly plugin: ExperiencePluginManifest };
  PLUGIN_TOGGLED: { readonly pluginId: string; readonly enabled: boolean };
  THEME_CHANGED: { readonly theme: "dark" | "light" };
  DEBUG_TOGGLE: { readonly visible: boolean };
  NOTIFICATION_PUSHED: {
    readonly id: string;
    readonly tone: "info" | "success" | "warning" | "error";
    readonly message: string;
  };
  LOADING_CHANGED: { readonly loading: boolean; readonly progress: number; readonly label: string };
  EFFECTS_CHANGED: { readonly enabled: boolean };
  AUDIO_CHANGED: { readonly muted: boolean };
  INPUT_CHANGED: { readonly source: "pointer" | "keyboard" | "touch" };
  PRESET_CHANGED: { readonly presetId: string };
  ENVIRONMENT_CHANGED: { readonly environmentId: string };
  MATERIAL_CHANGED: { readonly materialId: string };
  ASSET_REQUESTED: { readonly assetId: string; readonly url: string };
  ANIMATION_REQUESTED: { readonly animationId: string };
  PHYSICS_CHANGED: { readonly enabled: boolean };
  AUTOMATION_REQUESTED: { readonly automationId: string };
  LOD_CHANGED: { readonly level: number };
  MEMORY_PRESSURE: { readonly level: "normal" | "warning" | "critical" };
}

export type ExperienceEventName = keyof ExperienceEventMap;
