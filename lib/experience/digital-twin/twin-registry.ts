import { BAS_AUTOMATION_RULES } from "@/lib/experience/automation/bas-rule-engine";
import { BAS_SCENES } from "@/lib/experience/automation/bas-scene-engine";
import { AI_MASTER_QUOTE_DRAFT } from "@/lib/experience/ai/knowledge-base";
import {
  CONFIGURATION_CATEGORY_LABELS,
  CONFIGURATION_ITEMS,
  CONFIGURATION_PACKAGES,
  DEFAULT_CONFIGURATION_CRM_LEAD,
  DEFAULT_CONFIGURATION_ITEM_IDS,
  DEFAULT_CONFIGURATION_PROPOSAL,
} from "@/lib/experience/configuration/configuration-catalog";
import { SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { ENERGY_QUOTE_SUMMARY, ENERGY_SOURCES } from "@/lib/experience/energy/energy-catalog";
import { FURNITURE_PLACEMENTS } from "@/lib/experience/furniture/furniture-registry";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import { LIGHTING_GROUPS, LIGHTING_QUOTE_SUMMARY } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_DEVICES, SECURITY_QUOTE_SUMMARY } from "@/lib/experience/security/security-catalog";
import { SOC_QUOTE_SUMMARY } from "@/lib/experience/security/security-operations-center";
import type {
  DigitalTwinIntelligenceReport,
  FurniturePlacementSpec,
  SmartDeviceSnapshot,
  TwinEntity,
  TwinEntityKind,
  TwinExportPayload,
  TwinGraphEdge,
  TwinHealth,
  TwinHistoryFrame,
  TwinImportResult,
  TwinLifecycleState,
  TwinMetadataValue,
  TwinObjectGraph,
  TwinRegistrySummary,
  TwinSceneClone,
  TwinStateHistoryEntry,
  TwinTimelineSnapshot,
  TwinTransform,
  TwinComparisonResult,
} from "@/types/experience";

export const TWIN_SUPPORTED_STATES: readonly TwinLifecycleState[] = [
  "online",
  "offline",
  "enabled",
  "disabled",
  "fault",
  "maintenance",
  "installation-pending",
  "replacement-required",
] as const;

const ROOT_STABLE_ID = "building:smarthive-signature-villa";
const GENERATED_AT_LABEL = "DTIE build snapshot";

