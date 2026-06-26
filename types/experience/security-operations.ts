export type SocSecurityLevel = "normal" | "armed" | "partial" | "away" | "vacation" | "emergency";
export type SocOperationalStatus = "normal" | "warning" | "critical" | "offline";
export type SocMapLayer = "cameras" | "sensors" | "locks" | "alarms";
export type SocMapAssetType = "camera" | "sensor" | "lock" | "alarm";
export type SocEventType = "motion" | "door" | "window" | "smoke" | "gas" | "water" | "power-failure";
export type SocEventSeverity = "info" | "warning" | "critical";
export type SocIncidentStatus = "open" | "investigating" | "resolved" | "escalated";
export type SocVideoMode = "live" | "playback" | "snapshot";
export type SocQuoteRecommendationName =
  | "Command Center Workstation"
  | "Video Wall Display"
  | "Failover NVR"
  | "Access Control Controller"
  | "Environmental Sensor Pack"
  | "Network Health Appliance"
  | "Incident Response Keypad";

export interface SocSubsystemStatus {
  readonly id: string;
  readonly name: string;
  readonly status: SocOperationalStatus;
  readonly onlineCount: number;
  readonly totalCount: number;
  readonly criticalCount: number;
  readonly message: string;
}

export interface SocCommandCenterStatus {
  readonly cameraWall: SocSubsystemStatus;
  readonly alarmStatus: SocSubsystemStatus;
  readonly doorStatus: SocSubsystemStatus;
  readonly sensorStatus: SocSubsystemStatus;
  readonly networkStatus: SocSubsystemStatus;
  readonly powerStatus: SocSubsystemStatus;
}

export interface SocMapRenderSpec {
  readonly position: readonly [number, number, number];
  readonly size: readonly [number, number, number];
  readonly color: string;
  readonly visibility: boolean;
  readonly lod: "near" | "mid" | "far";
  readonly collision: boolean;
  readonly shadow: boolean;
}

export interface SocLiveMapAsset {
  readonly id: string;
  readonly sourceDeviceId: string;
  readonly type: SocMapAssetType;
  readonly layer: SocMapLayer;
  readonly label: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly status: SocOperationalStatus;
  readonly render: SocMapRenderSpec;
  readonly coverageMeters: number;
}

export interface SocVideoBookmark {
  readonly id: string;
  readonly cameraId: string;
  readonly label: string;
  readonly timestampLabel: string;
  readonly offsetSeconds: number;
  readonly incidentId?: string;
}

export interface SocCameraWallTile {
  readonly id: string;
  readonly cameraId: string;
  readonly name: string;
  readonly roomName: string;
  readonly channel: string;
  readonly resolution: "1080p" | "2K" | "4K";
  readonly fps: number;
  readonly latencyMs: number;
  readonly status: SocOperationalStatus;
  readonly recordingStatus: string;
  readonly storageStatus: string;
  readonly playbackAvailable: true;
  readonly snapshotAvailable: true;
  readonly timelineAvailable: true;
  readonly bookmarkIds: readonly string[];
}

export interface SocVideoSession {
  readonly selectedCameraId: string;
  readonly mode: SocVideoMode;
  readonly currentTimestampLabel: string;
  readonly timelineWindowMinutes: number;
  readonly playbackAvailable: true;
  readonly snapshotAvailable: true;
  readonly bookmarksAvailable: true;
}

export interface SocEventTimelineItem {
  readonly id: string;
  readonly type: SocEventType;
  readonly title: string;
  readonly severity: SocEventSeverity;
  readonly sourceDeviceId: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly timestampLabel: string;
  readonly minutesAgo: number;
  readonly acknowledged: boolean;
  readonly incidentId: string;
}

export interface SocIncident {
  readonly id: string;
  readonly eventId: string;
  readonly title: string;
  readonly severity: SocEventSeverity;
  readonly status: SocIncidentStatus;
  readonly sourceDeviceId: string;
  readonly roomId: string;
  readonly roomName: string;
  readonly createdAtLabel: string;
  readonly assignedQueue: "SOC" | "Security" | "Facilities" | "Electrical";
  readonly responsePlaybook: string;
}

export interface SocQuoteRecommendation {
  readonly id: string;
  readonly name: SocQuoteRecommendationName;
  readonly quantity: number;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly reason: string;
}

export interface SocQuoteSummary {
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly totalCost: number;
  readonly recommendations: readonly SocQuoteRecommendation[];
  readonly currency: "USD";
  readonly source: "experience-soc-internal-model";
  readonly existingQuotationEngineModified: false;
}

export interface SocOperationsReport {
  readonly securityLevels: readonly SocSecurityLevel[];
  readonly commandCenter: SocCommandCenterStatus;
  readonly cameraWallTileCount: number;
  readonly liveMapAssetCount: number;
  readonly eventTimelineCount: number;
  readonly incidentCount: number;
  readonly videoBookmarkCount: number;
  readonly quoteSummary: SocQuoteSummary;
  readonly capabilities: {
    readonly cameraWall: true;
    readonly alarmStatus: true;
    readonly doorStatus: true;
    readonly sensorStatus: true;
    readonly networkStatus: true;
    readonly powerStatus: true;
    readonly liveMap: true;
    readonly eventTimeline: true;
    readonly playback: true;
    readonly snapshot: true;
    readonly timeline: true;
    readonly bookmarks: true;
    readonly everyEventBecomesIncident: true;
  };
  readonly constraints: {
    readonly externalQuotationEngine: "untouched";
    readonly api: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly aiAnalysis: "excluded";
  };
}
