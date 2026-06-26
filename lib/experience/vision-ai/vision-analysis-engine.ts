import { TWIN_OBJECT_GRAPH, getTwinEntityByStableId } from "@/lib/experience/digital-twin/twin-registry";
import { CONFIGURATION_ITEMS } from "@/lib/experience/configuration/configuration-catalog";
import { INTERIOR_DOORS, INTERIOR_WINDOWS } from "@/lib/experience/interior/architectural-specs";
import { INTERIOR_ROOMS, getInteriorRoom } from "@/lib/experience/interior/room-registry";
import { ELECTRICAL_SOCKETS, ELECTRICAL_SWITCHES, LIGHTING_FIXTURES } from "@/lib/experience/lighting/lighting-catalog";
import type {
  InteriorRoom,
  TwinEntity,
  VisionAiReport,
  VisionCameraDetection,
  VisionDetectionKind,
  VisionImprovement,
  VisionInstalledItem,
  VisionMissingDeviceRecommendation,
  VisionPhotoImportContract,
  VisionQuoteDraft,
  VisionQuoteLineItem,
  VisionRating,
  VisionRecognitionCategory,
  VisionRecognitionResult,
  VisionRoomAnalysis,
  VisionScanMode,
} from "@/types/experience";

const SCANNED_AT_LABEL = "Vision AI live scan";
const DEFAULT_ROOM_ID = "gf-family-lounge";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function titleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function categoryFromEntity(entity: TwinEntity): VisionRecognitionCategory {
  if (entity.kind === "room") return "room";
  if (entity.kind === "furniture") return "furniture";
  if (entity.kind === "lighting-group") return "lighting";
  if (entity.kind === "security-system" || entity.stableId.startsWith("security:")) return "security";
  if (entity.kind === "power-source") return "power";
  if (entity.kind === "sensor") return entity.stableId.startsWith("security:") ? "security" : "device";
  return "device";
}

function confidenceFromCount(count: number, baseline = 2) {
  return round(Math.min(0.99, 0.78 + Math.min(count, 12) * 0.018 + baseline * 0.01));
}

function pointInRoom(point: readonly [number, number, number], room: InteriorRoom, tolerance = 0.24) {
  const [x, y, z] = point;
  return (
    x >= room.boundingBox.min.x - tolerance &&
    x <= room.boundingBox.max.x + tolerance &&
    y >= room.boundingBox.min.y - 0.8 &&
    y <= room.boundingBox.max.y + 0.8 &&
    z >= room.boundingBox.min.z - tolerance &&
    z <= room.boundingBox.max.z + tolerance
  );
}

function roomCenter(room: InteriorRoom): readonly [number, number, number] {
  return [
    round((room.boundingBox.min.x + room.boundingBox.max.x) / 2),
    round((room.boundingBox.min.y + room.boundingBox.max.y) / 2),
    round((room.boundingBox.min.z + room.boundingBox.max.z) / 2),
  ] as const;
}

function roomCorner(room: InteriorRoom): readonly [number, number, number] {
  return [round(room.boundingBox.max.x - 0.35), round(room.boundingBox.max.y - 0.42), round(room.boundingBox.max.z - 0.35)] as const;
}

function roomChildren(roomTwinUuid: string) {
  return TWIN_OBJECT_GRAPH.entities.filter((entity) => entity.parentUuid === roomTwinUuid);
}

function roomLighting(roomId: string) {
  return LIGHTING_FIXTURES.filter((fixture) => fixture.roomId === roomId);
}

function roomSwitches(roomId: string) {
  return ELECTRICAL_SWITCHES.filter((switchSpec) => switchSpec.roomId === roomId);
}

function roomSockets(roomId: string) {
  return ELECTRICAL_SOCKETS.filter((socket) => socket.roomId === roomId);
}

function roomDoors(room: InteriorRoom) {
  return INTERIOR_DOORS.filter((door) => pointInRoom(door.position, room));
}

