import type { ConfigurationCategory, ConfigurationPricing } from "./configuration";
import type { ImmersiveInputSource } from "./immersive-walk";

export type XrDeviceClass = "desktop" | "mobile" | "tablet" | "virtual-reality" | "augmented-reality" | "mixed-reality" | "apple-vision-pro" | "meta-quest" | "android-xr";
export type XrMode = "desktop" | "touch" | "walk" | "vr" | "ar-placement" | "presentation" | "client-demo";
export type XrArPlacementCategory = "smart-switches" | "curtains" | "sensors" | "cameras" | "door-locks" | "lighting" | "panels" | "thermostats" | "network-rack" | "audio";
export type XrControllerHand = "left" | "right";
export type XrControllerInput = "trigger" | "grip" | "thumbstick" | "touchpad" | "menu" | "gesture-pinch" | "hand-ray";
export type XrLocomotionMode = "teleport" | "walk" | "laser-pointer";
export type XrQualityLevel = "ultra" | "high" | "balanced" | "performance" | "battery-saver";
export type XrPresentationStepType = "guided-demo" | "automatic-camera-tour" | "interactive-hotspot" | "device-explanation" | "installation-recommendation" | "quotation-update";

export interface XrCapabilityProfile {
  readonly deviceClass: XrDeviceClass;
  readonly label: string;
  readonly supportedModes: readonly XrMode[];
  readonly inputSources: readonly ImmersiveInputSource[];
  readonly targetFps: number;
  readonly requiresWebXr: boolean;
  readonly futureHardwareReady: boolean;
  readonly notes: string;
}

export interface XrModeProfile {
  readonly mode: XrMode;
  readonly label: string;
  readonly enabled: true;
  readonly supportedDevices: readonly XrDeviceClass[];
  readonly defaultQuality: XrQualityLevel;
  readonly usesVillaScene: boolean;
  readonly usesCameraTour: boolean;
  readonly usesTouchUi: boolean;
  readonly usesControllerUi: boolean;
  readonly voiceCommandsReady: boolean;
}

export interface XrArPlacementAnchor {
  readonly id: string;
  readonly category: XrArPlacementCategory;
  readonly label: string;
  readonly configurationItemId: string;
  readonly categoryMappedFrom: ConfigurationCategory;
  readonly roomId: string | null;
  readonly roomName: string | null;
  readonly estimatedPosition: readonly [number, number, number];
  readonly estimatedNormal: readonly [number, number, number];
  readonly placementHeightMeters: number;
  readonly installZoneRadiusMeters: number;
  readonly pricing: ConfigurationPricing;
  readonly quotationUpdateReady: true;
}

export interface XrVrControllerProfile {
  readonly id: string;
  readonly hand: XrControllerHand;
  readonly label: string;
  readonly inputs: readonly XrControllerInput[];
  readonly locomotion: readonly XrLocomotionMode[];
  readonly laserPointer: true;
  readonly uiInteraction: true;
  readonly hapticsReady: true;
  readonly voiceCommandsReady: true;
}

export interface XrPresentationStep {
  readonly id: string;
  readonly type: XrPresentationStepType;
  readonly order: number;
  readonly title: string;
  readonly description: string;
  readonly tourStopId: string | null;
  readonly configurationItemId: string | null;
  readonly recommendation: string;
  readonly quotationDelta: ConfigurationPricing;
}

export interface XrPerformanceProfile {
  readonly targetDesktopFps: number;
  readonly targetMobileFps: number;
  readonly targetVrFps: number;
  readonly dynamicQualityScaling: true;
  readonly foveatedRenderingReady: true;
  readonly occlusionReady: true;
  readonly controllerMeshesCapped: true;
  readonly arAnchorsCapped: true;
  readonly recommendedQuality: XrQualityLevel;
}

export interface XrQuotationUpdateSummary {
  readonly selectedPlacementCount: number;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly currency: "USD";
  readonly source: "experience-xr-placement-internal-model";
  readonly externalQuoteEngineModified: false;
}

export interface XrFrameworkReport {
  readonly deviceClassCount: number;
  readonly modeCount: number;
  readonly arPlacementCount: number;
  readonly vrControllerCount: number;
  readonly presentationStepCount: number;
  readonly supportedDeviceClasses: readonly XrDeviceClass[];
  readonly modes: {
    readonly desktop: true;
    readonly touch: true;
    readonly walk: true;
    readonly vr: true;
    readonly arPlacement: true;
    readonly presentation: true;
    readonly clientDemo: true;
  };
  readonly ar: {
    readonly smartSwitches: true;
    readonly curtains: true;
    readonly sensors: true;
    readonly cameras: true;
    readonly doorLocks: true;
    readonly lighting: true;
    readonly panels: true;
    readonly thermostats: true;
    readonly networkRack: true;
    readonly audio: true;
    readonly installationLocationsEstimated: true;
  };
  readonly vr: {
    readonly villaExplorable: true;
    readonly teleport: true;
    readonly walk: true;
    readonly laserPointer: true;
    readonly interactiveUi: true;
    readonly voiceCommandsReady: true;
  };
  readonly presentation: {
    readonly guidedDemo: true;
    readonly automaticCameraTour: true;
    readonly interactiveHotspots: true;
    readonly deviceExplanations: true;
    readonly installationRecommendations: true;
    readonly quotationUpdates: true;
  };
  readonly performance: XrPerformanceProfile;
  readonly quotation: XrQuotationUpdateSummary;
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly nativeXrSessionStarted: false;
    readonly externalQuoteEngine: "untouched";
  };
}
