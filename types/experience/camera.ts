export type CameraPresetId =
  | "default"
  | "top"
  | "front"
  | "rear"
  | "left"
  | "right"
  | "perspective"
  | "first-person"
  | "walk";

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