function roomWindows(room: InteriorRoom) {
  return INTERIOR_WINDOWS.filter((windowSpec) => pointInRoom(windowSpec.position, room, 0.34));
}

function installedItems(children: readonly TwinEntity[]): readonly VisionInstalledItem[] {
  return children
    .filter((entity) => ["device", "sensor", "hvac-unit", "security-system", "furniture", "power-source"].includes(entity.kind))
    .map((entity) => ({
      id: `vision-installed-${entity.stableId}`,
      name: entity.name,
      category: categoryFromEntity(entity),
      twinUuid: entity.uuid,
      stableId: entity.stableId,
      state: entity.state,
      confidence: entity.health === "critical" ? 0.82 : entity.health === "warning" ? 0.89 : 0.96,
    }));
}

function installedCategoryCount(items: readonly VisionInstalledItem[], category: VisionRecognitionCategory) {
  return items.filter((item) => item.category === category).length;
}

function roomCategory(room: InteriorRoom) {
  return room.futureQuoteMapping.category;
}

function missingRecommendations(
  room: InteriorRoom,
  items: readonly VisionInstalledItem[],
  lightingCount: number,
  switchCount: number,
  socketCount: number,
): readonly VisionMissingDeviceRecommendation[] {
  const recommendations: VisionMissingDeviceRecommendation[] = [];
  const category = roomCategory(room);
  const securityCount = installedCategoryCount(items, "security");
  const deviceCount = installedCategoryCount(items, "device");
  const powerCount = installedCategoryCount(items, "power") + socketCount;
  const expectedLighting = Math.max(2, Math.ceil(room.areaSqm / 18));

  if (lightingCount < expectedLighting) {
    recommendations.push({
      id: `vision-missing-${room.id}-adaptive-lighting`,
      title: "Adaptive architectural lighting package",
      category: "lighting",
      reason: `${room.name} has ${lightingCount} detected fixtures against a ${expectedLighting} fixture visual target.`,
      priority: category === "living" || category === "kitchen" || category === "entry" ? "high" : "medium",
      equipmentCost: (expectedLighting - lightingCount) * 180,
      installationCost: (expectedLighting - lightingCount) * 120,
      labourCost: (expectedLighting - lightingCount) * 65,
      installationHours: round((expectedLighting - lightingCount) * 0.75, 1),
    });
  }

  if (securityCount < 2 && category !== "bathroom") {
    recommendations.push({
      id: `vision-missing-${room.id}-security-coverage`,
      title: "Vision-ready security coverage",
      category: "security",
      reason: `${room.name} has limited camera or sensor coverage for its visual risk profile.`,
      priority: category === "entry" || category === "office" || category === "bedroom" ? "high" : "medium",
      equipmentCost: 620,
      installationCost: 220,
      labourCost: 160,
      installationHours: 1.6,
    });
  }

  if (switchCount < 1 || powerCount < Math.max(2, Math.ceil(room.areaSqm / 22))) {
    recommendations.push({
      id: `vision-missing-${room.id}-electrical-points`,
      title: "Smart electrical point upgrade",
      category: "power",
      reason: `${room.name} needs more detectable smart sockets or switch points for configuration and energy mapping.`,
      priority: category === "kitchen" || category === "service" ? "high" : "medium",
      equipmentCost: 260,
      installationCost: 180,
      labourCost: 95,
      installationHours: 1.2,
    });
  }

  if (category === "bathroom" && !items.some((item) => item.name.toLowerCase().includes("leak") || item.name.toLowerCase().includes("humidity"))) {
    recommendations.push({
      id: `vision-missing-${room.id}-wet-area-sensors`,
      title: "Wet-area sensor pack",
      category: "security",
      reason: `${room.name} is a wet area and should expose leak and humidity points to the digital twin.`,
      priority: "high",
      equipmentCost: 106,
      installationCost: 83,
      labourCost: 56,
      installationHours: 0.9,
    });
  }

  if ((category === "living" || category === "bedroom" || category === "office") && deviceCount < 5) {
    recommendations.push({
      id: `vision-missing-${room.id}-comfort-context`,
      title: "Presence and comfort context package",
      category: "device",
      reason: `${room.name} needs richer occupancy, climate, and interaction context for future AI automation.`,
      priority: category === "bedroom" ? "high" : "medium",
      equipmentCost: 430,
      installationCost: 205,
      labourCost: 125,
      installationHours: 1.4,
    });
  }

  return recommendations;
}