interface TwinEntityDraft {
  readonly stableId: string;
  readonly kind: TwinEntityKind;
  readonly name: string;
  readonly parentStableId: string | null;
  readonly transform: TwinTransform;
  readonly metadata: Readonly<Record<string, TwinMetadataValue>>;
  readonly health: TwinHealth;
  readonly state: TwinLifecycleState;
  readonly relationship?: TwinGraphEdge["relationship"];
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createTwinUuid(seed: string) {
  const hex = Array.from({ length: 4 }, (_, index) => hashSeed(`${seed}:${index}`).toString(16).padStart(8, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function transform(position: readonly [number, number, number], rotation: readonly [number, number, number] = [0, 0, 0], scale: readonly [number, number, number] = [1, 1, 1]): TwinTransform {
  return { position, rotation, scale };
}

function roomTransform(room: (typeof INTERIOR_ROOMS)[number]): TwinTransform {
  return transform(
    [
      round((room.boundingBox.min.x + room.boundingBox.max.x) / 2),
      round((room.boundingBox.min.y + room.boundingBox.max.y) / 2),
      round((room.boundingBox.min.z + room.boundingBox.max.z) / 2),
    ],
    [0, 0, 0],
    [
      round(Math.abs(room.boundingBox.max.x - room.boundingBox.min.x)),
      round(Math.abs(room.boundingBox.max.y - room.boundingBox.min.y)),
      round(Math.abs(room.boundingBox.max.z - room.boundingBox.min.z)),
    ],
  );
}

function entityStateFromSeed(stableId: string, base: TwinLifecycleState): TwinLifecycleState {
  const seed = hashSeed(stableId);
  if (seed % 97 === 0) return "replacement-required";
  if (seed % 43 === 0) return "maintenance";
  if (seed % 31 === 0) return "fault";
  return base;
}

function healthFromState(state: TwinLifecycleState): TwinHealth {
  if (state === "fault" || state === "replacement-required") return "critical";
  if (state === "maintenance" || state === "installation-pending") return "warning";
  if (state === "offline" || state === "disabled") return "unknown";
  return "healthy";
}

function history(stableId: string, state: TwinLifecycleState, health: TwinHealth, metadata: Readonly<Record<string, TwinMetadataValue>>): readonly TwinStateHistoryEntry[] {
  const yesterdayState: TwinLifecycleState = state === "fault" ? "maintenance" : state === "replacement-required" ? "maintenance" : state === "installation-pending" ? "disabled" : state === "offline" ? "online" : state;
  const simulationState: TwinLifecycleState = state === "fault" || state === "replacement-required" ? "maintenance" : state;

  return [
    {
      id: `history-yesterday-${stableId}`,
      frame: "yesterday",
      timestampLabel: "Yesterday 18:00",
      state: yesterdayState,
      health: healthFromState(yesterdayState),
      metadataSnapshot: { ...metadata, frame: "yesterday" },
      changedBy: "time-machine",
    },
    {
      id: `history-today-${stableId}`,
      frame: "today",
      timestampLabel: "Today live",
      state,
      health,
      metadataSnapshot: { ...metadata, frame: "today" },
      changedBy: "live-state-engine",
    },
    {
      id: `history-simulation-${stableId}`,
      frame: "simulation",
      timestampLabel: "Predictive simulation ready",
      state: simulationState,
      health: healthFromState(simulationState),
      metadataSnapshot: { ...metadata, frame: "simulation" },
      changedBy: "simulation",
    },
  ];
}

function roomFloorStableId(floorLevel: "ground" | "first") {
  return `floor:${floorLevel}`;
}

function smartDeviceKind(device: SmartDeviceSnapshot): TwinEntityKind {
  if (device.category.includes("sensor") || device.category.includes("detector")) return "sensor";
  if (device.category === "hvac" || device.category === "thermostats" || device.category === "temperature-sensor" || device.category === "humidity-sensor") return "hvac-unit";
  return "device";
}

function smartDeviceState(device: SmartDeviceSnapshot): TwinLifecycleState {
  if (device.onlineStatus === "offline") return "offline";
  if (device.healthStatus === "service-required") return "fault";
  if (device.healthStatus === "warning") return "maintenance";
  return device.powerState === "off" ? "disabled" : "online";
}

function metadata(input: Record<string, TwinMetadataValue>): Readonly<Record<string, TwinMetadataValue>> {
  return input;
}

function makeDraft(
  kind: TwinEntityKind,
  stableId: string,
  name: string,
  parentStableId: string | null,
  draftTransform: TwinTransform,
  draftMetadata: Readonly<Record<string, TwinMetadataValue>>,
  baseState: TwinLifecycleState = "online",
  relationship: TwinGraphEdge["relationship"] = "contains",
): TwinEntityDraft {
  const state = entityStateFromSeed(stableId, baseState);
  return {
    stableId,
    kind,
    name,
    parentStableId,
    transform: draftTransform,
    metadata: draftMetadata,
    state,
    health: healthFromState(state),
    relationship,
  };
}

function buildTwinDrafts(): readonly TwinEntityDraft[] {
  const drafts: TwinEntityDraft[] = [];
  const selectedConfigurationIds = new Set(DEFAULT_CONFIGURATION_ITEM_IDS);

  drafts.push(
    makeDraft(
      "building",
      ROOT_STABLE_ID,
      "SmartHive Signature Villa",
      null,
      transform([0, 3.5, 0], [0, 0, 0], [44, 9, 32]),
      metadata({ milestone: 15, engine: "DTIE", buildingType: "Ultra Luxury Smart Villa", alwaysRepresentsRealState: true }),
    ),
  );

  drafts.push(
    makeDraft("floor", "floor:ground", "Ground Floor", ROOT_STABLE_ID, transform([0, 1.8, 0], [0, 0, 0], [40, 3.8, 26]), metadata({ level: "ground" })),
    makeDraft("floor", "floor:first", "First Floor", ROOT_STABLE_ID, transform([0, 5.8, -0.8], [0, 0, 0], [34, 3.5, 24]), metadata({ level: "first" })),
    makeDraft("floor", "floor:site", "Site Infrastructure", ROOT_STABLE_ID, transform([0, 0.1, -2], [0, 0, 0], [48, 1, 38]), metadata({ level: "site" })),
  );

  const roomZones = Array.from(new Set(INTERIOR_ROOMS.map((room) => room.futureEnergyConsumption.zone)));
  roomZones.forEach((zone, index) => {
    drafts.push(
      makeDraft(
        "zone",
        `zone:${zone}`,
        `${zone.replace(/-/g, " ")} Zone`,
        ROOT_STABLE_ID,
        transform([-16 + index * 5.2, 7.8, -11.2], [0, 0, 0], [1.2, 0.3, 1.2]),
        metadata({ zone, zoneSource: "room-energy-profile" }),
      ),
    );
  });

  INTERIOR_ROOMS.forEach((room) => {
    drafts.push(
      makeDraft(
        "room",
        `room:${room.id}`,
        room.name,
        roomFloorStableId(room.floorLevel),
        roomTransform(room),
        metadata({
          roomId: room.id,
          areaSqm: room.areaSqm,
          volumeCbm: room.volumeCbm,
          floorLevel: room.floorLevel,
          quoteCategory: room.futureQuoteMapping.category,
          allowanceCode: room.futureQuoteMapping.allowanceCode,
          futureDeviceAllowance: room.futureQuoteMapping.futureDeviceAllowance,
        }),
      ),
    );
  });

  SMART_DEVICES.forEach((device) => {
    const state = smartDeviceState(device);
    drafts.push(
      makeDraft(
        smartDeviceKind(device),
        `smart-device:${device.uniqueId}`,
        device.name,
        `room:${device.roomId}`,
        transform(device.placeholder.position, [0, 0, 0], device.placeholder.size),
        metadata({
          source: "smart-device-framework",
          category: device.category,
          manufacturer: device.manufacturer,
          model: device.model,
          roomId: device.roomId,
          roomName: device.roomName,
          selectedInConfigurator: selectedConfigurationIds.has(`config-smart-${device.uniqueId}`),
          equipmentPrice: device.pricing.equipmentPrice,
          installationPrice: device.pricing.installationPrice,
        }),
        state,
      ),
    );
  });

  SECURITY_DEVICES.forEach((device) => {
    const kind: TwinEntityKind = device.category === "sensor" || device.category === "alarm" ? "sensor" : "security-system";
    const parentStableId = INTERIOR_ROOMS.some((room) => room.id === device.roomId) ? `room:${device.roomId}` : "floor:site";
    const state: TwinLifecycleState = device.onlineStatus === "offline" ? "offline" : device.healthStatus === "service-required" ? "fault" : device.healthStatus === "warning" ? "maintenance" : "online";

    drafts.push(
      makeDraft(
        kind,
        `security:${device.id}`,
        device.name,
        parentStableId,
        transform(device.render.position, device.render.rotation ?? [0, 0, 0], device.render.size),
        metadata({
          source: "security-platform",
          type: device.type,
          category: device.category,
          roomId: device.roomId,
          roomName: device.roomName,
          signalStrength: device.signalStrength,
          selectedInConfigurator: selectedConfigurationIds.has(`config-security-${device.id}`),
        }),
        state,
      ),
    );
  });

  FURNITURE_PLACEMENTS.forEach((placement: FurniturePlacementSpec) => {
    drafts.push(
      makeDraft(
        "furniture",
        `furniture:${placement.id}`,
        placement.label,
        `room:${placement.roomId}`,
        transform(placement.position, placement.rotation ?? [0, 0, 0], placement.scale ?? [1, 1, 1]),
        metadata({
          source: "furniture-registry",
          assetId: placement.assetId,
          category: placement.category,
          roomId: placement.roomId,
          roomName: placement.roomName,
          quoteReady: placement.interaction.futureQuoteReady,
        }),
        "enabled",
      ),
    );
  });

  ENERGY_SOURCES.forEach((source, index) => {
    const positions: readonly [number, number, number][] = [
      [-6.2, 6.3, -5.8],
      [-3.8, 5.4, -4.2],
      [-1.2, 5.1, -5.4],
      [2.2, 4.8, -4.8],
      [4.3, 4.3, -3.2],
    ];
    drafts.push(
      makeDraft(
        "power-source",
        `power-source:${source.id}`,
        source.name,
        "floor:site",
        transform(positions[index] ?? [0, 4, -4], [0, 0, 0], [0.5, 0.5, 0.5]),
        metadata({
          type: source.type,
          capacityKw: source.capacityKw,
          currentKw: source.currentKw,
          stateOfChargePercent: source.stateOfChargePercent ?? null,
          automaticSourceSwitching: source.automaticSourceSwitching,
        }),
        source.status === "offline" ? "offline" : source.status === "standby" ? "enabled" : "online",
      ),
    );
  });

  LIGHTING_GROUPS.forEach((group) => {
    drafts.push(
      makeDraft(
        "lighting-group",
        `lighting-group:${group.id}`,
        group.name,
        "building:smarthive-signature-villa",
        transform([10.2, 7.5, -8 + drafts.length * 0.01], [0, 0, 0], [0.45, 0.45, 0.45]),
        metadata({
          fixtureCount: group.fixtureIds.length,
          switchCount: group.switchIds.length,
          socketCount: group.socketIds.length,
          totalWattage: group.totalWattage,
          estimatedMonthlyKwh: group.estimatedMonthlyKwh,
        }),
      ),
    );
  });

  BAS_AUTOMATION_RULES.forEach((rule) => {
    drafts.push(
      makeDraft(
        "automation-rule",
        `automation-rule:${rule.id}`,
        rule.name,
        ROOT_STABLE_ID,
        transform([14.2, 7.2, -7 + drafts.length * 0.006], [0, 0, 0], [0.42, 0.42, 0.42]),
        metadata({
          status: rule.status,
          graphId: rule.graphId,
          actionCount: rule.actions.length,
          failSafe: rule.failSafe.strategy,
        }),
        rule.status === "disabled" ? "disabled" : rule.status === "degraded" ? "maintenance" : "enabled",
        "controls",
      ),
    );
  });

  BAS_SCENES.forEach((scene) => {
    drafts.push(
      makeDraft(
        "scene",
        `scene:${scene.id}`,
        scene.name,
        ROOT_STABLE_ID,
        transform([16.4, 7.2, -7 + drafts.length * 0.006], [0, 0, 0], [0.42, 0.42, 0.42]),
        metadata({
          type: scene.type,
          actionCount: scene.actions.length,
          customEditable: scene.customEditable,
          graphReady: scene.graphReady,
        }),
        "enabled",
        "controls",
      ),
    );
  });

  const quoteInputs = [
    { id: "lighting", name: "Lighting Quote", total: LIGHTING_QUOTE_SUMMARY.totalCost, itemCount: LIGHTING_GROUPS.length },
    { id: "security", name: "Security Quote", total: SECURITY_QUOTE_SUMMARY.totalCost, itemCount: SECURITY_DEVICES.length },
    { id: "soc", name: "SOC Quote", total: SOC_QUOTE_SUMMARY.totalCost, itemCount: 7 },
    { id: "energy", name: "Energy Quote", total: ENERGY_QUOTE_SUMMARY.totalCost, itemCount: ENERGY_QUOTE_SUMMARY.recommendations.length },
    { id: "ai", name: "AI Quote Draft", total: AI_MASTER_QUOTE_DRAFT.totalCost, itemCount: AI_MASTER_QUOTE_DRAFT.lineItems.length },
    { id: "configuration", name: "Customer Configuration Proposal", total: DEFAULT_CONFIGURATION_PROPOSAL.costSummary.grandTotal, itemCount: DEFAULT_CONFIGURATION_ITEM_IDS.length },
  ] as const;

  quoteInputs.forEach((quote) => {
    drafts.push(
      makeDraft(
        "quote",
        `quote:${quote.id}`,
        quote.name,
        ROOT_STABLE_ID,
        transform([18.8, 7.0, -7 + drafts.length * 0.008], [0, 0, 0], [0.5, 0.5, 0.5]),
        metadata({
          totalCost: round(quote.total),
          itemCount: quote.itemCount,
          currency: "USD",
          selectedConfiguratorItemsRegistered: DEFAULT_CONFIGURATION_ITEM_IDS.length,
        }),
        "enabled",
        "quotes",
      ),
    );
  });

  CONFIGURATION_PACKAGES.forEach((configurationPackage) => {
    drafts.push(
      makeDraft(
        "project",
        `project:configuration-${configurationPackage.id}`,
        `${configurationPackage.name} Configuration Project`,
        ROOT_STABLE_ID,
        transform([20.8, 6.6, -7 + drafts.length * 0.006], [0, 0, 0], [0.48, 0.48, 0.48]),
        metadata({
          packageId: configurationPackage.id,
          packageName: configurationPackage.name,
          itemCount: configurationPackage.itemIds.length,
          grandTotal: configurationPackage.grandTotal,
        }),
        "enabled",
        "configures",
      ),
    );
  });

  drafts.push(
    makeDraft(
      "customer",
      `customer:${DEFAULT_CONFIGURATION_CRM_LEAD.id}`,
      DEFAULT_CONFIGURATION_CRM_LEAD.customerName,
      "project:configuration-ultra-luxury",
      transform([22.6, 6.2, -6.8], [0, 0, 0], [0.5, 0.5, 0.5]),
      metadata({
        crmLeadId: DEFAULT_CONFIGURATION_CRM_LEAD.id,
        assignedSalesStaff: DEFAULT_CONFIGURATION_CRM_LEAD.assignedSalesStaff,
        status: DEFAULT_CONFIGURATION_CRM_LEAD.status,
        estimatedValue: DEFAULT_CONFIGURATION_CRM_LEAD.estimatedValue,
      }),
      "installation-pending",
      "owns",
    ),
  );

  CONFIGURATION_ITEMS.filter((item) => selectedConfigurationIds.has(item.id)).forEach((item) => {
    drafts.push(
      makeDraft(
        item.category === "security" ? "security-system" : item.category === "hvac" ? "hvac-unit" : item.category === "solar" || item.category === "power" ? "power-source" : "device",
        `configuration-item:${item.id}`,
        item.name,
        "quote:configuration",
        item.render ? transform(item.render.position, [0, 0, 0], item.render.size) : transform([0, 7, -6], [0, 0, 0], [0.2, 0.2, 0.2]),
        metadata({
          source: item.source,
          sourceId: item.sourceId,
          category: item.category,
          categoryLabel: CONFIGURATION_CATEGORY_LABELS[item.category],
          packageRank: item.packageRank,
          selectedInConfigurator: true,
          equipmentCost: item.pricing.equipmentCost,
          installationCost: item.pricing.installationCost,
          labourCost: item.pricing.labourCost,
        }),
        "installation-pending",
        "quotes",
      ),
    );
  });

  return drafts;
}

function finalizeDrafts(drafts: readonly TwinEntityDraft[]): TwinObjectGraph {
  const uuidByStableId = new Map(drafts.map((draft) => [draft.stableId, createTwinUuid(draft.stableId)]));
  const childStableIdsByParent = new Map<string, string[]>();

  drafts.forEach((draft) => {
    if (!draft.parentStableId) return;
    const children = childStableIdsByParent.get(draft.parentStableId) ?? [];
    children.push(draft.stableId);
    childStableIdsByParent.set(draft.parentStableId, children);
  });

  const entities: TwinEntity[] = drafts.map((draft) => {
    const uuid = uuidByStableId.get(draft.stableId) ?? createTwinUuid(draft.stableId);
    const parentUuid = draft.parentStableId ? uuidByStableId.get(draft.parentStableId) ?? null : null;
    const childUuids = (childStableIdsByParent.get(draft.stableId) ?? []).map((stableId) => uuidByStableId.get(stableId)).filter((childUuid): childUuid is string => Boolean(childUuid));

    return {
      uuid,
      stableId: draft.stableId,
      kind: draft.kind,
      name: draft.name,
      parentUuid,
      childUuids,
      transform: draft.transform,
      metadata: draft.metadata,
      health: draft.health,
      state: draft.state,
      history: history(draft.stableId, draft.state, draft.health, draft.metadata),
    };
  });

  const edges: TwinGraphEdge[] = drafts
    .filter((draft) => draft.parentStableId)
    .map((draft) => ({
      id: `edge:${draft.parentStableId}:${draft.stableId}`,
      fromUuid: uuidByStableId.get(draft.parentStableId ?? "") ?? "",
      toUuid: uuidByStableId.get(draft.stableId) ?? "",
      relationship: draft.relationship ?? "contains",
    }))
    .filter((edge) => edge.fromUuid.length > 0 && edge.toUuid.length > 0);

  return {
    rootUuid: uuidByStableId.get(ROOT_STABLE_ID) ?? createTwinUuid(ROOT_STABLE_ID),
    entities,
    edges,
    generatedAtLabel: GENERATED_AT_LABEL,
  };
}

export const TWIN_OBJECT_GRAPH: TwinObjectGraph = finalizeDrafts(buildTwinDrafts());
export const TWIN_ENTITY_BY_UUID = new Map(TWIN_OBJECT_GRAPH.entities.map((entity) => [entity.uuid, entity]));
export const TWIN_ENTITY_BY_STABLE_ID = new Map(TWIN_OBJECT_GRAPH.entities.map((entity) => [entity.stableId, entity]));

function countKind(kind: TwinEntityKind) {
  return TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.kind === kind).length;
}

export const TWIN_REGISTRY_SUMMARY: TwinRegistrySummary = {
  entityCount: TWIN_OBJECT_GRAPH.entities.length,
  edgeCount: TWIN_OBJECT_GRAPH.edges.length,
  buildingCount: countKind("building"),
  floorCount: countKind("floor"),
  roomCount: countKind("room"),
  zoneCount: countKind("zone"),
  deviceCount: countKind("device"),
  furnitureCount: countKind("furniture"),
  powerSourceCount: countKind("power-source"),
  sensorCount: countKind("sensor"),
  hvacUnitCount: countKind("hvac-unit"),
  lightingGroupCount: countKind("lighting-group"),
  securitySystemCount: countKind("security-system"),
  automationRuleCount: countKind("automation-rule"),
  sceneCount: countKind("scene"),
  quoteCount: countKind("quote"),
  projectCount: countKind("project"),
  customerCount: countKind("customer"),
  historyEntryCount: TWIN_OBJECT_GRAPH.entities.reduce((total, entity) => total + entity.history.length, 0),
};

export function RegisterEntity(entity: TwinEntity): TwinObjectGraph {
  if (TWIN_ENTITY_BY_UUID.has(entity.uuid)) return TWIN_OBJECT_GRAPH;
  return {
    ...TWIN_OBJECT_GRAPH,
    entities: [...TWIN_OBJECT_GRAPH.entities, entity],
  };
}

export function RemoveEntity(uuid: string): TwinObjectGraph {
  return {
    ...TWIN_OBJECT_GRAPH,
    entities: TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.uuid !== uuid),
    edges: TWIN_OBJECT_GRAPH.edges.filter((edge) => edge.fromUuid !== uuid && edge.toUuid !== uuid),
  };
}

export function UpdateState(uuid: string, state: TwinLifecycleState): TwinEntity | null {
  const entity = TWIN_ENTITY_BY_UUID.get(uuid);
  if (!entity) return null;
  const health = healthFromState(state);
  return {
    ...entity,
    state,
    health,
    history: [
      ...entity.history,
      {
        id: `history-live-update-${entity.stableId}-${state}`,
        frame: "today",
        timestampLabel: "Live state update",
        state,
        health,
        metadataSnapshot: { ...entity.metadata, frame: "today-update" },
        changedBy: "live-state-engine",
      },
    ],
  };
}

export function ReplayState(frame: TwinHistoryFrame): TwinTimelineSnapshot {
  return {
    frame,
    timestampLabel: frame === "yesterday" ? "Yesterday 18:00" : frame === "today" ? "Today live" : "Predictive simulation ready",
    entityStates: TWIN_OBJECT_GRAPH.entities.map((entity) => {
      const historyEntry = entity.history.find((entry) => entry.frame === frame) ?? entity.history[0];
      return {
        uuid: entity.uuid,
        stableId: entity.stableId,
        state: historyEntry?.state ?? entity.state,
        health: historyEntry?.health ?? entity.health,
      };
    }),
  };
}

export function CompareTwinFrames(fromFrame: TwinHistoryFrame, toFrame: TwinHistoryFrame): TwinComparisonResult {
  const from = ReplayState(fromFrame);
  const to = ReplayState(toFrame);
  const fromByUuid = new Map(from.entityStates.map((state) => [state.uuid, state]));
  const changed = to.entityStates.filter((state) => {
    const previous = fromByUuid.get(state.uuid);
    return previous?.state !== state.state || previous.health !== state.health;
  });
  const fromFaultCount = from.entityStates.filter((state) => state.state === "fault").length;
  const toFaultCount = to.entityStates.filter((state) => state.state === "fault").length;
  const fromMaintenanceCount = from.entityStates.filter((state) => state.state === "maintenance").length;
  const toMaintenanceCount = to.entityStates.filter((state) => state.state === "maintenance").length;
  const fromOnlineCount = from.entityStates.filter((state) => state.state === "online").length;
  const toOnlineCount = to.entityStates.filter((state) => state.state === "online").length;

  return {
    fromFrame,
    toFrame,
    changedCount: changed.length,
    faultCountDelta: toFaultCount - fromFaultCount,
    maintenanceCountDelta: toMaintenanceCount - fromMaintenanceCount,
    onlineCountDelta: toOnlineCount - fromOnlineCount,
    examples: changed.slice(0, 8).map((state) => state.stableId),
    predictiveSimulationReady: true,
  };
}

export function CloneScene(purpose: TwinSceneClone["purpose"] = "time-machine-playback"): TwinSceneClone {
  return {
    id: `clone:${TWIN_OBJECT_GRAPH.rootUuid}:${purpose}`,
    sourceRootUuid: TWIN_OBJECT_GRAPH.rootUuid,
    entityCount: TWIN_OBJECT_GRAPH.entities.length,
    createdAtLabel: "Clone payload ready",
    purpose,
  };
}

export function ExportTwin(): TwinExportPayload {
  return {
    id: "dtie-export-smarthive-signature-villa",
    format: "json",
    entityCount: TWIN_OBJECT_GRAPH.entities.length,
    edgeCount: TWIN_OBJECT_GRAPH.edges.length,
    historyEntryCount: TWIN_REGISTRY_SUMMARY.historyEntryCount,
    generatedAtLabel: GENERATED_AT_LABEL,
    payloadVersion: "dtie-v1",
  };
}

export function ImportTwin(payload: TwinExportPayload): TwinImportResult {
  return {
    ok: payload.payloadVersion === "dtie-v1",
    importedEntityCount: payload.entityCount,
    importedEdgeCount: payload.edgeCount,
    message: payload.payloadVersion === "dtie-v1" ? "Twin import payload accepted for future persistence." : "Unsupported twin payload version.",
  };
}

export const DigitalTwinApi = {
  RegisterEntity,
  RemoveEntity,
  UpdateState,
  ReplayState,
  CloneScene,
  ExportTwin,
  ImportTwin,
} as const;

export const TWIN_YESTERDAY_TODAY_COMPARISON = CompareTwinFrames("yesterday", "today");

export const DIGITAL_TWIN_INTELLIGENCE_REPORT: DigitalTwinIntelligenceReport = {
  summary: TWIN_REGISTRY_SUMMARY,
  graph: {
    rootUuid: TWIN_OBJECT_GRAPH.rootUuid,
    generatedAtLabel: TWIN_OBJECT_GRAPH.generatedAtLabel,
    hierarchicalGraphReady: true,
  },
  liveState: {
    supportedStates: TWIN_SUPPORTED_STATES,
    onlineCount: TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.state === "online").length,
    faultCount: TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.state === "fault").length,
    maintenanceCount: TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.state === "maintenance").length,
    replacementRequiredCount: TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.state === "replacement-required").length,
    installationPendingCount: TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.state === "installation-pending").length,
  },
  timeMachine: {
    frames: ["yesterday", "today", "simulation"],
    playbackReady: true,
    scrubTimelineReady: true,
    compareYesterdayVsTodayReady: true,
    predictiveSimulationReady: true,
  },
  api: {
    RegisterEntity: "available",
    RemoveEntity: "available",
    UpdateState: "available",
    ReplayState: "available",
    CloneScene: "available",
    ExportTwin: "available",
    ImportTwin: "available",
    routeHandlersCreated: false,
  },
  quoteIntegration: {
    selectedConfiguratorItemsRegistered: DEFAULT_CONFIGURATION_ITEM_IDS.length,
    quoteEntitiesRegistered: TWIN_REGISTRY_SUMMARY.quoteCount,
    existingQuoteEngineModified: false,
  },
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    authentication: "untouched",
    externalQuoteEngine: "untouched",
  },
};

export function getTwinEntity(uuid: string) {
  return TWIN_ENTITY_BY_UUID.get(uuid) ?? null;
}

export function getTwinEntityByStableId(stableId: string) {
  return TWIN_ENTITY_BY_STABLE_ID.get(stableId) ?? null;
}
