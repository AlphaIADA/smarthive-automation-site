import {
  CONFIGURATION_ITEMS,
  DEFAULT_CONFIGURATION_PACKAGE_ID,
  calculateConfigurationCost,
} from "@/lib/experience/configuration/configuration-catalog";
import { GUIDED_TOUR_STOPS } from "@/lib/experience/immersive";
import type {
  ConfigurationItem,
  ConfigurationPricing,
  XrArPlacementAnchor,
  XrArPlacementCategory,
  XrCapabilityProfile,
  XrDeviceClass,
  XrFrameworkReport,
  XrMode,
  XrModeProfile,
  XrPerformanceProfile,
  XrPresentationStep,
  XrQualityLevel,
  XrQuotationUpdateSummary,
  XrVrControllerProfile,
} from "@/types/experience";

export const XR_DEVICE_CLASSES: readonly XrDeviceClass[] = [
  "desktop",
  "mobile",
  "tablet",
  "virtual-reality",
  "augmented-reality",
  "mixed-reality",
  "apple-vision-pro",
  "meta-quest",
  "android-xr",
] as const;

export const XR_MODES: readonly XrMode[] = ["desktop", "touch", "walk", "vr", "ar-placement", "presentation", "client-demo"] as const;

export const XR_AR_PLACEMENT_CATEGORIES: readonly XrArPlacementCategory[] = [
  "smart-switches",
  "curtains",
  "sensors",
  "cameras",
  "door-locks",
  "lighting",
  "panels",
  "thermostats",
  "network-rack",
  "audio",
] as const;

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function zeroPricing(): ConfigurationPricing {
  return {
    equipmentCost: 0,
    installationCost: 0,
    labourCost: 0,
    currency: "USD",
  };
}

function addPricing(items: readonly ConfigurationPricing[]): ConfigurationPricing {
  return items.reduce<ConfigurationPricing>(
    (total, item) => ({
      equipmentCost: round(total.equipmentCost + item.equipmentCost),
      installationCost: round(total.installationCost + item.installationCost),
      labourCost: round(total.labourCost + item.labourCost),
      currency: "USD",
    }),
    zeroPricing(),
  );
}

function placementCategory(item: ConfigurationItem): XrArPlacementCategory | null {
  if (item.source === "switch") return "smart-switches";
  if (item.category === "curtains") return "curtains";
  if (item.category === "security" && item.name.toLowerCase().includes("sensor")) return "sensors";
  if (item.category === "security" && item.name.toLowerCase().includes("camera")) return "cameras";
  if (item.category === "security" && item.name.toLowerCase().includes("lock")) return "door-locks";
  if (item.category === "lighting") return "lighting";
  if (item.category === "power" || item.category === "solar") return "panels";
  if (item.category === "hvac") return "thermostats";
  if (item.category === "network") return "network-rack";
  if (item.category === "audio") return "audio";
  return null;
}

function estimatedPosition(item: ConfigurationItem, index: number): readonly [number, number, number] {
  if (item.render) return item.render.position;
  const column = index % 6;
  const row = Math.floor(index / 6);
  return [-4.5 + column * 1.6, 1.45, -3.8 + row * 1.4] as const;
}

function placementNormal(category: XrArPlacementCategory): readonly [number, number, number] {
  if (category === "lighting" || category === "panels") return [0, -1, 0] as const;
  if (category === "network-rack" || category === "audio") return [0, 0, 1] as const;
  return [0, 0, -1] as const;
}

function placementHeight(category: XrArPlacementCategory) {
  if (category === "lighting") return 2.7;
  if (category === "cameras" || category === "sensors") return 2.35;
  if (category === "curtains") return 2.2;
  if (category === "thermostats" || category === "smart-switches") return 1.25;
  if (category === "door-locks") return 1.05;
  if (category === "network-rack" || category === "audio" || category === "panels") return 1.55;
  return 1.35;
}

function buildArPlacementAnchors() {
  const anchors: XrArPlacementAnchor[] = [];
  const seenCategories = new Set<XrArPlacementCategory>();

  CONFIGURATION_ITEMS.forEach((item, index) => {
    const category = placementCategory(item);
    if (!category) return;
    if (anchors.length >= 160 && seenCategories.has(category)) return;
    seenCategories.add(category);

    anchors.push({
      id: `xr-ar-anchor-${item.id}`,
      category,
      label: item.name,
      configurationItemId: item.id,
      categoryMappedFrom: item.category,
      roomId: item.roomId,
      roomName: item.roomName,
      estimatedPosition: estimatedPosition(item, index),
      estimatedNormal: placementNormal(category),
      placementHeightMeters: placementHeight(category),
      installZoneRadiusMeters: category === "network-rack" || category === "panels" ? 0.85 : 0.35,
      pricing: item.pricing,
      quotationUpdateReady: true,
    });
  });

  return anchors;
}

