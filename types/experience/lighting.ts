import type { CameraVector } from "./camera";

export type LightingFixtureType =
  | "downlights"
  | "pendant"
  | "track-lights"
  | "wall-lights"
  | "garden-lights"
  | "pool-lights"
  | "led-strip"
  | "stair-lights"
  | "ceiling-lights"
  | "emergency-lights"
  | "decorative-lights"
  | "cabinet-lights"
  | "mirror-lights"
  | "spotlights";

export type ElectricalSwitchType =
  | "1-gang"
  | "2-gang"
  | "3-gang"
  | "4-gang"
  | "dimmer"
  | "scene-switch"
  | "touch-switch"
  | "wireless-switch";

export type ElectricalSocketType =
  | "normal-socket"
  | "usb-socket"
  | "smart-socket"
  | "outdoor-socket"
  | "ups-socket"
  | "solar-socket";

export type RoomLightGroupName =
  | "living-room"
  | "kitchen"
  | "dining"
  | "bedrooms"
  | "cinema"
  | "gym"
  | "garden"
  | "garage"
  | "pool";

export type LightingShadowQuality = "none" | "soft" | "standard" | "premium";
export type LightingFalloff = "linear" | "quadratic" | "inverse-square";
export type LightingMounting = "ceiling" | "wall" | "floor" | "landscape" | "pool-shell" | "cabinet" | "stair" | "mirror";
export type LightingPlaceholderShape = "disc" | "bar" | "pendant" | "sphere" | "panel" | "stake" | "tube";

export interface LightingRealisticEffects {
  readonly softShadow: boolean;
  readonly bounceLight: boolean;
  readonly reflection: boolean;
  readonly hdrSupport: boolean;
  readonly bloomReady: boolean;
  readonly volumetricReady: boolean;
}

export interface LightingPricing {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly currency: "USD";
}

export interface LightingElectricalLoad {
  readonly voltage: number;
  readonly currentAmps: number;
  readonly powerWatts: number;
  readonly consumptionWatts: number;
  readonly estimatedMonthlyHours: number;
  readonly estimatedMonthlyKwh: number;
  readonly peakLoadWatts: number;
}

export interface LightingControlState {
  readonly enabled: boolean;
  readonly displayName: string;
  readonly brightnessPercent: number;
  readonly temperatureKelvin: number;
  readonly colour: string;
  readonly groupId: RoomLightGroupName;
}

export interface LightingRenderSpec {
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly size: [number, number, number];
  readonly shape: LightingPlaceholderShape;
  readonly visibility: boolean;
  readonly lod: "near" | "mid" | "far";
  readonly collision: boolean;
  readonly shadow: boolean;
  readonly reflection: boolean;
  readonly realLight: boolean;
}

export interface LightingFixtureSpec {
  readonly id: string;
  readonly name: string;
  readonly type: LightingFixtureType;
  readonly manufacturer: string;
  readonly model: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly mounting: LightingMounting;
  readonly beamAngle: number;
  readonly falloff: LightingFalloff;
  readonly shadowQuality: LightingShadowQuality;
  readonly intensity: number;
  readonly powerWatts: number;
  readonly load: LightingElectricalLoad;
  readonly controls: LightingControlState;
  readonly effects: LightingRealisticEffects;
  readonly pricing: LightingPricing;
  readonly render: LightingRenderSpec;
  readonly futureHooks: {
    readonly grouping: true;
    readonly automationReady: true;
    readonly implementedAutomation: false;
    readonly ai: false;
    readonly voice: false;
    readonly sceneLogic: false;
  };
}

export interface ResolvedLightingFixture extends LightingFixtureSpec {
  readonly controls: LightingControlState;
  readonly load: LightingElectricalLoad;
}

export interface ElectricalSwitchSpec {
  readonly id: string;
  readonly type: ElectricalSwitchType;
  readonly name: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly groupId: RoomLightGroupName;
  readonly position: [number, number, number];
  readonly gangCount: number;
  readonly supportsDimming: boolean;
  readonly wireless: boolean;
  readonly touch: boolean;
  readonly controlsFixtureIds: readonly string[];
  readonly standbyWatts: number;
  readonly pricing: LightingPricing;
}

export interface ElectricalSocketSpec {
  readonly id: string;
  readonly type: ElectricalSocketType;
  readonly name: string;
  readonly manufacturer: string;
  readonly model: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly groupId: RoomLightGroupName;
  readonly position: [number, number, number];
  readonly ratedVoltage: number;
  readonly ratedAmps: number;
  readonly standbyWatts: number;
  readonly peakLoadWatts: number;
  readonly upsBacked: boolean;
  readonly solarBacked: boolean;
  readonly outdoorRated: boolean;
  readonly pricing: LightingPricing;
}

export interface LightingGroupSpec {
  readonly id: RoomLightGroupName;
  readonly name: string;
  readonly roomIds: readonly string[];
  readonly fixtureIds: readonly string[];
  readonly switchIds: readonly string[];
  readonly socketIds: readonly string[];
  readonly totalWattage: number;
  readonly estimatedMonthlyKwh: number;
}

export interface LightingRoomLoadSummary {
  readonly roomId: string;
  readonly roomName: string;
  readonly fixtureCount: number;
  readonly switchCount: number;
  readonly socketCount: number;
  readonly totalWattage: number;
  readonly currentConsumptionAmps: number;
  readonly estimatedMonthlyUsageKwh: number;
  readonly peakLoadWatts: number;
}

export interface LightingPowerSummary {
  readonly voltage: 230;
  readonly fixtureCount: number;
  readonly switchCount: number;
  readonly socketCount: number;
  readonly totalWattage: number;
  readonly currentConsumptionAmps: number;
  readonly estimatedMonthlyUsageKwh: number;
  readonly peakLoadWatts: number;
  readonly roomLoads: readonly LightingRoomLoadSummary[];
}

export interface LightingQuoteSummary {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly currency: "USD";
  readonly source: "experience-lighting-internal-model";
  readonly existingQuotationEngineModified: false;
}

export interface LightingEngineReport {
  readonly fixtureCount: number;
  readonly switchCount: number;
  readonly socketCount: number;
  readonly lightTypesCovered: readonly LightingFixtureType[];
  readonly switchTypesCovered: readonly ElectricalSwitchType[];
  readonly socketTypesCovered: readonly ElectricalSocketType[];
  readonly roomLightGroupsCovered: readonly RoomLightGroupName[];
  readonly actualLightCount: number;
  readonly instancedPlaceholderCount: number;
  readonly powerSummary: LightingPowerSummary;
  readonly quoteSummary: LightingQuoteSummary;
  readonly performance: {
    readonly instancedGeometry: true;
    readonly automaticLodReady: true;
    readonly shadowOptimization: true;
    readonly occlusionReady: true;
    readonly realLightsLimitedFor60Fps: true;
  };
  readonly constraints: {
    readonly ai: "excluded";
    readonly scenes: "excluded";
    readonly voice: "excluded";
    readonly externalQuotationEngine: "untouched";
    readonly api: "untouched";
    readonly database: "untouched";
  };
}

export interface LightingSelectionTarget {
  readonly fixtureId: string;
  readonly position: CameraVector;
}