function improvements(room: InteriorRoom, recommendations: readonly VisionMissingDeviceRecommendation[]): readonly VisionImprovement[] {
  const category = roomCategory(room);
  const base: VisionImprovement[] = [
    {
      id: `vision-improvement-${room.id}-calibration`,
      title: "Calibrate detected objects against DTIE graph",
      reason: "Align visual detections with live twin UUIDs before future predictive simulation.",
      impact: "resilience",
      costImpactUsd: 0,
    },
    {
      id: `vision-improvement-${room.id}-scene-context`,
      title: "Prepare visual scene context",
      reason: `Room category ${category} can feed future recommendations without external AI services.`,
      impact: category === "service" || category === "kitchen" ? "energy" : "comfort",
      costImpactUsd: 0,
    },
  ];

  return [
    ...base,
    ...recommendations.slice(0, 3).map((recommendation) => ({
      id: `vision-improvement-${recommendation.id}`,
      title: recommendation.title,
      reason: recommendation.reason,
      impact: recommendation.category === "security" ? "security" : recommendation.category === "power" ? "energy" : "luxury",
      costImpactUsd: recommendation.equipmentCost + recommendation.installationCost + recommendation.labourCost,
    }) satisfies VisionImprovement),
  ];
}

function recognitionResults(
  room: InteriorRoom,
  children: readonly TwinEntity[],
  installed: readonly VisionInstalledItem[],
  lightingCount: number,
  switchCount: number,
  socketCount: number,
  doorCount: number,
  windowCount: number,
): readonly VisionRecognitionResult[] {
  const countByCategory = (category: VisionRecognitionCategory) => installed.filter((item) => item.category === category);
  const furniture = countByCategory("furniture");
  const security = countByCategory("security");
  const devices = countByCategory("device");
  const power = countByCategory("power");

  return [
    {
      id: `vision-recognition-room-${room.id}`,
      category: "room",
      label: room.name,
      confidence: 0.99,
      count: 1,
      entityUuids: children.length > 0 ? [children[0]?.parentUuid ?? ""] : [],
      evidence: [`${room.areaSqm} sqm`, `${room.floorLevel} floor`, `${doorCount} doors`, `${windowCount} windows`],
    },
    {
      id: `vision-recognition-furniture-${room.id}`,
      category: "furniture",
      label: "Furniture",
      confidence: confidenceFromCount(furniture.length, 3),
      count: furniture.length,
      entityUuids: furniture.map((item) => item.twinUuid),
      evidence: furniture.slice(0, 4).map((item) => item.name),
    },
    {
      id: `vision-recognition-lighting-${room.id}`,
      category: "lighting",
      label: "Lighting and electrical",
      confidence: confidenceFromCount(lightingCount + switchCount + socketCount, 2),
      count: lightingCount + switchCount + socketCount,
      entityUuids: [],
      evidence: [`${lightingCount} fixtures`, `${switchCount} switches`, `${socketCount} sockets`],
    },
    {
      id: `vision-recognition-security-${room.id}`,
      category: "security",
      label: "Security endpoints",
      confidence: confidenceFromCount(security.length, 1),
      count: security.length,
      entityUuids: security.map((item) => item.twinUuid),
      evidence: security.slice(0, 4).map((item) => item.name),
    },
    {
      id: `vision-recognition-devices-${room.id}`,
      category: "device",
      label: "Smart devices",
      confidence: confidenceFromCount(devices.length, 2),
      count: devices.length,
      entityUuids: devices.map((item) => item.twinUuid),
      evidence: devices.slice(0, 4).map((item) => item.name),
    },
    {
      id: `vision-recognition-power-${room.id}`,
      category: "power",
      label: "Power and energy points",
      confidence: confidenceFromCount(power.length + socketCount, 1),
      count: power.length + socketCount,
      entityUuids: power.map((item) => item.twinUuid),
      evidence: [`${socketCount} sockets`, `${power.length} power-source entities`],
    },
    {
      id: `vision-recognition-object-${room.id}`,
      category: "object",
      label: "Architectural objects",
      confidence: confidenceFromCount(doorCount + windowCount + children.length, 2),
      count: doorCount + windowCount + children.length,
      entityUuids: children.map((entity) => entity.uuid),
      evidence: [`${children.length} twin children`, `${doorCount} doors`, `${windowCount} windows`],
    },
  ];
}

