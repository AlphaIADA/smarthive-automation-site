import type { CameraPresetId, CameraVector } from "./camera";

export type ExperienceRenderMode = "production-glb" | "procedural-fallback";

export type ExperienceModelAssetId =
  | "villa"
  | "exterior"
  | "living-room"
  | "kitchen"
  | "master-bedroom"
  | "cinema"
  | "gym"
  | "bathroom"
  | "pool-area";

export type ExperienceModelAssetKind = "primary" | "room-chunk";
export type ExperienceModelAssetStatus = "idle" | "checking" | "available" | "missing" | "error";

export interface ExperienceModelAsset {
  readonly id: ExperienceModelAssetId;
  readonly label: string;
  readonly fileName: string;
  readonly url: string;
  readonly kind: ExperienceModelAssetKind;
  readonly roomId: string | null;
  readonly required: boolean;
  readonly lazy: boolean;
  readonly cameraPresets: readonly CameraPresetId[];
  readonly position?: readonly [number, number, number];
  readonly rotation?: readonly [number, number, number];
  readonly scale?: readonly [number, number, number];
}

export interface ExperienceModelAssetState {
  readonly assetId: ExperienceModelAssetId;
  readonly status: ExperienceModelAssetStatus;
  readonly progress: number;
  readonly message: string | null;
}

export type ExperienceHotspotType =
  | "smart-light"
  | "smart-switch"
  | "smart-lock"
  | "cctv-camera"
  | "motion-sensor"
  | "door-sensor"
  | "curtain-motor"
  | "thermostat"
  | "ac"
  | "smart-socket"
  | "video-doorbell"
  | "smart-hub"
  | "smoke-detector"
  | "gas-detector"
  | "water-leak-sensor";

export type ExperienceHotspotStatus = "installed" | "recommended" | "online" | "offline" | "maintenance";

export interface ExperienceHotspotQuoteMapping {
  readonly quoteItemId: string;
  readonly catalogSlug: string | null;
  readonly configurationItemId: string | null;
  readonly equipmentPrice: number;
  readonly installationCost: number;
  readonly labourCost: number;
}

export interface ExperienceHotspot {
  readonly id: string;
  readonly roomId: string;
  readonly room: string;
  readonly type: ExperienceHotspotType;
  readonly position: CameraVector;
  readonly label: string;
  readonly icon: string;
  readonly status: ExperienceHotspotStatus;
  readonly manufacturer: string;
  readonly model: string;
  readonly description: string;
  readonly quoteMapping: ExperienceHotspotQuoteMapping;
}

export interface ExperienceQuoteItem {
  readonly quoteItemId: string;
  readonly catalogSlug: string | null;
  readonly configurationItemId: string | null;
  readonly hotspotId: string;
  readonly label: string;
  readonly room: string;
  readonly deviceType: ExperienceHotspotType;
  readonly unitPrice: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly quantity: number;
  readonly addedAt: string;
}