export const XR_CAPABILITY_PROFILES: readonly XrCapabilityProfile[] = [
  {
    deviceClass: "desktop",
    label: "Desktop",
    supportedModes: ["desktop", "walk", "presentation", "client-demo"],
    inputSources: ["mouse", "keyboard"],
    targetFps: 60,
    requiresWebXr: false,
    futureHardwareReady: true,
    notes: "Primary browser experience with orbit, walk, and guided presentation support.",
  },
  {
    deviceClass: "mobile",
    label: "Mobile",
    supportedModes: ["touch", "ar-placement", "presentation", "client-demo"],
    inputSources: ["touch"],
    targetFps: 60,
    requiresWebXr: false,
    futureHardwareReady: true,
    notes: "Touch-first UI with AR placement payloads ready for native camera/session integration.",
  },
  {
    deviceClass: "tablet",
    label: "Tablet",
    supportedModes: ["touch", "ar-placement", "presentation", "client-demo"],
    inputSources: ["touch"],
    targetFps: 60,
    requiresWebXr: false,
    futureHardwareReady: true,
    notes: "Larger touch surface for client demo and AR room planning.",
  },
  {
    deviceClass: "virtual-reality",
    label: "Virtual Reality",
    supportedModes: ["vr", "walk", "presentation", "client-demo"],
    inputSources: ["controller"],
    targetFps: 90,
    requiresWebXr: true,
    futureHardwareReady: true,
    notes: "WebXR VR session contract with teleport, walk, laser pointer, and interactive UI readiness.",
  },
  {
    deviceClass: "augmented-reality",
    label: "Augmented Reality",
    supportedModes: ["ar-placement", "touch", "presentation"],
    inputSources: ["touch"],
    targetFps: 60,
    requiresWebXr: true,
    futureHardwareReady: true,
    notes: "AR anchors estimate installation locations inside customer rooms.",
  },
  {
    deviceClass: "mixed-reality",
    label: "Mixed Reality",
    supportedModes: ["ar-placement", "vr", "presentation", "client-demo"],
    inputSources: ["controller", "touch"],
    targetFps: 90,
    requiresWebXr: true,
    futureHardwareReady: true,
    notes: "Mixed reality profile combines villa exploration with room-scale device placement.",
  },
  {
    deviceClass: "apple-vision-pro",
    label: "Future Apple Vision Pro",
    supportedModes: ["ar-placement", "presentation", "client-demo", "vr"],
    inputSources: ["touch", "controller"],
    targetFps: 90,
    requiresWebXr: true,
    futureHardwareReady: true,
    notes: "Spatial computing readiness profile; native VisionOS bridge not implemented in this milestone.",
  },
  {
    deviceClass: "meta-quest",
    label: "Future Meta Quest",
    supportedModes: ["vr", "walk", "presentation", "client-demo"],
    inputSources: ["controller"],
    targetFps: 90,
    requiresWebXr: true,
    futureHardwareReady: true,
    notes: "Quest controller profile with teleport, laser pointer, and interactive UI readiness.",
  },
  {
    deviceClass: "android-xr",
    label: "Future Android XR",
    supportedModes: ["ar-placement", "vr", "presentation", "client-demo"],
    inputSources: ["touch", "controller"],
    targetFps: 90,
    requiresWebXr: true,
    futureHardwareReady: true,
    notes: "Android XR readiness profile for AR placement and immersive villa walkthroughs.",
  },
] as const;

function modeProfile(mode: XrMode, label: string, supportedDevices: readonly XrDeviceClass[], defaultQuality: XrQualityLevel): XrModeProfile {
  return {
    mode,
    label,
    enabled: true,
    supportedDevices,
    defaultQuality,
    usesVillaScene: mode !== "ar-placement",
    usesCameraTour: mode === "presentation" || mode === "client-demo" || mode === "desktop",
    usesTouchUi: mode === "touch" || mode === "ar-placement" || mode === "client-demo",
    usesControllerUi: mode === "vr",
    voiceCommandsReady: mode === "vr" || mode === "presentation" || mode === "client-demo",
  };
}

