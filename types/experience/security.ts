import type { CameraVector } from "./camera";

export type SecurityDeviceType =
  | "indoor-camera"
  | "outdoor-camera"
  | "ptz-camera"
  | "doorbell-camera"
  | "video-intercom"
  | "motion-detector"
  | "door-sensor"
  | "window-sensor"
  | "glass-break-sensor"
  | "smoke-detector"
  | "gas-detector"
  | "water-leak-sensor"
  | "siren"
  | "panic-button"
  | "fingerprint-lock"
  | "face-recognition-lock"
  | "card-access"
  | "pin-lock"
  | "garage-sensor"
  | "gate-sensor";

export type SecurityDeviceCategory = "camera" | "sensor" | "access-control" | "alarm" | "intercom";
export type SecurityDashboardMode = "armed" | "disarmed" | "partial" | "away" | "vacation" | "emergency";
export type SecurityHealthStatus = "healthy" | "warning" | "service-required";
export type SecurityOnlineStatus = "online" | "offline";
export type SecurityRecordingStatus = "recording" | "standby" | "disabled";
export type SecurityStorageStatus = "healthy" | "retention-warning" | "full" | "offline";
export type SecurityNotificationType = "motion" | "door-open" | "window-open" | "smoke" | "gas" | "water-leak" | "low-battery" | "offline-device";
export type SecurityAccessZone = "front-door" | "garage" | "gate" | "bedrooms" | "office" | "utility-room";
export type SecurityMapLayer = "sensors" | "camera-coverage" | "locks";
export type SecurityPlaceholderShape = "camera" | "sensor" | "lock" | "siren" | "button" | "intercom";

export interface SecurityPricing {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly currency: "USD";
}

export interface SecurityDeviceRenderSpec {
  readonly position: [number, number, number];
  readonly rotation?: [number, number, number];
  readonly size: [number, number, number];
  readonly shape: SecurityPlaceholderShape;
  readonly color: string;
  readonly visibility: boolean;
  readonly lod: "near" | "mid" | "far";
  readonly collision: boolean;
  readonly shadow: boolean;
  readonly coverageVisible: boolean;
}

export interface SecurityDeviceBase {
  readonly id: string;
  readonly name: string;
  readonly type: SecurityDeviceType;
  readonly category: SecurityDeviceCategory;
  readonly manufacturer: string;
  readonly model: string;
  readonly firmwareVersion: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly onlineStatus: SecurityOnlineStatus;
  readonly healthStatus: SecurityHealthStatus;
  readonly batteryPercent: number | null;
  readonly signalStrength: number;
  readonly pricing: SecurityPricing;
  readonly render: SecurityDeviceRenderSpec;
  readonly futureReady: {
    readonly faceRecognition: boolean;
    readonly anpr: boolean;
    readonly visitorManagement: boolean;
    readonly remoteMonitoring: boolean;
    readonly cloudRecording: boolean;
    readonly mobilePush: boolean;
    readonly aiDetectionReady: boolean;
    readonly aiAnalysisImplemented: false;
    readonly automationRulesImplemented: false;
    readonly voiceCommandsImplemented: false;
  };
}

export interface SecurityCameraSpec extends SecurityDeviceBase {
  readonly category: "camera" | "intercom";
  readonly fovDegrees: number;
  readonly zoom: {
    readonly optical: number;
    readonly digital: number;
  };
  readonly nightVision: boolean;
  readonly recordingStatus: SecurityRecordingStatus;
  readonly storageStatus: SecurityStorageStatus;
  readonly liveView: {
    readonly channel: string;
    readonly resolution: "1080p" | "2K" | "4K";
    readonly fps: number;
    readonly latencyMs: number;
  };
  readonly coverage: {
    readonly origin: [number, number, number];
    readonly target: [number, number, number];
    readonly distanceMeters: number;
    readonly horizontalFovDegrees: number;
    readonly verticalFovDegrees: number;
  };
}

export interface SecuritySensorSpec extends SecurityDeviceBase {
  readonly category: "sensor" | "alarm";
  readonly notificationType: SecurityNotificationType;
  readonly detectionRadiusMeters: number;
  readonly tamperProtected: boolean;
  readonly lastEvent: string;
}

export interface SecurityAccessControlSpec extends SecurityDeviceBase {
  readonly category: "access-control" | "intercom";
  readonly accessZone: SecurityAccessZone;
  readonly lockState: "locked" | "unlocked" | "monitor-only";
  readonly accessMethod: "fingerprint" | "face" | "card" | "pin" | "video-call" | "sensor";
  readonly auditTrailReady: boolean;
}

export type SecurityDeviceSpec = SecurityCameraSpec | SecuritySensorSpec | SecurityAccessControlSpec;

export interface SecurityNotificationSpec {
  readonly id: string;
  readonly type: SecurityNotificationType;
  readonly title: string;
  readonly severity: "info" | "warning" | "critical";
  readonly deviceId: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly acknowledged: boolean;
  readonly timestampLabel: string;
}

export interface SecurityQuoteRecommendation {
  readonly id: string;
  readonly name: "NVR" | "Hard Drive" | "UPS" | "PoE Switch" | "Cabling" | "Conduit" | "Installation Labour";
  readonly quantity: number;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly reason: string;
}

export interface SecurityQuoteSummary {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly recommendations: readonly SecurityQuoteRecommendation[];
  readonly currency: "USD";
  readonly source: "experience-security-internal-model";
  readonly existingQuotationEngineModified: false;
}

export interface SecurityRegistrySummary {
  readonly deviceCount: number;
  readonly cameraCount: number;
  readonly sensorCount: number;
  readonly accessControlCount: number;
  readonly alarmCount: number;
  readonly intercomCount: number;
  readonly onlineCount: number;
  readonly offlineCount: number;
  readonly recordingCameraCount: number;
  readonly notificationCount: number;
}

export interface SecurityPlatformReport {
  readonly deviceTypesCovered: readonly SecurityDeviceType[];
  readonly dashboardModes: readonly SecurityDashboardMode[];
  readonly mapLayers: readonly SecurityMapLayer[];
  readonly accessZonesCovered: readonly SecurityAccessZone[];
  readonly notificationTypesCovered: readonly SecurityNotificationType[];
  readonly registrySummary: SecurityRegistrySummary;
  readonly quoteSummary: SecurityQuoteSummary;
  readonly performance: {
    readonly instancedGeometry: true;
    readonly coverageMeshesCapped: true;
    readonly automaticLodReady: true;
    readonly occlusionReady: true;
    readonly shadowOptimization: true;
  };
  readonly constraints: {
    readonly aiAnalysis: "excluded";
    readonly automationRules: "excluded";
    readonly voiceCommands: "excluded";
    readonly externalQuotationEngine: "untouched";
    readonly api: "untouched";
    readonly database: "untouched";
  };
}

export interface SecuritySelectionTarget {
  readonly deviceId: string;
  readonly position: CameraVector;
}
