export type TwinEntityKind =
  | "building"
  | "floor"
  | "room"
  | "zone"
  | "device"
  | "furniture"
  | "power-source"
  | "sensor"
  | "hvac-unit"
  | "lighting-group"
  | "security-system"
  | "automation-rule"
  | "scene"
  | "quote"
  | "project"
  | "customer";

export type TwinLifecycleState =
  | "online"
  | "offline"
  | "enabled"
  | "disabled"
  | "fault"
  | "maintenance"
  | "installation-pending"
  | "replacement-required";

export type TwinHealth = "healthy" | "warning" | "critical" | "unknown";
export type TwinHistoryFrame = "yesterday" | "today" | "simulation";

export interface TwinTransform {
  readonly position: readonly [number, number, number];
  readonly rotation: readonly [number, number, number];
  readonly scale: readonly [number, number, number];
}

export type TwinMetadataValue = string | number | boolean | null;

export interface TwinStateHistoryEntry {
  readonly id: string;
  readonly frame: TwinHistoryFrame;
  readonly timestampLabel: string;
  readonly state: TwinLifecycleState;
  readonly health: TwinHealth;
  readonly metadataSnapshot: Readonly<Record<string, TwinMetadataValue>>;
  readonly changedBy: "dtie-registry" | "live-state-engine" | "time-machine" | "simulation";
}

export interface TwinEntity {
  readonly uuid: string;
  readonly stableId: string;
  readonly kind: TwinEntityKind;
  readonly name: string;
  readonly parentUuid: string | null;
  readonly childUuids: readonly string[];
  readonly transform: TwinTransform;
  readonly metadata: Readonly<Record<string, TwinMetadataValue>>;
  readonly health: TwinHealth;
  readonly state: TwinLifecycleState;
  readonly history: readonly TwinStateHistoryEntry[];
}

export interface TwinGraphEdge {
  readonly id: string;
  readonly fromUuid: string;
  readonly toUuid: string;
  readonly relationship: "contains" | "controls" | "monitors" | "quotes" | "owns" | "configures";
}

export interface TwinObjectGraph {
  readonly rootUuid: string;
  readonly entities: readonly TwinEntity[];
  readonly edges: readonly TwinGraphEdge[];
  readonly generatedAtLabel: string;
}

export interface TwinRegistrySummary {
  readonly entityCount: number;
  readonly edgeCount: number;
  readonly buildingCount: number;
  readonly floorCount: number;
  readonly roomCount: number;
  readonly zoneCount: number;
  readonly deviceCount: number;
  readonly furnitureCount: number;
  readonly powerSourceCount: number;
  readonly sensorCount: number;
  readonly hvacUnitCount: number;
  readonly lightingGroupCount: number;
  readonly securitySystemCount: number;
  readonly automationRuleCount: number;
  readonly sceneCount: number;
  readonly quoteCount: number;
  readonly projectCount: number;
  readonly customerCount: number;
  readonly historyEntryCount: number;
}

export interface TwinTimelineSnapshot {
  readonly frame: TwinHistoryFrame;
  readonly timestampLabel: string;
  readonly entityStates: readonly {
    readonly uuid: string;
    readonly stableId: string;
    readonly state: TwinLifecycleState;
    readonly health: TwinHealth;
  }[];
}

export interface TwinComparisonResult {
  readonly fromFrame: TwinHistoryFrame;
  readonly toFrame: TwinHistoryFrame;
  readonly changedCount: number;
  readonly faultCountDelta: number;
  readonly maintenanceCountDelta: number;
  readonly onlineCountDelta: number;
  readonly examples: readonly string[];
  readonly predictiveSimulationReady: true;
}

export interface TwinSceneClone {
  readonly id: string;
  readonly sourceRootUuid: string;
  readonly entityCount: number;
  readonly createdAtLabel: string;
  readonly purpose: "time-machine-playback" | "scenario-simulation" | "proposal-review";
}

export interface TwinExportPayload {
  readonly id: string;
  readonly format: "json";
  readonly entityCount: number;
  readonly edgeCount: number;
  readonly historyEntryCount: number;
  readonly generatedAtLabel: string;
  readonly payloadVersion: "dtie-v1";
}

export interface TwinImportResult {
  readonly ok: boolean;
  readonly importedEntityCount: number;
  readonly importedEdgeCount: number;
  readonly message: string;
}

export interface TwinApiSurface {
  readonly RegisterEntity: "available";
  readonly RemoveEntity: "available";
  readonly UpdateState: "available";
  readonly ReplayState: "available";
  readonly CloneScene: "available";
  readonly ExportTwin: "available";
  readonly ImportTwin: "available";
  readonly routeHandlersCreated: false;
}

export interface DigitalTwinIntelligenceReport {
  readonly summary: TwinRegistrySummary;
  readonly graph: {
    readonly rootUuid: string;
    readonly generatedAtLabel: string;
    readonly hierarchicalGraphReady: true;
  };
  readonly liveState: {
    readonly supportedStates: readonly TwinLifecycleState[];
    readonly onlineCount: number;
    readonly faultCount: number;
    readonly maintenanceCount: number;
    readonly replacementRequiredCount: number;
    readonly installationPendingCount: number;
  };
  readonly timeMachine: {
    readonly frames: readonly TwinHistoryFrame[];
    readonly playbackReady: true;
    readonly scrubTimelineReady: true;
    readonly compareYesterdayVsTodayReady: true;
    readonly predictiveSimulationReady: true;
  };
  readonly api: TwinApiSurface;
  readonly quoteIntegration: {
    readonly selectedConfiguratorItemsRegistered: number;
    readonly quoteEntitiesRegistered: number;
    readonly existingQuoteEngineModified: false;
  };
  readonly constraints: {
    readonly websiteFunctionality: "untouched";
    readonly apiRoutes: "untouched";
    readonly database: "untouched";
    readonly authentication: "untouched";
    readonly externalQuoteEngine: "untouched";
  };
}
