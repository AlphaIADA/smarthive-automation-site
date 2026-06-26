import { BAS_AUTOMATION_RULES } from "@/lib/experience/automation/bas-rule-engine";
import { BAS_SCENES } from "@/lib/experience/automation/bas-scene-engine";
import { BAS_SCHEDULES } from "@/lib/experience/automation/bas-scheduler";
import { BAS_SYSTEM_REPORT } from "@/lib/experience/automation/bas-system";
import { DEVICE_CATEGORY_LABELS, getRoomDeviceRegistry, getSmartDevice } from "@/lib/experience/devices/device-catalog";
import { ENERGY_ROOM_MONITORS, ENERGY_SYSTEM_REPORT, getEnergyRoomMonitor } from "@/lib/experience/energy/energy-catalog";
import { getInteriorRoom } from "@/lib/experience/interior/room-registry";
import { LIGHTING_POWER_SUMMARY } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_DEVICES } from "@/lib/experience/security/security-catalog";
import {
  AI_KNOWLEDGE_PACKAGES,
  AI_KNOWLEDGE_STATS,
  AI_MASTER_QUOTE_DRAFT,
  AI_PRODUCT_RECOMMENDATIONS,
  AI_SAVINGS_ESTIMATE,
  buildAiQuoteDraft,
  findDeviceByQuery,
  findRoomByQuery,
} from "./knowledge-base";
import type { AiAssistantIntent, AiAssistantResponse, AiProductRecommendation, AiVisualContext, AiVisualSelectionKind } from "@/types/experience";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number, maximumFractionDigits = 1) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value);
}

function visualContext(kind: AiVisualSelectionKind, id: string | null): AiVisualContext {
  if (kind === "room" && id) {
    const room = getInteriorRoom(id);
    return { kind, id, label: room?.name ?? id };
  }

  if (kind === "device" && id) {
    const device = getSmartDevice(id);
    return { kind, id, label: device?.name ?? id };
  }

  return { kind: "none", id: null, label: "Entire Digital Twin" };
}

function classifyIntent(query: string, context: AiVisualContext): AiAssistantIntent {
  const normalized = query.toLowerCase();
  if (normalized.includes("compare")) return "compare-products";
  if (normalized.includes("saving") || normalized.includes("save") || normalized.includes("cost reduction")) return "calculate-savings";
  if (normalized.includes("quote") || normalized.includes("quotation") || normalized.includes("build quotation")) return "build-quote";
  if (normalized.includes("estimate") || normalized.includes("install")) return "estimate-installation";
  if (normalized.includes("automation") || normalized.includes("rule") || normalized.includes("scene")) return "explain-automation";
  if (normalized.includes("find") || normalized.includes("search") || normalized.includes("where")) return "find-devices";
  if (normalized.includes("recommend") || normalized.includes("missing") || normalized.includes("product")) return "recommend-products";
  if (normalized.includes("device") || context.kind === "device") return "explain-device";
  if (normalized.includes("room") || context.kind === "room") return "explain-room";
  return "visual-context";
}

function responseId(intent: AiAssistantIntent, query: string) {
  const slug = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 36) || "visual-context";
  return `ai-response-${intent}-${slug}`;
}

function roomBullets(roomId: string) {
  const room = getInteriorRoom(roomId);
  if (!room) return null;
  const registry = getRoomDeviceRegistry(room.id);
  const energy = getEnergyRoomMonitor(room.id) ?? ENERGY_ROOM_MONITORS.find((monitor) => monitor.roomId === room.id);
  const securityDevices = SECURITY_DEVICES.filter((device) => device.roomId === room.id);

  return {
    title: `${room.name} explained`,
    summary: `${room.name} is a ${room.floorLevel}-floor ${room.futureQuoteMapping.category} space with ${room.areaSqm} sqm, ${room.volumeCbm} cbm, ${room.ceilingHeight}m ceiling height, and ${room.floorMaterial.replace(/-/g, " ")} flooring.`,
    bullets: [
      `Room ID ${room.id}; allowance code ${room.futureQuoteMapping.allowanceCode}; future device allowance ${room.futureQuoteMapping.futureDeviceAllowance}.`,
      `Registered smart devices: ${registry?.devices.length ?? 0}; security endpoints: ${securityDevices.length}.`,
      `Energy profile ${room.futureEnergyConsumption.profile}; baseline ${room.futureEnergyConsumption.baselineKwhPerDay}kWh/day; current monitor ${formatNumber(energy?.metrics.instantConsumptionWatts ?? 0)}W.`,
      `Future-ready for ${room.futureSmartDevices.join(", ")}.`,
    ],
    entities: [room.id, room.name, room.futureQuoteMapping.allowanceCode],
  };
}

