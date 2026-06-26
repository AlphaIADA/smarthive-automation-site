import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import type {
  InteriorRoom,
  SecurityAccessControlSpec,
  SecurityAccessZone,
  SecurityCameraSpec,
  SecurityDashboardMode,
  SecurityDeviceCategory,
  SecurityDeviceSpec,
  SecurityDeviceType,
  SecurityHealthStatus,
  SecurityMapLayer,
  SecurityNotificationSpec,
  SecurityNotificationType,
  SecurityOnlineStatus,
  SecurityPlaceholderShape,
  SecurityPricing,
  SecurityQuoteRecommendation,
  SecurityQuoteSummary,
  SecurityRegistrySummary,
  SecuritySensorSpec,
  SecurityStorageStatus,
  SecurityPlatformReport,
} from "@/types/experience";

export const SECURITY_DEVICE_TYPES: readonly SecurityDeviceType[] = [
  "indoor-camera",
  "outdoor-camera",
  "ptz-camera",
  "doorbell-camera",
  "video-intercom",
  "motion-detector",
  "door-sensor",
  "window-sensor",
  "glass-break-sensor",
  "smoke-detector",
  "gas-detector",
  "water-leak-sensor",
  "siren",
  "panic-button",
  "fingerprint-lock",
  "face-recognition-lock",
  "card-access",
  "pin-lock",
  "garage-sensor",
  "gate-sensor",
] as const;

export const SECURITY_DASHBOARD_MODES: readonly SecurityDashboardMode[] = ["armed", "disarmed", "partial", "away", "vacation", "emergency"] as const;
export const SECURITY_MAP_LAYERS: readonly SecurityMapLayer[] = ["sensors", "camera-coverage", "locks"] as const;
export const SECURITY_ACCESS_ZONES: readonly SecurityAccessZone[] = ["front-door", "garage", "gate", "bedrooms", "office", "utility-room"] as const;
export const SECURITY_NOTIFICATION_TYPES: readonly SecurityNotificationType[] = ["motion", "door-open", "window-open", "smoke", "gas", "water-leak", "low-battery", "offline-device"] as const;

export const SECURITY_DEVICE_LABELS: Record<SecurityDeviceType, string> = {
  "indoor-camera": "Indoor Camera",
  "outdoor-camera": "Outdoor Camera",
  "ptz-camera": "PTZ Camera",
  "doorbell-camera": "Doorbell Camera",
  "video-intercom": "Video Intercom",
  "motion-detector": "Motion Detector",
  "door-sensor": "Door Sensor",
  "window-sensor": "Window Sensor",
  "glass-break-sensor": "Glass Break Sensor",
  "smoke-detector": "Smoke Detector",
  "gas-detector": "Gas Detector",
  "water-leak-sensor": "Water Leak Sensor",
  siren: "Siren",
  "panic-button": "Panic Button",
  "fingerprint-lock": "Fingerprint Lock",
  "face-recognition-lock": "Face Recognition Lock",
  "card-access": "Card Access",
  "pin-lock": "PIN Lock",
  "garage-sensor": "Garage Sensor",
  "gate-sensor": "Gate Sensor",
};

export const SECURITY_DASHBOARD_MODE_LABELS: Record<SecurityDashboardMode, string> = {
  armed: "Armed",
  disarmed: "Disarmed",
  partial: "Partial",
  away: "Away",
  vacation: "Vacation",
  emergency: "Emergency",
};

export const SECURITY_CATEGORY_LABELS: Record<SecurityDeviceCategory, string> = {
  camera: "Camera",
  sensor: "Sensor",
  "access-control": "Access Control",
  alarm: "Alarm",
  intercom: "Intercom",
};

export const SECURITY_DEVICE_COLORS: Record<SecurityDeviceType, string> = {
  "indoor-camera": "#79d8ff",
  "outdoor-camera": "#5fb8ff",
  "ptz-camera": "#88f2ff",
  "doorbell-camera": "#ffd36e",
  "video-intercom": "#d4c1ff",
  "motion-detector": "#8ff0c7",
  "door-sensor": "#f8d88a",
  "window-sensor": "#9adfff",
  "glass-break-sensor": "#c7efff",
  "smoke-detector": "#f2f4f5",
  "gas-detector": "#ffb26b",
  "water-leak-sensor": "#5fc9ff",
  siren: "#ff5f6f",
  "panic-button": "#ff3d4f",
  "fingerprint-lock": "#d8b35f",
  "face-recognition-lock": "#ffdca3",
  "card-access": "#cdd5df",
  "pin-lock": "#a8b4c2",
  "garage-sensor": "#9eacb6",
  "gate-sensor": "#99c27f",
};