function detection(
  room: InteriorRoom,
  kind: VisionDetectionKind,
  label: string,
  position: readonly [number, number, number],
  confidence: number,
  index: number,
): VisionCameraDetection {
  return {
    id: `vision-detection-${room.id}-${kind}-${index}`,
    kind,
    label,
    position,
    confidence,
    futureModelReady: true,
  };
}

function cameraDetections(room: InteriorRoom, children: readonly TwinEntity[]): readonly VisionCameraDetection[] {
  const detections: VisionCameraDetection[] = [];
  const doors = roomDoors(room);
  const windows = roomWindows(room);

  doors.forEach((door, index) => detections.push(detection(room, "door", titleCase(door.type), door.position, 0.95, index)));
  windows.forEach((windowSpec, index) => detections.push(detection(room, "window", titleCase(windowSpec.type), windowSpec.position, 0.94, index)));
  children
    .filter((entity) => entity.kind === "furniture")
    .slice(0, 8)
    .forEach((entity, index) => detections.push(detection(room, "furniture", entity.name, entity.transform.position, 0.91, index)));
  roomSockets(room.id).forEach((socket, index) => detections.push(detection(room, "electrical-point", socket.name, socket.position, 0.93, index)));
  roomSwitches(room.id).forEach((switchSpec, index) => detections.push(detection(room, "electrical-point", switchSpec.name, switchSpec.position, 0.92, index + 100)));
  roomLighting(room.id).forEach((fixture, index) => detections.push(detection(room, "lighting", fixture.name, fixture.render.position, 0.94, index)));
  detections.push(detection(room, "camera-location", `Recommended camera view for ${room.name}`, roomCorner(room), 0.88, 0));
  detections.push(detection(room, "sensor-location", `Recommended ceiling sensor for ${room.name}`, roomCenter(room), 0.9, 0));

  return detections;
}

function quoteDraft(room: InteriorRoom, recommendations: readonly VisionMissingDeviceRecommendation[]): VisionQuoteDraft {
  const recommendationLineItems: VisionQuoteLineItem[] = recommendations.map((recommendation) => {
    const totalCost = round(recommendation.equipmentCost + recommendation.installationCost + recommendation.labourCost);

    return {
      id: `vision-quote-line-${recommendation.id}`,
      name: recommendation.title,
      category: recommendation.category,
      quantity: 1,
      equipmentCost: round(recommendation.equipmentCost),
      installationCost: round(recommendation.installationCost),
      labourCost: round(recommendation.labourCost),
      totalCost,
      installationHours: recommendation.installationHours,
    };
  });
  const validationLineItem: VisionQuoteLineItem = {
    id: `vision-quote-line-${room.id}-room-validation`,
    name: "Vision AI room validation and placement review",
    category: "device",
    quantity: 1,
    equipmentCost: 0,
    installationCost: 120,
    labourCost: 180,
    totalCost: 300,
    installationHours: 0.8,
  };
  const lineItems = [validationLineItem, ...recommendationLineItems];
  const equipmentCost = round(lineItems.reduce((total, item) => total + item.equipmentCost, 0));
  const installationCost = round(lineItems.reduce((total, item) => total + item.installationCost, 0));
  const labourCost = round(lineItems.reduce((total, item) => total + item.labourCost, 0));

  return {
    id: `vision-quote-${room.id}`,
    title: `${room.name} Vision AI Recommendation Quote`,
    currency: "USD",
    roomId: room.id,
    roomName: room.name,
    lineItems,
    equipmentCost,
    installationCost,
    labourCost,
    totalCost: round(equipmentCost + installationCost + labourCost),
    installationHours: round(lineItems.reduce((total, item) => total + item.installationHours, 0), 1),
    generatedDirectlyFromVisionAnalysis: true,
    existingQuotationEngineModified: false,
  };
}

