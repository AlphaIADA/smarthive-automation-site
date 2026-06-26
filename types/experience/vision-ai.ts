import type { InteriorFloorLevel } from "./interior";

export type VisionRecognitionCategory = "object" | "room" | "furniture" | "lighting" | "security" | "device" | "power";
export type VisionScanMode = "room-click" | "camera-mode" | "photo-import";
export type VisionDetectionKind = "door" | "window" | "furniture" | "electrical-point" | "lighting" | "camera-location" | "sensor-location";
export type VisionRating = "A+" | "A" | "B" | "C";
export type VisionRecommendationPriority = "low" | "medium" | "high" | "critical";

export interface VisionRecognitionResult {
  readonly id: string;
  readonly category: VisionRecognitionCategory;
  readonly label: string;
  readonly confidence: number;
  readonly count: number;
  readonly entityUuids: readonly string[];
  readonly evidence: readonly string[];
}

export interface VisionInstalledItem {
  readonly id: string;
  readonly name: string;
  readonly category: VisionRecognitionCategory;
  readonly twinUuid: string;
  readonly stableId: string;
  readonly state: string;
  readonly confidence: number;
}

export interface VisionMissingDeviceRecommendation {
  readonly id: string;
  readonly title: string;
  readonly category: "lighting" | "security" | "device" | "power";
  readonly reason: string;
  readonly priority: VisionRecommendationPriority;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly installationHours: number;
}

export interface VisionImprovement {
  readonly id: string;
  readonly title: string;
  readonly reason: string;
  readonly impact: "comfort" | "energy" | "security" | "luxury" | "resilience";
  readonly costImpactUsd: number;
}

export interface VisionCameraDetection {
  readonly id: string;
  readonly kind: VisionDetectionKind;
  readonly label: string;
  readonly position: readonly [number, number, number];
  readonly confidence: number;
  readonly futureModelReady: true;
}

export interface VisionQuoteLineItem {
  readonly id: string;
  readonly name: string;
  readonly category: VisionMissingDeviceRecommendation["category"];
  readonly quantity: number;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly installationHours: number;
}

export interface VisionQuoteDraft {
  readonly id: string;
  readonly title: string;
  readonly currency: "USD";
  readonly roomId: string;
  readonly roomName: string;
  readonly lineItems: readonly VisionQuoteLineItem[];
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly installationHours: number;
  readonly generatedDirectlyFromVisionAnalysis: true;
  readonly existingQuotationEngineModified: false;
}

export interface VisionPhotoImportContract {
  readonly status: "future-ready";
  readonly acceptedInputs: readonly ["room-photo"];
  readonly plannedDetections: readonly ["doors", "windows", "furniture", "electrical-points", "lighting", "camera-locations", "sensor-locations"];
  readonly externalVisionProviderRequiredNow: false;
}

export interface VisionRoomAnalysis {
  readonly id: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly roomTwinUuid: string;
  readonly floorLevel: InteriorFloorLevel;
  readonly scanMode: VisionScanMode;
  readonly scannedAtLabel: string;
  readonly summary: string;
  readonly installedDevices: readonly VisionInstalledItem[];
  readonly missingDevices: readonly VisionMissingDeviceRecommendation[];
  readonly possibleImprovements: readonly VisionImprovement[];
  readonly estimatedCost: {
    readonly equipmentCost: number;
    readonly installationCost: number;
    readonly labourCost: number;
    readonly totalCost: number;
  };
  readonly installationTimeHours: number;
  readonly energyRating: VisionRating;
  readonly securityRating: VisionRating;
  readonly recognitions: readonly VisionRecognitionResult[];
  readonly cameraDetections: readonly VisionCameraDetection[];
  readonly quoteDraft: VisionQuoteDraft;
  readonly futurePhotoImportReady: true;
  readonly cameraModeReady: true;
}

export interface VisionAiReport {
  readonly roomAnalysisCount: number;
  readonly recognitionCount: number;
  readonly detectionCount: number;
  readonly quoteDraftCount: number;
  readonly totalRecommendedCost: number;
  readonly averageEnergyRating: VisionRating;
  readonly averageSecurityRating: VisionRating;
  readonly capabilities: {
    readonly objectRecognition: true;
    readonly roomRecognition: true;
    readonly furnitureRecognition: true;
    readonly lightingRecognition: true;
    readonly securityRecognition: true;
    readonly deviceRecognition: true;
    readonly powerRecognition: true;
    readonly roomClickScan: true;
    readonly cameraModeScan: true;
    readonly photoImportFutureReady: true;
    readonly quoteFromVisionAnalysis: true;
  };
  readonly photoImport: VisionPhotoImportContract;
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly externalQuoteEngine: "untouched";
    readonly externalVisionProvider: "not-required";
  };
}