export const XR_MODE_PROFILES: readonly XrModeProfile[] = [
  modeProfile("desktop", "Desktop Mode", ["desktop"], "high"),
  modeProfile("touch", "Touch Mode", ["mobile", "tablet"], "balanced"),
  modeProfile("walk", "Walk Mode", ["desktop", "virtual-reality", "meta-quest"], "high"),
  modeProfile("vr", "VR Mode", ["virtual-reality", "mixed-reality", "apple-vision-pro", "meta-quest", "android-xr"], "performance"),
  modeProfile("ar-placement", "AR Placement Mode", ["mobile", "tablet", "augmented-reality", "mixed-reality", "apple-vision-pro", "android-xr"], "balanced"),
  modeProfile("presentation", "Presentation Mode", XR_DEVICE_CLASSES, "high"),
  modeProfile("client-demo", "Client Demo Mode", XR_DEVICE_CLASSES, "balanced"),
] as const;

export const XR_VR_CONTROLLER_PROFILES: readonly XrVrControllerProfile[] = [
  {
    id: "xr-controller-left",
    hand: "left",
    label: "Left VR Controller",
    inputs: ["trigger", "grip", "thumbstick", "menu", "gesture-pinch"],
    locomotion: ["teleport", "walk"],
    laserPointer: true,
    uiInteraction: true,
    hapticsReady: true,
    voiceCommandsReady: true,
  },
  {
    id: "xr-controller-right",
    hand: "right",
    label: "Right VR Controller",
    inputs: ["trigger", "grip", "thumbstick", "touchpad", "hand-ray"],
    locomotion: ["teleport", "laser-pointer"],
    laserPointer: true,
    uiInteraction: true,
    hapticsReady: true,
    voiceCommandsReady: true,
  },
] as const;

export const XR_AR_PLACEMENT_ANCHORS: readonly XrArPlacementAnchor[] = buildArPlacementAnchors();

function anchorFor(category: XrArPlacementCategory) {
  return XR_AR_PLACEMENT_ANCHORS.find((anchor) => anchor.category === category) ?? XR_AR_PLACEMENT_ANCHORS[0];
}

export const XR_PRESENTATION_STEPS: readonly XrPresentationStep[] = [
  ...GUIDED_TOUR_STOPS.slice(0, 6).map((stop, index) => {
    const anchor = XR_AR_PLACEMENT_ANCHORS[index % XR_AR_PLACEMENT_ANCHORS.length];
    return {
      id: `xr-presentation-tour-${stop.id}`,
      type: index === 0 ? "guided-demo" : "automatic-camera-tour",
      order: index + 1,
      title: stop.label,
      description: stop.narrationPrompt,
      tourStopId: stop.id,
      configurationItemId: anchor?.configurationItemId ?? null,
      recommendation: `Use ${stop.label} as an XR explanation point for installed devices, installation routes, and package value.`,
      quotationDelta: anchor?.pricing ?? zeroPricing(),
    } satisfies XrPresentationStep;
  }),
  {
    id: "xr-presentation-hotspots",
    type: "interactive-hotspot",
    order: 7,
    title: "Interactive Hotspots",
    description: "Client can point at SmartHive hotspots and see room-specific device options.",
    tourStopId: null,
    configurationItemId: anchorFor("lighting")?.configurationItemId ?? null,
    recommendation: "Use hotspot focus to explain lighting, security, HVAC, curtains, audio, and network upgrades.",
    quotationDelta: anchorFor("lighting")?.pricing ?? zeroPricing(),
  },
  {
    id: "xr-presentation-device-explanations",
    type: "device-explanation",
    order: 8,
    title: "Device Explanations",
    description: "Explain devices in client language with install location, warranty, power, and future automation hooks.",
    tourStopId: null,
    configurationItemId: anchorFor("smart-switches")?.configurationItemId ?? null,
    recommendation: "Explain each device from the XR pointer target before adding it to the proposal.",
    quotationDelta: anchorFor("smart-switches")?.pricing ?? zeroPricing(),
  },
  {
    id: "xr-presentation-installation-recommendations",
    type: "installation-recommendation",
    order: 9,
    title: "Installation Recommendations",
    description: "Show estimated installation locations for switches, curtains, sensors, cameras, locks, panels, thermostats, rack, audio, and lights.",
    tourStopId: null,
    configurationItemId: anchorFor("network-rack")?.configurationItemId ?? null,
    recommendation: "Use AR placement anchors as estimated installer guidance before final site survey.",
    quotationDelta: anchorFor("network-rack")?.pricing ?? zeroPricing(),
  },
  {
    id: "xr-presentation-quotation-update",
    type: "quotation-update",
    order: 10,
    title: "Quotation Updates",
    description: "Update internal quotation payloads as devices are placed or selected during the client demo.",
    tourStopId: null,
    configurationItemId: anchorFor("cameras")?.configurationItemId ?? null,
    recommendation: "Use XR selections to update internal quote payloads while keeping the existing quote engine untouched.",
    quotationDelta: anchorFor("cameras")?.pricing ?? zeroPricing(),
  },
] as const;

