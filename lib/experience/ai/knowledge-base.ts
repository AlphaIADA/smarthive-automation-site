import { BAS_ENDPOINTS } from "@/lib/experience/automation/bas-registry";
import { BAS_SYSTEM_REPORT } from "@/lib/experience/automation/bas-system";
import { LUXURY_INTERIOR_DESIGN_REPORT } from "@/lib/experience/design/finish-specs";
import { DEVICE_CATEGORY_LABELS, ROOM_DEVICE_REGISTRIES, SMART_DEVICE_FRAMEWORK_REPORT, SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { ENERGY_QUOTE_SUMMARY, ENERGY_SYSTEM_REPORT } from "@/lib/experience/energy/energy-catalog";
import { LUXURY_FURNITURE_REPORT } from "@/lib/experience/furniture/furniture-registry";
import { INTERIOR_ROOMS, getInteriorRoom } from "@/lib/experience/interior/room-registry";
import { LIGHTING_ENGINE_REPORT, LIGHTING_QUOTE_SUMMARY } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_CAMERAS, SECURITY_DEVICES, SECURITY_QUOTE_SUMMARY, SECURITY_SENSORS } from "@/lib/experience/security/security-catalog";
import { SOC_OPERATIONS_REPORT, SOC_QUOTE_SUMMARY } from "@/lib/experience/security/security-operations-center";
import type {
  AiKnowledgeDomain,
  AiKnowledgePackage,
  AiKnowledgeStats,
  AiAssistantReport,
  AiProductRecommendation,
  AiQuoteDraft,
  AiQuoteLineItem,
  AiSavingsEstimate,
  InteriorRoom,
  SmartDeviceSnapshot,
} from "@/types/experience";

const KNOWLEDGE_DOMAINS: readonly AiKnowledgeDomain[] = [
  "rooms",
  "devices",
  "automation",
  "lighting",
  "security",
  "energy",
  "furniture",
  "interior-design",
  "quotes",
  "packages",
] as const;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function lineItem(
  id: string,
  name: string,
  source: AiQuoteLineItem["source"],
  quantity: number,
  equipmentCost: number,
  installationCost: number,
  labourCost: number,
  reason: string,
): AiQuoteLineItem {
  return {
    id,
    name,
    source,
    quantity,
    equipmentCost,
    installationCost,
    labourCost,
    totalCost: round((equipmentCost + installationCost + labourCost) * quantity),
    reason,
  };
}

function quoteDraft(id: string, title: string, lineItems: readonly AiQuoteLineItem[]): AiQuoteDraft {
  const equipmentCost = round(lineItems.reduce((total, item) => total + item.equipmentCost * item.quantity, 0));
  const installationCost = round(lineItems.reduce((total, item) => total + item.installationCost * item.quantity, 0));
  const labourCost = round(lineItems.reduce((total, item) => total + item.labourCost * item.quantity, 0));

  return {
    id,
    title,
    currency: "USD",
    lineItems,
    equipmentCost,
    installationCost,
    labourCost,
    totalCost: round(equipmentCost + installationCost + labourCost),
    source: "experience-ai-internal-quote-builder",
    existingQuotationEngineModified: false,
  };
}

function packageSpec(
  id: string,
  name: string,
  domain: AiKnowledgeDomain,
  itemCount: number,
  description: string,
  equipmentCost: number,
  installationCost: number,
  labourCost: number,
): AiKnowledgePackage {
  return {
    id,
    name,
    domain,
    itemCount,
    description,
    quoteReady: equipmentCost + installationCost + labourCost > 0,
    equipmentCost,
    installationCost,
    labourCost,
  };
}