function deviceBullets(deviceId: string) {
  const device = getSmartDevice(deviceId);
  if (!device) return null;

  return {
    title: `${device.name} explained`,
    summary: `${device.name} is a ${DEVICE_CATEGORY_LABELS[device.category]} device in ${device.roomName}, made by ${device.manufacturer} with model ${device.model}.`,
    bullets: [
      `Firmware ${device.firmwareVersion}; connectivity ${device.connectivity}; online status ${device.onlineStatus}; health ${device.healthStatus}.`,
      `Power state ${device.powerState}; active load ${device.powerConsumption.activeWatts}W; yearly estimate ${device.powerConsumption.estimatedKwhPerYear}kWh.`,
      `Equipment ${formatCurrency(device.pricing.equipmentPrice)}; installation ${formatCurrency(device.pricing.installationPrice)}; warranty ${device.warranty.years} years.`,
      `Automation hooks ready: ${device.futureAutomationHooks.triggerHooks.length} triggers, ${device.futureAutomationHooks.conditionHooks.length} conditions, ${device.futureAutomationHooks.actionHooks.length} actions.`,
    ],
    entities: [device.uniqueId, device.name, device.roomName, device.category],
  };
}

function recommendationsForContext(context: AiVisualContext): readonly AiProductRecommendation[] {
  if (context.kind === "room" && context.id) {
    const roomMatches = AI_PRODUCT_RECOMMENDATIONS.filter((recommendation) => recommendation.roomId === context.id);
    if (roomMatches.length > 0) return roomMatches;
  }

  return AI_PRODUCT_RECOMMENDATIONS.slice(0, 12);
}

function findDevices(query: string, context: AiVisualContext) {
  const normalized = query.toLowerCase();
  const room = context.kind === "room" && context.id ? getInteriorRoom(context.id) : findRoomByQuery(query);
  const registry = room ? getRoomDeviceRegistry(room.id) : null;
  const candidates = registry?.devices ?? [];
  const matches = candidates.length > 0 ? candidates : [];
  const categoryMatches = matches.filter((device) => normalized.includes(device.category.replace(/-/g, " ")) || normalized.includes(DEVICE_CATEGORY_LABELS[device.category].toLowerCase()));
  const resultDevices = categoryMatches.length > 0 ? categoryMatches : matches.slice(0, 16);

  return {
    title: room ? `Devices in ${room.name}` : "Device search",
    summary: room ? `I found ${resultDevices.length} relevant devices in ${room.name}.` : `I can search ${AI_KNOWLEDGE_STATS.smartDeviceCount} smart devices by room, category, manufacturer, model, and status.`,
    bullets: resultDevices.slice(0, 8).map((device) => `${device.name}: ${DEVICE_CATEGORY_LABELS[device.category]}, ${device.manufacturer}, ${device.onlineStatus}, ${device.powerConsumption.activeWatts}W.`),
    entities: resultDevices.slice(0, 8).map((device) => device.uniqueId),
  };
}