function rating(score: number): VisionRating {
  if (score >= 92) return "A+";
  if (score >= 82) return "A";
  if (score >= 68) return "B";
  return "C";
}

function ratingScore(ratingValue: VisionRating) {
  if (ratingValue === "A+") return 4;
  if (ratingValue === "A") return 3;
  if (ratingValue === "B") return 2;
  return 1;
}

function averageRating(ratings: readonly VisionRating[]): VisionRating {
  const average = ratings.reduce((total, ratingValue) => total + ratingScore(ratingValue), 0) / Math.max(1, ratings.length);
  if (average >= 3.65) return "A+";
  if (average >= 2.75) return "A";
  if (average >= 1.8) return "B";
  return "C";
}

function scoreRoom(
  room: InteriorRoom,
  installed: readonly VisionInstalledItem[],
  lightingCount: number,
  socketCount: number,
  recommendations: readonly VisionMissingDeviceRecommendation[],
) {
  const deviceScore = Math.min(24, installed.length * 2.2);
  const lightingScore = Math.min(24, lightingCount * 3.2);
  const powerScore = Math.min(18, socketCount * 2.5);
  const profileBonus = room.futureEnergyConsumption.profile === "low" ? 10 : room.futureEnergyConsumption.profile === "medium" ? 7 : 4;
  const recommendationPenalty = recommendations.filter((recommendation) => recommendation.category === "power" || recommendation.category === "lighting").length * 5;

  return rating(48 + deviceScore + lightingScore + powerScore + profileBonus - recommendationPenalty);
}

function scoreSecurity(installed: readonly VisionInstalledItem[], recommendations: readonly VisionMissingDeviceRecommendation[], doorCount: number, windowCount: number) {
  const securityScore = Math.min(46, installedCategoryCount(installed, "security") * 8);
  const sensorScore = Math.min(22, installed.filter((item) => item.name.toLowerCase().includes("sensor") || item.name.toLowerCase().includes("detector")).length * 4);
  const exposurePenalty = Math.max(0, doorCount + windowCount - 1) * 3;
  const recommendationPenalty = recommendations.filter((recommendation) => recommendation.category === "security").length * 8;

  return rating(54 + securityScore + sensorScore - exposurePenalty - recommendationPenalty);
}

function analyzeRoom(room: InteriorRoom, scanMode: VisionScanMode = "room-click"): VisionRoomAnalysis {
  const roomTwin = getTwinEntityByStableId(`room:${room.id}`);
  const children = roomTwin ? roomChildren(roomTwin.uuid) : [];
  const installed = installedItems(children);
  const lighting = roomLighting(room.id);
  const switches = roomSwitches(room.id);
  const sockets = roomSockets(room.id);
  const doors = roomDoors(room);
  const windows = roomWindows(room);
  const missing = missingRecommendations(room, installed, lighting.length, switches.length, sockets.length);
  const quote = quoteDraft(room, missing);
  const analysisDetections = cameraDetections(room, children);
  const energyRating = scoreRoom(room, installed, lighting.length, sockets.length, missing);
  const securityRating = scoreSecurity(installed, missing, doors.length, windows.length);

  return {
    id: `vision-analysis-${room.id}`,
    roomId: room.id,
    roomName: room.name,
    roomTwinUuid: roomTwin?.uuid ?? "",
    floorLevel: room.floorLevel,
    scanMode,
    scannedAtLabel: SCANNED_AT_LABEL,
    summary: `Vision AI scanned ${room.name}, recognized ${installed.length} twin-linked installed objects, ${lighting.length} lighting fixtures, ${doors.length} doors, and ${windows.length} windows.`,
    installedDevices: installed,
    missingDevices: missing,
    possibleImprovements: improvements(room, missing),
    estimatedCost: {
      equipmentCost: quote.equipmentCost,
      installationCost: quote.installationCost,
      labourCost: quote.labourCost,
      totalCost: quote.totalCost,
    },
    installationTimeHours: quote.installationHours,
    energyRating,
    securityRating,
    recognitions: recognitionResults(room, children, installed, lighting.length, switches.length, sockets.length, doors.length, windows.length),
    cameraDetections: analysisDetections,
    quoteDraft: quote,
    futurePhotoImportReady: true,
    cameraModeReady: true,
  };
}

