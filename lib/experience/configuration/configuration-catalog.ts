import { DEVICE_CATEGORY_LABELS, SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { ENERGY_RECOMMENDATIONS } from "@/lib/experience/energy/energy-catalog";
import { ELECTRICAL_SOCKETS, ELECTRICAL_SWITCHES, LIGHTING_FIXTURES } from "@/lib/experience/lighting/lighting-catalog";
import { SECURITY_DEVICE_LABELS, SECURITY_DEVICES } from "@/lib/experience/security/security-catalog";
import type {
  ConfigurationCategory,
  ConfigurationCostSummary,
  ConfigurationCrmLeadPayload,
  ConfigurationDesignSnapshot,
  ConfigurationExportArtifact,
  ConfigurationItem,
  ConfigurationPackage,
  ConfigurationPackageId,
  ConfigurationPricing,
  ConfigurationProposal,
  ConfigurationReport,
  ElectricalSocketSpec,
  ElectricalSwitchSpec,
  EnergyRecommendation,
  LightingFixtureSpec,
  SecurityDeviceSpec,
  SmartDeviceCategory,
  SmartDeviceSnapshot,
} from "@/types/experience";

export const CONFIGURATION_CATEGORIES: readonly ConfigurationCategory[] = [
  "lighting",
  "security",
  "hvac",
  "curtains",
  "audio",
  "network",
  "solar",
  "power",
  "pool",
  "garden",
  "garage",
] as const;

export const CONFIGURATION_CATEGORY_LABELS: Record<ConfigurationCategory, string> = {
  lighting: "Lighting",
  security: "Security",
  hvac: "HVAC",
  curtains: "Curtains",
  audio: "Audio",
  network: "Network",
  solar: "Solar",
  power: "Power",
  pool: "Pool",
  garden: "Garden",
  garage: "Garage",
};

export const CONFIGURATION_CATEGORY_COLORS: Record<ConfigurationCategory, string> = {
  lighting: "#fff2cf",
  security: "#ff6378",
  hvac: "#70c2ff",
  curtains: "#d8b35f",
  audio: "#d4c1ff",
  network: "#72d8ff",
  solar: "#ffd36e",
  power: "#8ff0c7",
  pool: "#62d9ff",
  garden: "#8fe388",
  garage: "#cdd5df",
};

export const CONFIGURATION_PACKAGE_ORDER: readonly ConfigurationPackageId[] = ["basic", "standard", "premium", "luxury", "ultra-luxury"] as const;

const TAX_RATE = 0.075;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function pricing(equipmentCost: number, installationCost: number, labourCost: number): ConfigurationPricing {
  return {
    equipmentCost: round(equipmentCost),
    installationCost: round(installationCost),
    labourCost: round(labourCost),
    currency: "USD",
  };
}

function smartDeviceCategory(category: SmartDeviceCategory): ConfigurationCategory {
  if (category === "lighting" || category === "switches") return "lighting";
  if (
    category === "cctv" ||
    category === "doorbells" ||
    category === "smart-locks" ||
    category === "motion-sensors" ||
    category === "door-sensors" ||
    category === "window-sensors" ||
    category === "smoke-detector" ||
    category === "gas-detector" ||
    category === "water-leak-sensor"
  ) return "security";
  if (category === "thermostats" || category === "hvac" || category === "temperature-sensor" || category === "humidity-sensor" || category === "ir-blaster") return "hvac";
  if (category === "curtains" || category === "blinds") return "curtains";
  if (category === "smart-tv" || category === "audio-system") return "audio";
  if (category === "smart-hub" || category === "voice-assistant" || category === "sockets") return "network";
  if (category === "solar-inverter") return "solar";
  if (category === "battery-storage" || category === "ups" || category === "ev-charger" || category === "water-heater") return "power";
  if (category === "pool-controller") return "pool";
  if (category === "garden-irrigation") return "garden";
  if (category === "garage-controller" || category === "gate-controller") return "garage";
  return "network";
}

function categoryRank(category: ConfigurationCategory, source: ConfigurationItem["source"], equipmentCost: number): ConfigurationItem["packageRank"] {
  if (category === "lighting" || category === "security" || category === "network") return equipmentCost > 700 ? 3 : 1;
  if (category === "hvac" || category === "curtains" || category === "garage") return equipmentCost > 700 ? 3 : 2;
  if (category === "audio" || category === "pool" || category === "garden") return equipmentCost > 2000 ? 4 : 3;
  if (category === "solar" || category === "power") return source === "energy-recommendation" || equipmentCost > 4000 ? 5 : 4;
  return 3;
}

function smartDeviceItem(device: SmartDeviceSnapshot): ConfigurationItem {
  const category = smartDeviceCategory(device.category);
  const equipmentCost = device.pricing.equipmentPrice;
  const installationCost = device.pricing.installationPrice;
  const labourCost = round(Math.max(35, installationCost * 0.38));

  return {
    id: `config-smart-${device.uniqueId}`,
    name: device.name,
    category,
    source: "smart-device",
    sourceId: device.uniqueId,
    roomId: device.roomId,
    roomName: device.roomName,
    manufacturer: device.manufacturer,
    model: device.model,
    description: `${DEVICE_CATEGORY_LABELS[device.category]} for ${device.roomName}.`,
    pricing: pricing(equipmentCost, installationCost, labourCost),
    packageRank: categoryRank(category, "smart-device", equipmentCost),
    selectable: true,
    render: {
      position: device.placeholder.position,
      size: [0.18, 0.18, 0.18],
      color: CONFIGURATION_CATEGORY_COLORS[category],
      visibility: true,
      lod: "mid",
      collision: false,
      shadow: false,
    },
  };
}

function securityItem(device: SecurityDeviceSpec): ConfigurationItem {
  const category: ConfigurationCategory = device.type === "garage-sensor" || device.type === "gate-sensor" ? "garage" : "security";
  const equipmentCost = device.pricing.equipmentCost;

  return {
    id: `config-security-${device.id}`,
    name: device.name,
    category,
    source: "security-device",
    sourceId: device.id,
    roomId: device.roomId,
    roomName: device.roomName,
    manufacturer: device.manufacturer,
    model: device.model,
    description: `${SECURITY_DEVICE_LABELS[device.type]} security endpoint with live-map readiness.`,
    pricing: pricing(equipmentCost, device.pricing.installationCost, device.pricing.labourCost),
    packageRank: categoryRank(category, "security-device", equipmentCost),
    selectable: true,
    render: {
      position: device.render.position,
      size: [0.16, 0.16, 0.16],
      color: CONFIGURATION_CATEGORY_COLORS[category],
      visibility: true,
      lod: device.render.lod,
      collision: false,
      shadow: false,
    },
  };
}

function lightingItem(fixture: LightingFixtureSpec): ConfigurationItem {
  return {
    id: `config-light-${fixture.id}`,
    name: fixture.name,
    category: fixture.type === "garden-lights" ? "garden" : fixture.type === "pool-lights" ? "pool" : "lighting",
    source: "lighting",
    sourceId: fixture.id,
    roomId: fixture.roomId,
    roomName: fixture.roomName,
    manufacturer: fixture.manufacturer,
    model: fixture.model,
    description: `${fixture.type.replace(/-/g, " ")} with ${fixture.controls.brightnessPercent}% brightness and ${fixture.controls.temperatureKelvin}K temperature.`,
    pricing: pricing(fixture.pricing.equipmentCost, fixture.pricing.installationCost, fixture.pricing.labourCost),
    packageRank: categoryRank("lighting", "lighting", fixture.pricing.equipmentCost),
    selectable: true,
    render: {
      position: fixture.render.position,
      size: [0.12, 0.12, 0.12],
      color: CONFIGURATION_CATEGORY_COLORS.lighting,
      visibility: true,
      lod: fixture.render.lod,
      collision: false,
      shadow: false,
    },
  };
}

function switchItem(switchSpec: ElectricalSwitchSpec): ConfigurationItem {
  return {
    id: `config-switch-${switchSpec.id}`,
    name: switchSpec.name,
    category: "lighting",
    source: "switch",
    sourceId: switchSpec.id,
    roomId: switchSpec.roomId,
    roomName: switchSpec.roomName,
    manufacturer: switchSpec.manufacturer,
    model: switchSpec.model,
    description: `${switchSpec.gangCount}-gang ${switchSpec.type.replace(/-/g, " ")} switch for ${switchSpec.roomName}.`,
    pricing: pricing(switchSpec.pricing.equipmentCost, switchSpec.pricing.installationCost, switchSpec.pricing.labourCost),
    packageRank: switchSpec.supportsDimming || switchSpec.touch ? 2 : 1,
    selectable: true,
    render: {
      position: switchSpec.position,
      size: [0.12, 0.12, 0.08],
      color: CONFIGURATION_CATEGORY_COLORS.lighting,
      visibility: true,
      lod: "mid",
      collision: false,
      shadow: false,
    },
  };
}

function socketItem(socket: ElectricalSocketSpec): ConfigurationItem {
  const category: ConfigurationCategory = socket.solarBacked ? "solar" : socket.upsBacked ? "power" : socket.outdoorRated ? "garden" : "network";

  return {
    id: `config-socket-${socket.id}`,
    name: socket.name,
    category,
    source: "socket",
    sourceId: socket.id,
    roomId: socket.roomId,
    roomName: socket.roomName,
    manufacturer: socket.manufacturer,
    model: socket.model,
    description: `${socket.type.replace(/-/g, " ")} socket rated ${socket.ratedVoltage}V / ${socket.ratedAmps}A.`,
    pricing: pricing(socket.pricing.equipmentCost, socket.pricing.installationCost, socket.pricing.labourCost),
    packageRank: socket.solarBacked || socket.upsBacked ? 4 : socket.outdoorRated ? 3 : 2,
    selectable: true,
    render: {
      position: socket.position,
      size: [0.11, 0.11, 0.07],
      color: CONFIGURATION_CATEGORY_COLORS[category],
      visibility: true,
      lod: "mid",
      collision: false,
      shadow: false,
    },
  };
}

function energyItem(item: EnergyRecommendation, index: number): ConfigurationItem {
  const category: ConfigurationCategory = item.type === "solar-size" ? "solar" : item.type === "battery-size" || item.type === "ups" || item.type === "circuit-upgrade" ? "power" : "network";
  const sitePositions: readonly [number, number, number][] = [
    [-6.4, 5.9, -6.4],
    [-3.6, 5.6, -4.2],
    [1.8, 4.6, -4.2],
    [4.2, 3.4, -3.4],
    [6.4, 2.2, -2.2],
  ];

  return {
    id: `config-energy-${item.id}`,
    name: item.title,
    category,
    source: "energy-recommendation",
    sourceId: item.id,
    roomId: null,
    roomName: null,
    manufacturer: "SmartHive",
    model: item.recommendation,
    description: item.reason,
    pricing: pricing(item.equipmentCost, item.installationCost, item.labourCost),
    packageRank: categoryRank(category, "energy-recommendation", item.equipmentCost),
    selectable: true,
    render: {
      position: sitePositions[index % sitePositions.length],
      size: [0.24, 0.24, 0.24],
      color: CONFIGURATION_CATEGORY_COLORS[category],
      visibility: true,
      lod: "far",
      collision: false,
      shadow: false,
    },
  };
}

export const CONFIGURATION_ITEMS: readonly ConfigurationItem[] = [
  ...SMART_DEVICES.map(smartDeviceItem),
  ...SECURITY_DEVICES.map(securityItem),
  ...LIGHTING_FIXTURES.map(lightingItem),
  ...ELECTRICAL_SWITCHES.map(switchItem),
  ...ELECTRICAL_SOCKETS.map(socketItem),
  ...ENERGY_RECOMMENDATIONS.map(energyItem),
] as const;

export const CONFIGURATION_ITEM_BY_ID = new Map(CONFIGURATION_ITEMS.map((item) => [item.id, item]));

const PACKAGE_DEFINITIONS: Record<ConfigurationPackageId, Omit<ConfigurationPackage, "itemIds" | "equipmentCost" | "installationCost" | "labourCost" | "taxCost" | "discountAmount" | "grandTotal">> = {
  basic: {
    id: "basic",
    name: "Basic",
    rank: 1,
    description: "Essential lighting, security, and core network readiness.",
    discountPercent: 0,
    categoryCoverage: ["lighting", "security", "network"],
  },
  standard: {
    id: "standard",
    name: "Standard",
    rank: 2,
    description: "Adds practical HVAC, curtains, sockets, and everyday convenience controls.",
    discountPercent: 3,
    categoryCoverage: ["lighting", "security", "hvac", "curtains", "network"],
  },
  premium: {
    id: "premium",
    name: "Premium",
    rank: 3,
    description: "Adds audio, garden, garage, and higher-end room experiences.",
    discountPercent: 5,
    categoryCoverage: ["lighting", "security", "hvac", "curtains", "audio", "network", "garden", "garage"],
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    rank: 4,
    description: "Adds power protection, pool systems, solar-ready circuits, and luxury systems.",
    discountPercent: 7,
    categoryCoverage: ["lighting", "security", "hvac", "curtains", "audio", "network", "power", "pool", "garden", "garage"],
  },
  "ultra-luxury": {
    id: "ultra-luxury",
    name: "Ultra Luxury",
    rank: 5,
    description: "Full-villa ultra-luxury smart estate configuration with solar, power, pool, garden, and SOC-ready systems.",
    discountPercent: 10,
    categoryCoverage: CONFIGURATION_CATEGORIES,
  },
};

function packageItemIds(packageId: ConfigurationPackageId) {
  const definition = PACKAGE_DEFINITIONS[packageId];
  return CONFIGURATION_ITEMS.filter((item) => item.packageRank <= definition.rank && definition.categoryCoverage.includes(item.category)).map((item) => item.id);
}

export function calculateConfigurationCost(selectedItemIds: readonly string[], packageId: ConfigurationPackageId): ConfigurationCostSummary {
  const definition = PACKAGE_DEFINITIONS[packageId];
  const selectedItems = selectedItemIds.map((id) => CONFIGURATION_ITEM_BY_ID.get(id)).filter((item): item is ConfigurationItem => Boolean(item));
  const equipmentCost = round(selectedItems.reduce((total, item) => total + item.pricing.equipmentCost, 0));
  const installationCost = round(selectedItems.reduce((total, item) => total + item.pricing.installationCost, 0));
  const labourCost = round(selectedItems.reduce((total, item) => total + item.pricing.labourCost, 0));
  const subtotal = equipmentCost + installationCost + labourCost;
  const discountAmount = round(subtotal * (definition.discountPercent / 100));
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxCost = round(taxableAmount * TAX_RATE);

  return {
    selectedItemCount: selectedItems.length,
    packageId,
    equipmentCost,
    installationCost,
    labourCost,
    taxRate: TAX_RATE,
    taxCost,
    discountPercent: definition.discountPercent,
    discountAmount,
    grandTotal: round(taxableAmount + taxCost),
    currency: "USD",
  };
}

function createPackage(packageId: ConfigurationPackageId): ConfigurationPackage {
  const definition = PACKAGE_DEFINITIONS[packageId];
  const itemIds = packageItemIds(packageId);
  const cost = calculateConfigurationCost(itemIds, packageId);

  return {
    ...definition,
    itemIds,
    equipmentCost: cost.equipmentCost,
    installationCost: cost.installationCost,
    labourCost: cost.labourCost,
    taxCost: cost.taxCost,
    discountAmount: cost.discountAmount,
    grandTotal: cost.grandTotal,
  };
}

export const CONFIGURATION_PACKAGES: readonly ConfigurationPackage[] = CONFIGURATION_PACKAGE_ORDER.map(createPackage);

export const DEFAULT_CONFIGURATION_PACKAGE_ID: ConfigurationPackageId = "ultra-luxury";
export const DEFAULT_CONFIGURATION_ITEM_IDS: readonly string[] = packageItemIds(DEFAULT_CONFIGURATION_PACKAGE_ID);

export function createConfigurationDesignSnapshot(selectedItemIds: readonly string[], packageId: ConfigurationPackageId): ConfigurationDesignSnapshot {
  const costSummary = calculateConfigurationCost(selectedItemIds, packageId);
  const shareToken = `she-${packageId}-${selectedItemIds.length}-${Math.round(costSummary.grandTotal)}`.toLowerCase();

  return {
    id: `config-design-${packageId}`,
    name: `${PACKAGE_DEFINITIONS[packageId].name} Signature Villa Configuration`,
    packageId,
    selectedItemIds,
    selectedItemCount: selectedItemIds.length,
    costSummary,
    customerAccountReady: true,
    loadLaterReady: true,
    shareToken,
    shareUrl: `/experience?config=${shareToken}`,
    savedAtLabel: "Local design payload ready",
    persistence: "local-serializable-payload",
  };
}

export function createConfigurationExportArtifacts(selectedItemIds: readonly string[]): readonly ConfigurationExportArtifact[] {
  const selectedItems = selectedItemIds.map((id) => CONFIGURATION_ITEM_BY_ID.get(id)).filter((item): item is ConfigurationItem => Boolean(item));
  const categories = new Set(selectedItems.map((item) => item.category));

  return [
    artifact("config-export-proposal", "proposal", "Professional Proposal", "Executive customer proposal assembled from selected systems, package, rooms, pricing, and delivery notes.", selectedItems.length),
    artifact("config-export-pdf", "pdf", "PDF", "PDF-ready proposal payload. Existing PDF generator remains untouched.", selectedItems.length),
    artifact("config-export-images", "images", "Images", "Image export request list for selected villa views and configured device hotspots.", categories.size),
    artifact("config-export-device-list", "device-list", "Device List", "Room-by-room device list with manufacturer, model, category, and pricing.", selectedItems.length),
    artifact("config-export-installation-plan", "installation-plan", "Installation Plan", "Installer-ready plan grouped by room, category, and system domain.", categories.size),
    artifact("config-export-bom", "bill-of-materials", "Bill of Materials", "Bill of materials from all selected equipment, installation, and labour line items.", selectedItems.length),
  ];
}

function artifact(id: string, type: ConfigurationExportArtifact["type"], title: string, description: string, itemCount: number): ConfigurationExportArtifact {
  return {
    id,
    type,
    title,
    description,
    itemCount,
    ready: true,
    existingPdfEngineModified: false,
  };
}

export function createConfigurationProposal(selectedItemIds: readonly string[], packageId: ConfigurationPackageId): ConfigurationProposal {
  const designSnapshot = createConfigurationDesignSnapshot(selectedItemIds, packageId);
  const exports = createConfigurationExportArtifacts(selectedItemIds);

  return {
    id: `config-proposal-${packageId}`,
    title: `${PACKAGE_DEFINITIONS[packageId].name} SmartHive Signature Villa Proposal`,
    packageId,
    sections: [
      "Executive Summary",
      "Selected Package",
      "Real-Time Cost Summary",
      "Configured Device List",
      "Room-by-Room Scope",
      "Installation Plan",
      "Bill of Materials",
      "CRM Handoff Payload",
    ],
    exports,
    designSnapshot,
    costSummary: designSnapshot.costSummary,
    professionalProposalReady: true,
  };
}

export function createConfigurationCrmLeadPayload(selectedItemIds: readonly string[], packageId: ConfigurationPackageId): ConfigurationCrmLeadPayload {
  const costSummary = calculateConfigurationCost(selectedItemIds, packageId);

  return {
    id: `crm-lead-${packageId}-${selectedItemIds.length}`,
    customerName: "Signature Villa Configurator Customer",
    source: "experience-configurator",
    packageId,
    estimatedValue: costSummary.grandTotal,
    selectedItemCount: selectedItemIds.length,
    assignedSalesStaff: costSummary.grandTotal > 500000 ? "Enterprise Sales Director" : "Smart Home Consultant",
    status: "proposal-ready",
    nextAction: "Review configuration, confirm site requirements, and convert payload through CRM integration.",
    crmIntegrationReady: true,
    existingCrmModified: false,
    apiModified: false,
    databaseModified: false,
  };
}

export const DEFAULT_CONFIGURATION_COST_SUMMARY = calculateConfigurationCost(DEFAULT_CONFIGURATION_ITEM_IDS, DEFAULT_CONFIGURATION_PACKAGE_ID);
export const DEFAULT_CONFIGURATION_PROPOSAL = createConfigurationProposal(DEFAULT_CONFIGURATION_ITEM_IDS, DEFAULT_CONFIGURATION_PACKAGE_ID);
export const DEFAULT_CONFIGURATION_CRM_LEAD = createConfigurationCrmLeadPayload(DEFAULT_CONFIGURATION_ITEM_IDS, DEFAULT_CONFIGURATION_PACKAGE_ID);

export const CONFIGURATION_REPORT: ConfigurationReport = {
  itemCount: CONFIGURATION_ITEMS.length,
  packageCount: CONFIGURATION_PACKAGES.length,
  categoryCount: CONFIGURATION_CATEGORIES.length,
  selectableDeviceCount: CONFIGURATION_ITEMS.filter((item) => item.render !== null).length,
  defaultCostSummary: DEFAULT_CONFIGURATION_COST_SUMMARY,
  packageComparison: CONFIGURATION_PACKAGES,
  exportArtifacts: DEFAULT_CONFIGURATION_PROPOSAL.exports,
  crmLeadPayload: DEFAULT_CONFIGURATION_CRM_LEAD,
  capabilities: {
    walkThroughConfigurator: true,
    clickDevicesToConfigure: true,
    realTimeCosting: true,
    packageComparison: true,
    saveDesignPayload: true,
    sharePayload: true,
    exportPayloads: true,
    proposalReady: true,
    crmLeadPayloadReady: true,
  },
  constraints: {
    customerAccountSystem: "payload-only",
    externalPdfEngine: "untouched",
    externalCrm: "untouched",
    api: "untouched",
    database: "untouched",
    authentication: "untouched",
  },
};

export function getConfigurationItem(itemId: string) {
  return CONFIGURATION_ITEM_BY_ID.get(itemId) ?? null;
}

export function getConfigurationPackage(packageId: ConfigurationPackageId) {
  return CONFIGURATION_PACKAGES.find((configurationPackage) => configurationPackage.id === packageId) ?? null;
}