export const AI_KNOWLEDGE_PACKAGES: readonly AiKnowledgePackage[] = [
  packageSpec(
    "ai-package-smart-devices",
    "Smart Device Framework",
    "devices",
    SMART_DEVICE_FRAMEWORK_REPORT.deviceCount,
    "Every smart device, manufacturer, model, firmware, pricing, warranty, connectivity, health, and future automation hook.",
    SMART_DEVICE_FRAMEWORK_REPORT.totalEquipmentPrice,
    SMART_DEVICE_FRAMEWORK_REPORT.totalInstallationPrice,
    0,
  ),
  packageSpec(
    "ai-package-lighting-electrical",
    "Lighting and Electrical",
    "lighting",
    LIGHTING_ENGINE_REPORT.fixtureCount + LIGHTING_ENGINE_REPORT.switchCount + LIGHTING_ENGINE_REPORT.socketCount,
    "Lighting fixtures, switches, sockets, room groups, power usage, and internal quote totals.",
    LIGHTING_QUOTE_SUMMARY.equipmentCost,
    LIGHTING_QUOTE_SUMMARY.installationCost,
    LIGHTING_QUOTE_SUMMARY.labourCost,
  ),
  packageSpec(
    "ai-package-security",
    "Smart Security Platform",
    "security",
    SECURITY_DEVICES.length,
    "Cameras, sensors, alarms, locks, access control, coverage, notifications, and security hardware recommendations.",
    SECURITY_QUOTE_SUMMARY.equipmentCost,
    SECURITY_QUOTE_SUMMARY.installationCost,
    SECURITY_QUOTE_SUMMARY.labourCost,
  ),
  packageSpec(
    "ai-package-soc",
    "Security Operations Center",
    "security",
    SOC_OPERATIONS_REPORT.liveMapAssetCount,
    "Camera wall, live map, event timeline, incident management, video bookmarks, and SOC command hardware recommendations.",
    SOC_QUOTE_SUMMARY.equipmentCost,
    SOC_QUOTE_SUMMARY.installationCost,
    SOC_QUOTE_SUMMARY.labourCost,
  ),
  packageSpec(
    "ai-package-energy",
    "Enterprise Energy Management",
    "energy",
    ENERGY_SYSTEM_REPORT.smartDeviceMonitorCount + ENERGY_SYSTEM_REPORT.circuitMonitorCount,
    "Energy monitors for devices, circuits, rooms, floors, villa totals, power sources, heatmap, and savings estimates.",
    ENERGY_QUOTE_SUMMARY.equipmentCost,
    ENERGY_QUOTE_SUMMARY.installationCost,
    ENERGY_QUOTE_SUMMARY.labourCost,
  ),
  packageSpec(
    "ai-package-bas",
    "Building Automation System",
    "automation",
    BAS_SYSTEM_REPORT.endpointCount,
    "Automation endpoints, rules, scenes, schedules, graph nodes, logic operators, fail-safe behavior, and domains.",
    0,
    0,
    0,
  ),
  packageSpec(
    "ai-package-interior-design",
    "Luxury Interior Design",
    "interior-design",
    LUXURY_INTERIOR_DESIGN_REPORT.finishCount,
    "Luxury finishes, PBR materials, wall features, ceiling profiles, and room design coverage.",
    0,
    0,
    0,
  ),
  packageSpec(
    "ai-package-furniture",
    "Luxury Furniture System",
    "furniture",
    LUXURY_FURNITURE_REPORT.library.placementCount,
    "Reusable furniture assets, placements, material library, populated room coverage, and future interaction readiness.",
    0,
    0,
    0,
  ),
] as const;

export const AI_KNOWLEDGE_STATS: AiKnowledgeStats = {
  roomCount: INTERIOR_ROOMS.length,
  smartDeviceCount: SMART_DEVICES.length,
  securityDeviceCount: SECURITY_DEVICES.length,
  lightingEndpointCount: LIGHTING_ENGINE_REPORT.fixtureCount + LIGHTING_ENGINE_REPORT.switchCount + LIGHTING_ENGINE_REPORT.socketCount,
  automationEndpointCount: BAS_SYSTEM_REPORT.endpointCount,
  automationRuleCount: BAS_SYSTEM_REPORT.ruleCount,
  automationSceneCount: BAS_SYSTEM_REPORT.sceneCount,
  automationScheduleCount: BAS_SYSTEM_REPORT.scheduleCount,
  furniturePlacementCount: LUXURY_FURNITURE_REPORT.library.placementCount,
  packageCount: AI_KNOWLEDGE_PACKAGES.length,
  quotePackageCount: AI_KNOWLEDGE_PACKAGES.filter((knowledgePackage) => knowledgePackage.quoteReady).length,
  knowledgeDomains: KNOWLEDGE_DOMAINS,
};

function securitySensorCount(roomId: string) {
  return SECURITY_SENSORS.filter((sensor) => sensor.roomId === roomId && sensor.category !== "alarm").length;
}

function securityCameraCount(roomId: string) {
  return SECURITY_CAMERAS.filter((camera) => camera.roomId === roomId).length;
}