interface SecurityDefaults {
  readonly manufacturer: string;
  readonly model: string;
  readonly firmwareVersion: string;
  readonly equipmentCost: number;
  readonly installationCost: number;
  readonly labourCost: number;
  readonly shape: SecurityPlaceholderShape;
  readonly size: [number, number, number];
  readonly category: SecurityDeviceCategory;
}

const SECURITY_DEFAULTS: Record<SecurityDeviceType, SecurityDefaults> = {
  "indoor-camera": defaults("Axis", "P3265-LV 4K Dome", "11.7.1", 620, 220, 160, "camera", [0.22, 0.16, 0.22], "camera"),
  "outdoor-camera": defaults("Axis", "P1468-LE Bullet", "11.7.1", 780, 260, 190, "camera", [0.34, 0.16, 0.18], "camera"),
  "ptz-camera": defaults("Axis", "Q6135-LE PTZ", "11.9.4", 2400, 420, 280, "camera", [0.32, 0.28, 0.32], "camera"),
  "doorbell-camera": defaults("DoorBird", "D2101V IP Door Station", "5.18.2", 820, 260, 160, "intercom", [0.16, 0.3, 0.08], "intercom"),
  "video-intercom": defaults("2N", "IP Verso Luxury Intercom", "2.44.0", 1450, 360, 220, "intercom", [0.2, 0.5, 0.08], "intercom"),
  "motion-detector": defaults("Bosch", "TriTech Motion Detector", "3.4.2", 95, 55, 34, "sensor", [0.13, 0.13, 0.08], "sensor"),
  "door-sensor": defaults("Aqara", "Door Sensor P2", "1.2.1", 39, 35, 22, "sensor", [0.08, 0.16, 0.04], "sensor"),
  "window-sensor": defaults("Aqara", "Window Sensor P2", "1.2.1", 39, 35, 22, "sensor", [0.08, 0.16, 0.04], "sensor"),
  "glass-break-sensor": defaults("Honeywell", "FG1625 Glassbreak", "2.8.7", 120, 60, 38, "sensor", [0.14, 0.14, 0.06], "sensor"),
  "smoke-detector": defaults("Nest", "Protect Wired", "3.5.2", 129, 90, 42, "sensor", [0.18, 0.05, 0.18], "sensor"),
  "gas-detector": defaults("Shelly", "Gas LPG", "2.1.9", 64, 55, 35, "sensor", [0.13, 0.13, 0.06], "sensor"),
  "water-leak-sensor": defaults("Fibaro", "Flood Sensor", "5.1.4", 72, 55, 34, "sensor", [0.12, 0.05, 0.12], "sensor"),
  siren: defaults("Ajax", "StreetSiren DoubleDeck", "5.8.1", 220, 95, 55, "siren", [0.24, 0.3, 0.08], "alarm"),
  "panic-button": defaults("Ajax", "Button Jeweller", "6.1.2", 48, 32, 20, "button", [0.1, 0.05, 0.1], "alarm"),
  "fingerprint-lock": defaults("Yale", "Linus L2 Fingerprint Pro", "3.9.5", 520, 190, 120, "lock", [0.16, 0.34, 0.08], "access-control"),
  "face-recognition-lock": defaults("Hikvision", "Face Access Terminal", "4.5.9", 980, 260, 180, "lock", [0.18, 0.42, 0.08], "access-control"),
  "card-access": defaults("HID", "Signo Reader 40", "2.3.8", 260, 110, 70, "lock", [0.14, 0.26, 0.06], "access-control"),
  "pin-lock": defaults("Schlage", "Encode Plus Keypad", "2.2.4", 340, 145, 90, "lock", [0.14, 0.32, 0.08], "access-control"),
  "garage-sensor": defaults("LiftMaster", "myQ Door Position Sensor", "4.3.0", 80, 55, 35, "sensor", [0.12, 0.16, 0.05], "sensor"),
  "gate-sensor": defaults("Came", "Gate Magnetic Sensor", "3.7.0", 95, 70, 42, "sensor", [0.12, 0.18, 0.05], "sensor"),
};