export function answerSmartHiveAiQuery(query: string, selection: { readonly kind: AiVisualSelectionKind; readonly id: string | null }): AiAssistantResponse {
  const trimmedQuery = query.trim();
  const context = visualContext(selection.kind, selection.id);
  const intent = classifyIntent(trimmedQuery, context);
  const room = context.kind === "room" && context.id ? getInteriorRoom(context.id) : findRoomByQuery(trimmedQuery);
  const device = context.kind === "device" && context.id ? getSmartDevice(context.id) : findDeviceByQuery(trimmedQuery);
  const base = {
    id: responseId(intent, trimmedQuery),
    query: trimmedQuery || `Explain ${context.label}`,
    intent,
    recommendations: [] as readonly AiProductRecommendation[],
    quoteDraft: null,
    savingsEstimate: null,
    confidence: 0.91,
    visualContext: context,
    voiceReady: true as const,
  };

  if (intent === "explain-room" && (room || context.kind === "room")) {
    const explained = roomBullets(room?.id ?? context.id ?? "");
    if (explained) return { ...base, ...explained };
  }

  if (intent === "explain-device" && (device || context.kind === "device")) {
    const explained = deviceBullets(device?.uniqueId ?? context.id ?? "");
    if (explained) return { ...base, ...explained };
  }

  if (intent === "recommend-products") {
    const recommendations = recommendationsForContext(context);
    return {
      ...base,
      title: context.kind === "room" ? `AI recommendations for ${context.label}` : "AI product recommendations",
      summary: `I found ${recommendations.length} prioritized recommendations for missing devices, sensors, cameras, or automation coverage.`,
      bullets: recommendations.slice(0, 6).map((item) => `${item.title}: ${item.reason} Estimated ${formatCurrency(item.equipmentCost + item.installationCost + item.labourCost)}.`),
      entities: recommendations.map((item) => item.id),
      recommendations,
    };
  }

  if (intent === "compare-products") {
    const packages = AI_KNOWLEDGE_PACKAGES.filter((knowledgePackage) => knowledgePackage.quoteReady).slice(0, 5);
    return {
      ...base,
      title: "Product package comparison",
      summary: "The assistant compares package scope, item count, and internal budget from the digital twin quote models.",
      bullets: packages.map((knowledgePackage) => `${knowledgePackage.name}: ${knowledgePackage.itemCount} items, ${formatCurrency(knowledgePackage.equipmentCost + knowledgePackage.installationCost + knowledgePackage.labourCost)}, domain ${knowledgePackage.domain}.`),
      entities: packages.map((knowledgePackage) => knowledgePackage.id),
    };
  }

  if (intent === "estimate-installation") {
    const quoteDraft = buildAiQuoteDraft({ roomId: context.kind === "room" ? context.id : null, deviceId: context.kind === "device" ? context.id : null, includeRecommendations: true });
    return {
      ...base,
      title: "Installation estimate",
      summary: `Internal AI estimate is ${formatCurrency(quoteDraft.totalCost)} across ${quoteDraft.lineItems.length} line items. The external quote engine is untouched.`,
      bullets: [
        `Equipment: ${formatCurrency(quoteDraft.equipmentCost)}.`,
        `Installation: ${formatCurrency(quoteDraft.installationCost)}.`,
        `Labour: ${formatCurrency(quoteDraft.labourCost)}.`,
        `Context: ${context.label}.`,
      ],
      entities: quoteDraft.lineItems.slice(0, 8).map((item) => item.id),
      quoteDraft,
    };
  }

  if (intent === "calculate-savings") {
    return {
      ...base,
      title: "Savings estimate",
      summary: `Estimated optimized monthly energy cost is ${formatCurrency(AI_SAVINGS_ESTIMATE.optimizedMonthlyCostUsd)}, saving ${formatCurrency(AI_SAVINGS_ESTIMATE.monthlySavingsUsd)} per month.`,
      bullets: AI_SAVINGS_ESTIMATE.assumptions,
      entities: ["energy-villa-total", "bas-system", "solar-battery-grid"],
      savingsEstimate: AI_SAVINGS_ESTIMATE,
    };
  }

  if (intent === "explain-automation") {
    return {
      ...base,
      title: "Automation explained",
      summary: `The BAS contains ${BAS_AUTOMATION_RULES.length} rules, ${BAS_SCENES.length} scenes, ${BAS_SCHEDULES.length} schedules, and ${BAS_SYSTEM_REPORT.endpointCount} endpoints.`,
      bullets: [
        `Rules use IF, ELSE, AND, OR, NOT, delay, timer, schedule, sunrise, sunset, sensor state, weather, temperature, humidity, power, battery, and internet conditions.`,
        `Scenes include ${BAS_SCENES.map((scene) => scene.name).join(", ")}.`,
        `Every rule has fail-safe behavior and a visual automation graph.`,
        `Selected context: ${context.label}.`,
      ],
      entities: BAS_AUTOMATION_RULES.slice(0, 8).map((rule) => rule.id),
    };
  }

  if (intent === "find-devices") {
    const found = findDevices(trimmedQuery, context);
    return { ...base, ...found };
  }

  if (intent === "build-quote") {
    const quoteDraft = buildAiQuoteDraft({ roomId: context.kind === "room" ? context.id : null, deviceId: context.kind === "device" ? context.id : null, includeRecommendations: true });
    return {
      ...base,
      title: "AI-built quotation",
      summary: `I built an internal quotation draft for ${context.label}: ${formatCurrency(quoteDraft.totalCost)}. The existing quote engine remains untouched.`,
      bullets: quoteDraft.lineItems.slice(0, 7).map((item) => `${item.name}: ${formatCurrency(item.totalCost)}. ${item.reason}`),
      entities: quoteDraft.lineItems.map((item) => item.id),
      quoteDraft,
    };
  }

  return {
    ...base,
    title: "SmartHive AI digital twin summary",
    summary: `I understand ${AI_KNOWLEDGE_STATS.roomCount} rooms, ${AI_KNOWLEDGE_STATS.smartDeviceCount} smart devices, ${AI_KNOWLEDGE_STATS.securityDeviceCount} security endpoints, ${AI_KNOWLEDGE_STATS.automationEndpointCount} BAS endpoints, and ${AI_KNOWLEDGE_STATS.quotePackageCount} internal quote packages.`,
    bullets: [
      `Visual context: ${context.label}. Click any room or device and I can explain it.`,
      `Lighting load is ${formatNumber(LIGHTING_POWER_SUMMARY.totalWattage)}W; villa energy monitor is ${formatNumber(ENERGY_SYSTEM_REPORT.villa.metrics.instantConsumptionWatts)}W.`,
      `Master AI quote draft: ${formatCurrency(AI_MASTER_QUOTE_DRAFT.totalCost)}.`,
      `Ask about recommendations, comparisons, installation, savings, automation, or device search.`,
    ],
    entities: AI_KNOWLEDGE_PACKAGES.map((knowledgePackage) => knowledgePackage.id),
  };
}

export const AI_WELCOME_RESPONSE: AiAssistantResponse = answerSmartHiveAiQuery("", { kind: "none", id: null });