function automationEndpointCount(roomId: string) {
  return BAS_ENDPOINTS.filter((endpoint) => endpoint.roomId === roomId).length;
}

function recommendation(
  id: string,
  type: AiProductRecommendation["type"],
  title: string,
  room: InteriorRoom | null,
  reason: string,
  productCategory: string,
  equipmentCost: number,
  installationCost: number,
  labourCost: number,
  priority: AiProductRecommendation["priority"],
): AiProductRecommendation {
  return {
    id,
    type,
    title,
    roomId: room?.id ?? null,
    roomName: room?.name ?? null,
    reason,
    productCategory,
    equipmentCost,
    installationCost,
    labourCost,
    priority,
  };
}

export function buildAiRecommendations(): readonly AiProductRecommendation[] {
  const recommendations: AiProductRecommendation[] = [];

  INTERIOR_ROOMS.forEach((room) => {
    const devicesInRoom = ROOM_DEVICE_REGISTRIES.find((registry) => registry.roomId === room.id)?.devices.length ?? 0;
    const allowanceGap = room.futureQuoteMapping.futureDeviceAllowance - devicesInRoom;

    if (allowanceGap > 0) {
      recommendations.push(
        recommendation(
          `ai-rec-device-${room.id}`,
          "missing-device",
          `${room.name} device allowance gap`,
          room,
          `${room.name} has ${devicesInRoom} registered smart devices against a future allowance of ${room.futureQuoteMapping.futureDeviceAllowance}.`,
          "Smart device expansion allowance",
          allowanceGap * 180,
          allowanceGap * 85,
          allowanceGap * 45,
          allowanceGap >= 4 ? "high" : "medium",
        ),
      );
    }

    if (securitySensorCount(room.id) < 2 && room.futureSmartDevices.includes("sensors")) {
      recommendations.push(
        recommendation(
          `ai-rec-sensor-${room.id}`,
          "missing-sensor",
          `${room.name} sensor coverage upgrade`,
          room,
          `${room.name} is future-ready for sensors but has limited dedicated security sensor coverage.`,
          "Motion, environmental, and contact sensors",
          320,
          160,
          90,
          room.futureEnergyConsumption.profile === "high" ? "high" : "medium",
        ),
      );
    }

    if (securityCameraCount(room.id) === 0 && (room.futureEnergyConsumption.profile === "high" || room.futureQuoteMapping.category === "entry" || room.futureQuoteMapping.category === "office")) {
      recommendations.push(
        recommendation(
          `ai-rec-camera-${room.id}`,
          "missing-camera",
          `${room.name} camera coverage upgrade`,
          room,
          `${room.name} is a high-value or access-sensitive space without a dedicated camera channel.`,
          "Interior camera or privacy-aware occupancy camera",
          680,
          240,
          160,
          room.futureQuoteMapping.category === "entry" ? "critical" : "high",
        ),
      );
    }

    if (automationEndpointCount(room.id) < 5) {
      recommendations.push(
        recommendation(
          `ai-rec-automation-${room.id}`,
          "missing-automation",
          `${room.name} automation graph upgrade`,
          room,
          `${room.name} has fewer automation endpoints than the AI target for contextual room scenes.`,
          "Room automation graph and scene keypad",
          420,
          210,
          120,
          "medium",
        ),
      );
    }
  });

  return recommendations;
}

export const AI_PRODUCT_RECOMMENDATIONS: readonly AiProductRecommendation[] = buildAiRecommendations();