export const VISION_PHOTO_IMPORT_CONTRACT: VisionPhotoImportContract = {
  status: "future-ready",
  acceptedInputs: ["room-photo"],
  plannedDetections: ["doors", "windows", "furniture", "electrical-points", "lighting", "camera-locations", "sensor-locations"],
  externalVisionProviderRequiredNow: false,
};

export const VISION_ROOM_ANALYSES: readonly VisionRoomAnalysis[] = INTERIOR_ROOMS.map((room) => analyzeRoom(room));

export function ScanRoom(roomId: string, scanMode: VisionScanMode = "room-click"): VisionRoomAnalysis {
  const room = getInteriorRoom(roomId) ?? getInteriorRoom(DEFAULT_ROOM_ID) ?? INTERIOR_ROOMS[0];
  return analyzeRoom(room, scanMode);
}

export function StartCameraModeScan(roomId: string): VisionRoomAnalysis {
  return ScanRoom(roomId, "camera-mode");
}

export function AnalyzePhotoImport(roomId: string): VisionRoomAnalysis {
  return ScanRoom(roomId, "photo-import");
}

export function GenerateVisionQuote(roomId: string): VisionQuoteDraft {
  return ScanRoom(roomId).quoteDraft;
}

export const VisionAiApi = {
  ScanRoom,
  StartCameraModeScan,
  AnalyzePhotoImport,
  GenerateVisionQuote,
} as const;

export const VISION_AI_REPORT: VisionAiReport = {
  roomAnalysisCount: VISION_ROOM_ANALYSES.length,
  recognitionCount: VISION_ROOM_ANALYSES.reduce((total, analysis) => total + analysis.recognitions.length, 0),
  detectionCount: VISION_ROOM_ANALYSES.reduce((total, analysis) => total + analysis.cameraDetections.length, 0),
  quoteDraftCount: VISION_ROOM_ANALYSES.length,
  totalRecommendedCost: round(VISION_ROOM_ANALYSES.reduce((total, analysis) => total + analysis.quoteDraft.totalCost, 0)),
  averageEnergyRating: averageRating(VISION_ROOM_ANALYSES.map((analysis) => analysis.energyRating)),
  averageSecurityRating: averageRating(VISION_ROOM_ANALYSES.map((analysis) => analysis.securityRating)),
  capabilities: {
    objectRecognition: true,
    roomRecognition: true,
    furnitureRecognition: true,
    lightingRecognition: true,
    securityRecognition: true,
    deviceRecognition: true,
    powerRecognition: true,
    roomClickScan: true,
    cameraModeScan: true,
    photoImportFutureReady: true,
    quoteFromVisionAnalysis: true,
  },
  photoImport: VISION_PHOTO_IMPORT_CONTRACT,
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    externalQuoteEngine: "untouched",
    externalVisionProvider: "not-required",
  },
};

export const VISION_AI_CONFIGURATION_SYNC = {
  selectedConfigurationCatalogItems: CONFIGURATION_ITEMS.length,
  quoteDraftsGeneratedFromRoomAnalysis: VISION_ROOM_ANALYSES.length,
  directQuoteGenerationReady: true,
  existingQuoteEngineModified: false,
} as const;