function defaults(
  manufacturer: string,
  model: string,
  firmwareVersion: string,
  equipmentCost: number,
  installationCost: number,
  labourCost: number,
  shape: SecurityPlaceholderShape,
  size: [number, number, number],
  category: SecurityDeviceCategory,
): SecurityDefaults {
  return { manufacturer, model, firmwareVersion, equipmentCost, installationCost, labourCost, shape, size, category };
}

function pricing(type: SecurityDeviceType): SecurityPricing {
  const defaultsForType = SECURITY_DEFAULTS[type];
  return {
    equipmentCost: defaultsForType.equipmentCost,
    installationCost: defaultsForType.installationCost,
    labourCost: defaultsForType.labourCost,
    currency: "USD",
  };
}

function roomCenter(room: Pick<InteriorRoom, "boundingBox">): [number, number, number] {
  return [
    (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
    (room.boundingBox.min.y + room.boundingBox.max.y) / 2,
    (room.boundingBox.min.z + room.boundingBox.max.z) / 2,
  ];
}

function ceilingPosition(room: Pick<InteriorRoom, "boundingBox">, xOffset = 0, zOffset = 0): [number, number, number] {
  const [x, , z] = roomCenter(room);
  return [Number((x + xOffset).toFixed(2)), Number((room.boundingBox.max.y - 0.18).toFixed(2)), Number((z + zOffset).toFixed(2))];
}

function wallPosition(room: Pick<InteriorRoom, "boundingBox">, side: "min-x" | "max-x" | "min-z" | "max-z", height = 2.15): [number, number, number] {
  const [centerX, , centerZ] = roomCenter(room);

  if (side === "min-x") return [room.boundingBox.min.x + 0.08, room.boundingBox.min.y + height, centerZ];
  if (side === "max-x") return [room.boundingBox.max.x - 0.08, room.boundingBox.min.y + height, centerZ];
  if (side === "min-z") return [centerX, room.boundingBox.min.y + height, room.boundingBox.min.z + 0.08];
  return [centerX, room.boundingBox.min.y + height, room.boundingBox.max.z - 0.08];
}

function onlineStatus(seed: string): SecurityOnlineStatus {
  return seed.charCodeAt(seed.length - 1) % 17 === 0 ? "offline" : "online";
}

function healthStatus(seed: string): SecurityHealthStatus {
  const value = seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  if (value % 29 === 0) return "service-required";
  if (value % 11 === 0) return "warning";
  return "healthy";
}

function storageStatus(seed: string): SecurityStorageStatus {
  const value = seed.length + seed.charCodeAt(0);
  if (value % 19 === 0) return "retention-warning";
  if (value % 31 === 0) return "offline";
  return "healthy";
}

function battery(type: SecurityDeviceType, seed: string) {
  if (type === "indoor-camera" || type === "outdoor-camera" || type === "ptz-camera" || type === "doorbell-camera" || type === "video-intercom" || type === "smoke-detector" || type === "siren") return null;
  return 52 + (seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % 47);
}

function futureReady(type: SecurityDeviceType) {
  return {
    faceRecognition: type === "face-recognition-lock" || type === "video-intercom" || type === "doorbell-camera",
    anpr: type === "outdoor-camera" || type === "ptz-camera" || type === "gate-sensor",
    visitorManagement: type === "doorbell-camera" || type === "video-intercom" || type === "card-access",
    remoteMonitoring: true,
    cloudRecording: type.includes("camera") || type === "video-intercom",
    mobilePush: true,
    aiDetectionReady: type.includes("camera") || type.includes("sensor"),
    aiAnalysisImplemented: false,
    automationRulesImplemented: false,
    voiceCommandsImplemented: false,
  } as const;
}

function baseFields(type: SecurityDeviceType, room: Pick<InteriorRoom, "id" | "name">, index: number, position: [number, number, number], options: { readonly rotation?: [number, number, number]; readonly color?: string; readonly shape?: SecurityPlaceholderShape; readonly size?: [number, number, number]; readonly lod?: "near" | "mid" | "far"; readonly coverageVisible?: boolean } = {}) {
  const defaultsForType = SECURITY_DEFAULTS[type];
  const id = `she-security-${room.id}-${type}-${String(index).padStart(2, "0")}`;

  return {
    id,
    name: `${room.name} ${SECURITY_DEVICE_LABELS[type]} ${index + 1}`,
    type,
    manufacturer: defaultsForType.manufacturer,
    model: defaultsForType.model,
    firmwareVersion: defaultsForType.firmwareVersion,
    roomId: room.id,
    roomName: room.name,
    onlineStatus: onlineStatus(id),
    healthStatus: healthStatus(id),
    batteryPercent: battery(type, id),
    signalStrength: 62 + (id.length % 36),
    pricing: pricing(type),
    render: {
      position,
      rotation: options.rotation,
      size: options.size ?? defaultsForType.size,
      shape: options.shape ?? defaultsForType.shape,
      color: options.color ?? SECURITY_DEVICE_COLORS[type],
      visibility: true,
      lod: options.lod ?? "mid",
      collision: false,
      shadow: defaultsForType.category !== "sensor",
      coverageVisible: options.coverageVisible ?? defaultsForType.category === "camera",
    },
    futureReady: futureReady(type),
  };
}

function createCamera(
  type: Extract<SecurityDeviceType, "indoor-camera" | "outdoor-camera" | "ptz-camera" | "doorbell-camera" | "video-intercom">,
  room: Pick<InteriorRoom, "id" | "name" | "boundingBox">,
  index: number,
  position: [number, number, number],
  target: [number, number, number],
  options: { readonly fov?: number; readonly zoom?: number; readonly nightVision?: boolean; readonly resolution?: "1080p" | "2K" | "4K"; readonly rotation?: [number, number, number] } = {},
): SecurityCameraSpec {
  const base = baseFields(type, room, index, position, { rotation: options.rotation, lod: type === "ptz-camera" || type === "outdoor-camera" ? "near" : "mid", coverageVisible: true });
  const distanceMeters = Number(Math.hypot(target[0] - position[0], target[1] - position[1], target[2] - position[2]).toFixed(2));
  const isIntercom = type === "video-intercom" || type === "doorbell-camera";

  return {
    ...base,
    category: isIntercom ? "intercom" : "camera",
    fovDegrees: options.fov ?? (type === "ptz-camera" ? 110 : type === "outdoor-camera" ? 96 : 88),
    zoom: {
      optical: options.zoom ?? (type === "ptz-camera" ? 32 : type === "outdoor-camera" ? 4 : 1),
      digital: type === "ptz-camera" ? 12 : 6,
    },
    nightVision: options.nightVision ?? true,
    recordingStatus: type === "video-intercom" ? "standby" : "recording",
    storageStatus: storageStatus(base.id),
    liveView: {
      channel: `SHE-CAM-${String(index + 1).padStart(2, "0")}`,
      resolution: options.resolution ?? (type === "ptz-camera" || type === "outdoor-camera" ? "4K" : "2K"),
      fps: type === "ptz-camera" ? 50 : 30,
      latencyMs: type === "ptz-camera" ? 80 : 120,
    },
    coverage: {
      origin: position,
      target,
      distanceMeters,
      horizontalFovDegrees: options.fov ?? (type === "ptz-camera" ? 110 : 88),
      verticalFovDegrees: type === "doorbell-camera" || type === "video-intercom" ? 62 : 48,
    },
  };
}

function createSensor(
  type: Extract<SecurityDeviceType, "motion-detector" | "door-sensor" | "window-sensor" | "glass-break-sensor" | "smoke-detector" | "gas-detector" | "water-leak-sensor" | "siren" | "panic-button" | "garage-sensor" | "gate-sensor">,
  room: Pick<InteriorRoom, "id" | "name">,
  index: number,
  position: [number, number, number],
  notificationType: SecurityNotificationType,
  options: { readonly radius?: number; readonly rotation?: [number, number, number]; readonly lod?: "near" | "mid" | "far" } = {},
): SecuritySensorSpec {
  const base = baseFields(type, room, index, position, { rotation: options.rotation, lod: options.lod ?? "mid", coverageVisible: type === "motion-detector" || type === "glass-break-sensor" });

  return {
    ...base,
    category: type === "siren" || type === "panic-button" ? "alarm" : "sensor",
    notificationType,
    detectionRadiusMeters: options.radius ?? (type === "motion-detector" ? 7.5 : type === "glass-break-sensor" ? 6 : 1.2),
    tamperProtected: true,
    lastEvent: "Ready",
  };
}

function createAccess(
  type: Extract<SecurityDeviceType, "fingerprint-lock" | "face-recognition-lock" | "card-access" | "pin-lock" | "video-intercom" | "garage-sensor" | "gate-sensor">,
  room: Pick<InteriorRoom, "id" | "name">,
  index: number,
  position: [number, number, number],
  accessZone: SecurityAccessZone,
  accessMethod: SecurityAccessControlSpec["accessMethod"],
  options: { readonly lockState?: SecurityAccessControlSpec["lockState"]; readonly rotation?: [number, number, number] } = {},
): SecurityAccessControlSpec {
  const base = baseFields(type, room, index, position, { rotation: options.rotation, lod: "near", coverageVisible: false });

  return {
    ...base,
    category: type === "video-intercom" ? "intercom" : "access-control",
    accessZone,
    lockState: options.lockState ?? (type === "garage-sensor" || type === "gate-sensor" ? "monitor-only" : "locked"),
    accessMethod,
    auditTrailReady: true,
  };
}

function roomShouldHaveIndoorCamera(room: InteriorRoom) {
  return (
    room.id.includes("foyer") ||
    room.id.includes("living") ||
    room.id.includes("lounge") ||
    room.id.includes("dining") ||
    room.id.includes("kitchen") ||
    room.id.includes("cinema") ||
    room.id.includes("gym") ||
    room.id.includes("office") ||
    room.id.includes("utility") ||
    room.id.includes("garage") ||
    room.id.includes("bridge")
  );
}

function createInteriorSecurityDevices(): readonly SecurityDeviceSpec[] {
  const devices: SecurityDeviceSpec[] = [];

  INTERIOR_ROOMS.forEach((room) => {
    const center = roomCenter(room);
    const cameraIndex = devices.length;

    if (roomShouldHaveIndoorCamera(room)) {
      devices.push(createCamera("indoor-camera", room, cameraIndex, wallPosition(room, "max-z", Math.min(2.85, room.ceilingHeight - 0.35)), [center[0], room.boundingBox.min.y + 1.35, center[2]], { fov: room.areaSqm > 35 ? 96 : 82 }));
    }

    if (room.futureSmartDevices.includes("sensors")) {
      devices.push(createSensor("motion-detector", room, devices.length, ceilingPosition(room), "motion", { radius: room.areaSqm > 35 ? 9 : 6.5 }));
    }

    if (room.futureEnergyConsumption.zone !== "outdoor") {
      devices.push(createSensor("smoke-detector", room, devices.length, ceilingPosition(room, 0.35, 0.35), "smoke", { radius: 4.8 }));
    }

    if (room.id.includes("kitchen") || room.id.includes("laundry") || room.id.includes("utility")) {
      devices.push(createSensor("gas-detector", room, devices.length, wallPosition(room, "min-x", 1.45), "gas", { radius: 4.5 }));
    }

    if (room.floorMaterial === "bathroom-tile" || room.id.includes("kitchen") || room.id.includes("laundry") || room.id.includes("utility") || room.id.includes("pantry")) {
      devices.push(createSensor("water-leak-sensor", room, devices.length, [center[0], room.boundingBox.min.y + 0.08, center[2]], "water-leak", { radius: 1.2 }));
    }

    if (room.id.includes("bedroom") || room.id.includes("living") || room.id.includes("lounge") || room.id.includes("office") || room.id.includes("library")) {
      devices.push(createSensor("window-sensor", room, devices.length, wallPosition(room, "max-z", 1.15), "window-open", { radius: 1.1 }));
      devices.push(createSensor("glass-break-sensor", room, devices.length, wallPosition(room, "max-z", 2.1), "window-open", { radius: 6 }));
    }

    if (room.id.includes("foyer") || room.id.includes("garage") || room.id.includes("patio") || room.id.includes("terrace") || room.id.includes("balcony")) {
      devices.push(createSensor("door-sensor", room, devices.length, wallPosition(room, "min-z", 1.25), "door-open", { radius: 1.1 }));
    }

    if (room.id.includes("master-bedroom") || room.id.includes("guest-bedroom") || room.id.includes("home-office") || room.id.includes("utility")) {
      devices.push(createSensor("panic-button", room, devices.length, [center[0], room.boundingBox.min.y + 1.05, center[2]], "motion", { radius: 0.5 }));
    }

    if (room.id.includes("bedroom")) {
      devices.push(createAccess("pin-lock", room, devices.length, wallPosition(room, "min-z", 1.1), "bedrooms", "pin"));
    }

    if (room.id.includes("home-office") || room.id.includes("library") || room.id.includes("study")) {
      devices.push(createAccess("card-access", room, devices.length, wallPosition(room, "min-z", 1.1), "office", "card"));
    }

    if (room.id.includes("utility")) {
      devices.push(createAccess("fingerprint-lock", room, devices.length, wallPosition(room, "min-z", 1.1), "utility-room", "fingerprint"));
    }
  });

  return devices;
}

const FRONT_ENTRY_ROOM = {
  id: "site-front-entry",
  name: "Front Door",
  boundingBox: {
    min: { x: -3.2, y: 0.12, z: 4.78 },
    max: { x: 1.1, y: 3.6, z: 6.45 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

const SITE_GATE_ROOM = {
  id: "site-gate",
  name: "Automatic Sliding Gate",
  boundingBox: {
    min: { x: -2.2, y: 0.08, z: 11.2 },
    max: { x: 3.2, y: 3.2, z: 13.2 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

const SITE_GARAGE_ROOM = {
  id: "site-garage-security",
  name: "Garage",
  boundingBox: {
    min: { x: 10.8, y: 0.08, z: 0.8 },
    max: { x: 17.2, y: 3.2, z: 6.2 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

const SITE_PERIMETER_ROOM = {
  id: "site-perimeter",
  name: "Perimeter",
  boundingBox: {
    min: { x: -22, y: 0.08, z: -18 },
    max: { x: 22, y: 4.2, z: 13.4 },
  },
} satisfies Pick<InteriorRoom, "id" | "name" | "boundingBox">;

function createSiteSecurityDevices(): readonly SecurityDeviceSpec[] {
  const devices: SecurityDeviceSpec[] = [];

  devices.push(createCamera("doorbell-camera", FRONT_ENTRY_ROOM, devices.length, [0.85, 1.55, 5.62], [0, 1.25, 9.2], { fov: 120, resolution: "2K" }));
  devices.push(createCamera("video-intercom", FRONT_ENTRY_ROOM, devices.length, [-0.72, 1.65, 5.58], [0, 1.35, 8.5], { fov: 100, resolution: "2K" }));
  devices.push(createAccess("fingerprint-lock", FRONT_ENTRY_ROOM, devices.length, [-0.28, 1.08, 5.48], "front-door", "fingerprint"));
  devices.push(createAccess("face-recognition-lock", FRONT_ENTRY_ROOM, devices.length, [0.15, 1.72, 5.5], "front-door", "face"));

  devices.push(createCamera("ptz-camera", SITE_GATE_ROOM, devices.length, [2.85, 3.25, 11.7], [0, 1, 5.4], { fov: 118, zoom: 32, resolution: "4K" }));
  devices.push(createCamera("outdoor-camera", SITE_GATE_ROOM, devices.length, [-2.1, 2.5, 11.9], [0, 1.1, 2], { fov: 100, zoom: 6, resolution: "4K" }));
  devices.push(createAccess("card-access", SITE_GATE_ROOM, devices.length, [1.85, 1.15, 11.55], "gate", "card"));
  devices.push(createAccess("pin-lock", SITE_GATE_ROOM, devices.length, [2.18, 1.15, 11.55], "gate", "pin"));
  devices.push(createSensor("gate-sensor", SITE_GATE_ROOM, devices.length, [0, 1.35, 11.38], "door-open", { radius: 1.6 }));

  devices.push(createCamera("outdoor-camera", SITE_GARAGE_ROOM, devices.length, [10.95, 2.75, 3.2], [15.2, 1, 3.4], { fov: 94, zoom: 4, resolution: "4K" }));
  devices.push(createAccess("pin-lock", SITE_GARAGE_ROOM, devices.length, [11.18, 1.12, 1.15], "garage", "pin"));
  devices.push(createSensor("garage-sensor", SITE_GARAGE_ROOM, devices.length, [13.9, 1.48, 0.95], "door-open", { radius: 1.8 }));

  const perimeterCameras: readonly [number, number, number, number, number, number][] = [
    [-19.5, 3.25, 10.4, -6, 1.1, 1.2],
    [19.5, 3.25, 10.4, 6, 1.1, 1.2],
    [-19.5, 3.25, -16.2, -5, 1.1, -6],
    [19.5, 3.25, -16.2, 5, 1.1, -6],
  ];
  perimeterCameras.forEach(([x, y, z, tx, ty, tz], index) => {
    devices.push(createCamera(index % 2 === 0 ? "outdoor-camera" : "ptz-camera", SITE_PERIMETER_ROOM, devices.length, [x, y, z], [tx, ty, tz], { fov: index % 2 === 0 ? 96 : 116, zoom: index % 2 === 0 ? 4 : 24, resolution: "4K" }));
  });

  devices.push(createSensor("siren", SITE_PERIMETER_ROOM, devices.length, [-3.8, 3.15, 5.2], "offline-device", { radius: 10 }));
  devices.push(createSensor("siren", SITE_PERIMETER_ROOM, devices.length, [13.8, 2.9, 5.6], "offline-device", { radius: 10 }));

  return devices;
}

export const SECURITY_DEVICES: readonly SecurityDeviceSpec[] = [
  ...createInteriorSecurityDevices(),
  ...createSiteSecurityDevices(),
] as const;

export const SECURITY_CAMERAS: readonly SecurityCameraSpec[] = SECURITY_DEVICES.filter((device): device is SecurityCameraSpec => device.category === "camera" || (device.category === "intercom" && "fovDegrees" in device));
export const SECURITY_SENSORS: readonly SecuritySensorSpec[] = SECURITY_DEVICES.filter((device): device is SecuritySensorSpec => device.category === "sensor" || device.category === "alarm");
export const SECURITY_ACCESS_CONTROLS: readonly SecurityAccessControlSpec[] = SECURITY_DEVICES.filter((device): device is SecurityAccessControlSpec => device.category === "access-control" || (device.category === "intercom" && "accessZone" in device));

function notificationForDevice(device: SecuritySensorSpec, index: number): SecurityNotificationSpec {
  const titleByType: Record<SecurityNotificationType, string> = {
    motion: "Motion ready",
    "door-open": "Door monitored",
    "window-open": "Window monitored",
    smoke: "Smoke detector ready",
    gas: "Gas detector ready",
    "water-leak": "Water leak protection ready",
    "low-battery": "Low battery warning",
    "offline-device": "Offline device warning",
  };
  const isOffline = device.onlineStatus === "offline";
  const lowBattery = typeof device.batteryPercent === "number" && device.batteryPercent < 58;
  const type: SecurityNotificationType = isOffline ? "offline-device" : lowBattery ? "low-battery" : device.notificationType;

  return {
    id: `she-security-note-${String(index).padStart(3, "0")}`,
    type,
    title: titleByType[type],
    severity: type === "smoke" || type === "gas" || type === "water-leak" || type === "offline-device" ? "critical" : type === "low-battery" ? "warning" : "info",
    deviceId: device.id,
    roomId: device.roomId,
    roomName: device.roomName,
    acknowledged: false,
    timestampLabel: "Ready state",
  };
}

export const SECURITY_NOTIFICATIONS: readonly SecurityNotificationSpec[] = SECURITY_SENSORS.slice(0, 42).map((device, index) => notificationForDevice(device, index));

function quoteRecommendations(): readonly SecurityQuoteRecommendation[] {
  const cameraCount = SECURITY_CAMERAS.length;
  const sensorCount = SECURITY_SENSORS.length;
  const accessCount = SECURITY_ACCESS_CONTROLS.length;
  const poeSwitchCount = Math.max(2, Math.ceil((cameraCount + accessCount) / 16));
  const hardDriveCount = Math.max(2, Math.ceil(cameraCount / 8));
  const cableRuns = cameraCount + sensorCount + accessCount;

  return [
    recommendation("security-nvr", "NVR", 1, 2800, 420, 280, `${cameraCount} cameras require a centralized recording appliance.`),
    recommendation("security-hdd", "Hard Drive", hardDriveCount, 340, 90, 60, "30-day local retention target for camera registry."),
    recommendation("security-ups", "UPS", 2, 1250, 220, 160, "Backup power for NVR, PoE switches, intercoms, and network rack."),
    recommendation("security-poe", "PoE Switch", poeSwitchCount, 780, 260, 180, "Power and network distribution for IP camera and intercom endpoints."),
    recommendation("security-cable", "Cabling", cableRuns, 42, 25, 18, "Structured low-voltage cabling for every security endpoint."),
    recommendation("security-conduit", "Conduit", Math.ceil(cableRuns / 4), 95, 50, 34, "Protected containment for exterior and critical security routes."),
    recommendation("security-labour", "Installation Labour", cableRuns, 0, 0, 85, "Device mounting, commissioning, labeling, and handover."),
  ];
}

function recommendation(id: string, name: SecurityQuoteRecommendation["name"], quantity: number, equipmentCost: number, installationCost: number, labourCost: number, reason: string): SecurityQuoteRecommendation {
  return { id, name, quantity, equipmentCost, installationCost, labourCost, reason };
}

function calculateQuoteSummary(): SecurityQuoteSummary {
  const devicePricing = SECURITY_DEVICES.map((device) => device.pricing);
  const recommendations = quoteRecommendations();
  const recommendationEquipment = recommendations.reduce((total, item) => total + item.equipmentCost * item.quantity, 0);
  const recommendationInstallation = recommendations.reduce((total, item) => total + item.installationCost * item.quantity, 0);
  const recommendationLabour = recommendations.reduce((total, item) => total + item.labourCost * item.quantity, 0);
  const equipmentCost = devicePricing.reduce((total, price) => total + price.equipmentCost, 0) + recommendationEquipment;
  const installationCost = devicePricing.reduce((total, price) => total + price.installationCost, 0) + recommendationInstallation;
  const labourCost = devicePricing.reduce((total, price) => total + price.labourCost, 0) + recommendationLabour;

  return {
    equipmentCost,
    installationCost,
    labourCost,
    totalCost: equipmentCost + installationCost + labourCost,
    recommendations,
    currency: "USD",
    source: "experience-security-internal-model",
    existingQuotationEngineModified: false,
  };
}

export const SECURITY_QUOTE_SUMMARY = calculateQuoteSummary();

function registrySummary(): SecurityRegistrySummary {
  return {
    deviceCount: SECURITY_DEVICES.length,
    cameraCount: SECURITY_CAMERAS.length,
    sensorCount: SECURITY_SENSORS.length,
    accessControlCount: SECURITY_ACCESS_CONTROLS.filter((device) => device.category === "access-control").length,
    alarmCount: SECURITY_SENSORS.filter((device) => device.category === "alarm").length,
    intercomCount: SECURITY_DEVICES.filter((device) => device.category === "intercom").length,
    onlineCount: SECURITY_DEVICES.filter((device) => device.onlineStatus === "online").length,
    offlineCount: SECURITY_DEVICES.filter((device) => device.onlineStatus === "offline").length,
    recordingCameraCount: SECURITY_CAMERAS.filter((camera) => camera.recordingStatus === "recording").length,
    notificationCount: SECURITY_NOTIFICATIONS.length,
  };
}

export const SECURITY_REGISTRY_SUMMARY = registrySummary();

export const SECURITY_PLATFORM_REPORT: SecurityPlatformReport = {
  deviceTypesCovered: SECURITY_DEVICE_TYPES,
  dashboardModes: SECURITY_DASHBOARD_MODES,
  mapLayers: SECURITY_MAP_LAYERS,
  accessZonesCovered: SECURITY_ACCESS_ZONES,
  notificationTypesCovered: SECURITY_NOTIFICATION_TYPES,
  registrySummary: SECURITY_REGISTRY_SUMMARY,
  quoteSummary: SECURITY_QUOTE_SUMMARY,
  performance: {
    instancedGeometry: true,
    coverageMeshesCapped: true,
    automaticLodReady: true,
    occlusionReady: true,
    shadowOptimization: true,
  },
  constraints: {
    aiAnalysis: "excluded",
    automationRules: "excluded",
    voiceCommands: "excluded",
    externalQuotationEngine: "untouched",
    api: "untouched",
    database: "untouched",
  },
};

export function getSecurityDevice(deviceId: string) {
  return SECURITY_DEVICES.find((device) => device.id === deviceId) ?? null;
}
