export type CameraPresetId =
  | "front-arrival"
  | "driveway"
  | "pool"
  | "garden"
  | "aerial"
  | "front-door"
  | "backyard"
  | "terrace"
  | "exterior-arrival"
  | "living-room"
  | "kitchen"
  | "master-bedroom"
  | "cinema"
  | "gym"
  | "pool-area"
  | "security-overview"
  | "full-house-top";

export interface CameraVector {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface CameraPreset {
  readonly id: CameraPresetId;
  readonly label: string;
  readonly position: CameraVector;
  readonly target: CameraVector;
  readonly enabled: boolean;
}