export const XR_PERFORMANCE_PROFILE: XrPerformanceProfile = {
  targetDesktopFps: 60,
  targetMobileFps: 60,
  targetVrFps: 90,
  dynamicQualityScaling: true,
  foveatedRenderingReady: true,
  occlusionReady: true,
  controllerMeshesCapped: true,
  arAnchorsCapped: true,
  recommendedQuality: "performance",
};

export function calculateXrQuotationUpdate(anchorIds: readonly string[]): XrQuotationUpdateSummary {
  const selectedAnchors = XR_AR_PLACEMENT_ANCHORS.filter((anchor) => anchorIds.includes(anchor.id));
  const selectedConfigurationItemIds = selectedAnchors.map((anchor) => anchor.configurationItemId);
  const configurationCost = calculateConfigurationCost(selectedConfigurationItemIds, DEFAULT_CONFIGURATION_PACKAGE_ID);
  const anchorPricing = addPricing(selectedAnchors.map((anchor) => anchor.pricing));

  return {
    selectedPlacementCount: selectedAnchors.length,
    equipmentCost: round(anchorPricing.equipmentCost),
    installationCost: round(anchorPricing.installationCost),
    labourCost: round(anchorPricing.labourCost),
    totalCost: round(configurationCost.equipmentCost + configurationCost.installationCost + configurationCost.labourCost),
    currency: "USD",
    source: "experience-xr-placement-internal-model",
    externalQuoteEngineModified: false,
  };
}

export const DEFAULT_XR_ANCHOR_IDS: readonly string[] = XR_AR_PLACEMENT_CATEGORIES.map((category) => anchorFor(category)?.id).filter((id): id is string => Boolean(id));
export const XR_DEFAULT_QUOTATION_UPDATE: XrQuotationUpdateSummary = calculateXrQuotationUpdate(DEFAULT_XR_ANCHOR_IDS);

export function getXrModeProfile(mode: XrMode) {
  return XR_MODE_PROFILES.find((profile) => profile.mode === mode) ?? XR_MODE_PROFILES[0];
}

export function getXrArPlacementAnchor(anchorId: string) {
  return XR_AR_PLACEMENT_ANCHORS.find((anchor) => anchor.id === anchorId) ?? null;
}

export const XrFrameworkApi = {
  GetModeProfile: getXrModeProfile,
  GetArPlacementAnchor: getXrArPlacementAnchor,
  CalculateQuotationUpdate: calculateXrQuotationUpdate,
} as const;

export const XR_FRAMEWORK_REPORT: XrFrameworkReport = {
  deviceClassCount: XR_DEVICE_CLASSES.length,
  modeCount: XR_MODES.length,
  arPlacementCount: XR_AR_PLACEMENT_ANCHORS.length,
  vrControllerCount: XR_VR_CONTROLLER_PROFILES.length,
  presentationStepCount: XR_PRESENTATION_STEPS.length,
  supportedDeviceClasses: XR_DEVICE_CLASSES,
  modes: {
    desktop: true,
    touch: true,
    walk: true,
    vr: true,
    arPlacement: true,
    presentation: true,
    clientDemo: true,
  },
  ar: {
    smartSwitches: true,
    curtains: true,
    sensors: true,
    cameras: true,
    doorLocks: true,
    lighting: true,
    panels: true,
    thermostats: true,
    networkRack: true,
    audio: true,
    installationLocationsEstimated: true,
  },
  vr: {
    villaExplorable: true,
    teleport: true,
    walk: true,
    laserPointer: true,
    interactiveUi: true,
    voiceCommandsReady: true,
  },
  presentation: {
    guidedDemo: true,
    automaticCameraTour: true,
    interactiveHotspots: true,
    deviceExplanations: true,
    installationRecommendations: true,
    quotationUpdates: true,
  },
  performance: XR_PERFORMANCE_PROFILE,
  quotation: XR_DEFAULT_QUOTATION_UPDATE,
  constraints: {
    websiteFunctionality: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    authentication: "untouched",
    nativeXrSessionStarted: false,
    externalQuoteEngine: "untouched",
  },
};
