import type { CameraVector } from "./camera";

export type ImmersiveMode = "orbit" | "walk" | "fly" | "first-person" | "guided-tour" | "vr-ready";
export type ImmersiveInputSource = "mouse" | "keyboard" | "touch" | "controller";
export type ImmersiveCollisionKind = "wall" | "door" | "furniture" | "glass" | "pool" | "stairs" | "elevator";
export type ImmersiveInteractionKind = "door" | "elevator";

export interface ImmersivePose {
  readonly position: CameraVector;
  readonly target: CameraVector;
  readonly yaw: number;
  readonly pitch: number;
}

export interface ImmersiveMovementProfile {
  readonly mode: ImmersiveMode;
  readonly label: string;
  readonly enabled: true;
  readonly speedMetersPerSecond: number;
  readonly verticalSpeedMetersPerSecond: number;
  readonly mouseLook: boolean;
  readonly keyboard: boolean;
  readonly touch: boolean;
  readonly controller: boolean;
  readonly collision: boolean;
  readonly headBob: boolean;
  readonly smoothTransitions: boolean;
  readonly vrReady: boolean;
}

export interface ImmersiveCollisionVolume {
  readonly id: string;
  readonly kind: ImmersiveCollisionKind;
  readonly label: string;
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number, number];
  readonly roomId: string | null;
  readonly active: boolean;
  readonly blocksWalk: boolean;
  readonly blocksFly: boolean;
}

export interface ImmersiveInteractionTarget {
  readonly id: string;
  readonly kind: ImmersiveInteractionKind;
  readonly label: string;
  readonly roomId: string | null;
  readonly position: readonly [number, number, number];
  readonly radiusMeters: number;
  readonly enabled: true;
  readonly animationReady: true;
}

export interface GuidedTourStop {
  readonly id: string;
  readonly label: string;
  readonly roomId: string;
  readonly order: number;
  readonly pose: ImmersivePose;
  readonly narrationPrompt: string;
  readonly aiNarrationReady: true;
}

export interface ImmersiveInputMap {
  readonly source: ImmersiveInputSource;
  readonly enabled: true;
  readonly bindings: readonly string[];
}

export interface ImmersiveWalkReport {
  readonly modes: readonly ImmersiveMode[];
  readonly inputSources: readonly ImmersiveInputSource[];
  readonly movementProfiles: readonly ImmersiveMovementProfile[];
  readonly collision: {
    readonly volumeCount: number;
    readonly wallCount: number;
    readonly doorCount: number;
    readonly furnitureCount: number;
    readonly glassCount: number;
    readonly poolCount: number;
    readonly stairsCount: number;
    readonly elevatorCount: number;
  };
  readonly interactions: {
    readonly doorInteractionReady: true;
    readonly elevatorInteractionReady: true;
    readonly targetCount: number;
  };
  readonly camera: {
    readonly naturalMovement: true;
    readonly headBob: true;
    readonly smoothTransitions: true;
    readonly firstPersonReady: true;
    readonly flyReady: true;
    readonly vrReady: true;
  };
  readonly guidedTour: {
    readonly stopCount: number;
    readonly route: readonly string[];
    readonly aiNarrationReady: true;
  };
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly existingGeometry: "preserved";
  };
}
