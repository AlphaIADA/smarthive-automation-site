import type { CameraVector } from "./camera";

export type InteriorFloorLevel = "ground" | "first";

export type InteriorFloorMaterial =
  | "large-format-marble"
  | "engineered-wood"
  | "polished-concrete"
  | "bathroom-tile"
  | "outdoor-decking"
  | "acoustic-floor";

export type FutureRoomCapability =
  | "lighting"
  | "curtains"
  | "air-conditioning"
  | "cctv"
  | "sensors"
  | "locks"
  | "voice-assistant"
  | "ai"
  | "quotation";

export interface InteriorBoundingBox {
  readonly min: CameraVector;
  readonly max: CameraVector;
}

export interface InteriorRoomFutureEnergy {
  readonly zone: "comfort" | "service" | "wellness" | "entertainment" | "circulation" | "outdoor";
  readonly profile: "low" | "medium" | "high";
  readonly baselineKwhPerDay: number;
}

export interface InteriorRoomQuoteMapping {
  readonly category:
    | "entry"
    | "living"
    | "kitchen"
    | "service"
    | "bedroom"
    | "bathroom"
    | "wellness"
    | "office"
    | "circulation"
    | "outdoor";
  readonly allowanceCode: string;
  readonly futureDeviceAllowance: number;
}

export interface InteriorRoomCameraFocus {
  readonly position: CameraVector;
  readonly target: CameraVector;
}

export interface InteriorRoom {
  readonly id: string;
  readonly name: string;
  readonly areaSqm: number;
  readonly volumeCbm: number;
  readonly floorLevel: InteriorFloorLevel;
  readonly boundingBox: InteriorBoundingBox;
  readonly ceilingHeight: number;
  readonly floorMaterial: InteriorFloorMaterial;
  readonly futureSmartDevices: readonly FutureRoomCapability[];
  readonly futureEnergyConsumption: InteriorRoomFutureEnergy;
  readonly futureQuoteMapping: InteriorRoomQuoteMapping;
  readonly cameraFocus: InteriorRoomCameraFocus;
}

export interface InteriorNavigationEdge {
  readonly from: string;
  readonly to: string;
  readonly type: "open" | "door" | "sliding-glass" | "stair" | "elevator" | "terrace" | "hidden" | "pocket" | "garage";
  readonly distanceMeters: number;
  readonly walkModeReady: boolean;
}

export interface InteriorDoorSpec {
  readonly id: string;
  readonly type: "pivot" | "sliding-glass" | "bedroom" | "bathroom" | "hidden" | "pocket" | "garage";
  readonly position: [number, number, number];
  readonly size: [number, number, number];
  readonly rotation?: [number, number, number];
}

export interface InteriorWindowSpec {
  readonly id: string;
  readonly type: "operable" | "curtain-wall" | "skylight" | "bathroom" | "office";
  readonly position: [number, number, number];
  readonly size: [number, number, number];
  readonly rotation?: [number, number, number];
}