export function buildAiQuoteDraft(context?: { readonly roomId?: string | null; readonly deviceId?: string | null; readonly includeRecommendations?: boolean }): AiQuoteDraft {
  const packageItems = AI_KNOWLEDGE_PACKAGES.filter((knowledgePackage) => knowledgePackage.quoteReady).map((knowledgePackage) =>
    lineItem(
      `ai-line-${knowledgePackage.id}`,
      knowledgePackage.name,
      "package",
      1,
      knowledgePackage.equipmentCost,
      knowledgePackage.installationCost,
      knowledgePackage.labourCost,
      knowledgePackage.description,
    ),
  );

  const contextItems: AiQuoteLineItem[] = [];
  if (context?.roomId) {
    const room = getInteriorRoom(context.roomId);
    const registry = ROOM_DEVICE_REGISTRIES.find((roomRegistry) => roomRegistry.roomId === context.roomId);
    if (room && registry) {
      const equipmentCost = registry.devices.reduce((total, device) => total + device.pricing.equipmentPrice, 0);
      const installationCost = registry.devices.reduce((total, device) => total + device.pricing.installationPrice, 0);
      contextItems.push(lineItem(`ai-line-room-${room.id}`, `${room.name} Context Package`, "room-context", 1, equipmentCost, installationCost, 0, `${registry.devices.length} devices mapped to ${room.name}.`));
    }
  }

  if (context?.deviceId) {
    const device = SMART_DEVICES.find((candidate) => candidate.uniqueId === context.deviceId);
    if (device) {
      contextItems.push(lineItem(`ai-line-device-${device.uniqueId}`, device.name, "device-context", 1, device.pricing.equipmentPrice, device.pricing.installationPrice, 0, `${DEVICE_CATEGORY_LABELS[device.category]} selected in ${device.roomName}.`));
    }
  }

  const recommendationItems = (context?.includeRecommendations ?? true)
    ? AI_PRODUCT_RECOMMENDATIONS.slice(0, 18).map((item) => lineItem(`ai-line-${item.id}`, item.title, "ai-recommendation", 1, item.equipmentCost, item.installationCost, item.labourCost, item.reason))
    : [];

  return quoteDraft("ai-quote-digital-twin-master", "SmartHive AI Digital Twin Quotation", [...packageItems, ...contextItems, ...recommendationItems]);
}

export function buildAiSavingsEstimate(): AiSavingsEstimate {
  const baselineMonthlyCostUsd = ENERGY_SYSTEM_REPORT.villa.metrics.costUsd;
  const savingsPercent = 28;
  const optimizedMonthlyCostUsd = round(baselineMonthlyCostUsd * (1 - savingsPercent / 100));
  const monthlySavingsUsd = round(baselineMonthlyCostUsd - optimizedMonthlyCostUsd);

  return {
    baselineMonthlyCostUsd,
    optimizedMonthlyCostUsd,
    monthlySavingsUsd,
    yearlySavingsUsd: round(monthlySavingsUsd * 12),
    savingsPercent,
    assumptions: [
      "Lighting schedules reduce unnecessary runtime in unoccupied rooms.",
      "HVAC and curtain automation reduce comfort-zone cooling load.",
      "Solar, battery, grid, generator, and UPS source switching prioritizes lower-cost sources.",
      "High-load rooms are targeted first by the AI recommendation engine.",
    ],
  };
}

export const AI_MASTER_QUOTE_DRAFT = buildAiQuoteDraft();
export const AI_SAVINGS_ESTIMATE = buildAiSavingsEstimate();

export const AI_ASSISTANT_REPORT: AiAssistantReport = {
  knowledgeStats: AI_KNOWLEDGE_STATS,
  recommendationCount: AI_PRODUCT_RECOMMENDATIONS.length,
  quoteDraft: AI_MASTER_QUOTE_DRAFT,
  savingsEstimate: AI_SAVINGS_ESTIMATE,
  capabilities: {
    explainEveryRoom: true,
    explainEveryDevice: true,
    explainAutomation: true,
    findDevices: true,
    recommendProducts: true,
    compareProducts: true,
    estimateInstallation: true,
    calculateSavings: true,
    visualAiReady: true,
    voiceReady: true,
    aiQuoteBuilder: true,
  },
  constraints: {
    externalQuotationEngine: "untouched",
    api: "untouched",
    database: "untouched",
    authentication: "untouched",
    externalLlmProvider: "not-required",
  },
};

export function findRoomByQuery(query: string): InteriorRoom | null {
  const normalized = query.toLowerCase();
  return INTERIOR_ROOMS.find((room) => normalized.includes(room.name.toLowerCase()) || normalized.includes(room.id.toLowerCase()) || room.name.toLowerCase().split(" ").some((part) => part.length > 3 && normalized.includes(part))) ?? null;
}

export function findDeviceByQuery(query: string): SmartDeviceSnapshot | null {
  const normalized = query.toLowerCase();
  return (
    SMART_DEVICES.find((device) => normalized.includes(device.uniqueId.toLowerCase()) || normalized.includes(device.name.toLowerCase()) || normalized.includes(device.category.replace(/-/g, " "))) ??
    null
  );
}
