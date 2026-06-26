import { ENERGY_SOURCES } from "@/lib/experience/energy/energy-catalog";
import {
  SECURITY_ACCESS_CONTROLS,
  SECURITY_CAMERAS,
  SECURITY_DEVICES,
  SECURITY_NOTIFICATIONS,
  SECURITY_SENSORS,
} from "@/lib/experience/security/security-catalog";
import type {
  SecurityAccessControlSpec,
  SecurityCameraSpec,
  SecurityDeviceSpec,
  SecurityNotificationSpec,
  SecuritySensorSpec,
  SocCameraWallTile,
  SocCommandCenterStatus,
  SocEventSeverity,
  SocEventTimelineItem,
  SocEventType,
  SocIncident,
  SocLiveMapAsset,
  SocMapAssetType,
  SocMapLayer,
  SocOperationalStatus,
  SocOperationsReport,
  SocQuoteRecommendation,
  SocQuoteSummary,
  SocSecurityLevel,
  SocSubsystemStatus,
  SocVideoBookmark,
  SocVideoSession,
} from "@/types/experience";

export const SOC_SECURITY_LEVELS: readonly SocSecurityLevel[] = ["normal", "armed", "partial", "away", "vacation", "emergency"] as const;
export const SOC_MAP_LAYERS: readonly SocMapLayer[] = ["cameras", "sensors", "locks", "alarms"] as const;

export const SOC_SECURITY_LEVEL_LABELS: Record<SocSecurityLevel, string> = {
  normal: "Normal",
  armed: "Armed",
  partial: "Partial",
  away: "Away",
  vacation: "Vacation",
  emergency: "Emergency",
};

export const SOC_MAP_LAYER_LABELS: Record<SocMapLayer, string> = {
  cameras: "Cameras",
  sensors: "Sensors",
  locks: "Locks",
  alarms: "Alarms",
};

export const SOC_EVENT_LABELS: Record<SocEventType, string> = {
  motion: "Motion",
  door: "Door",
  window: "Window",
  smoke: "Smoke",
  gas: "Gas",
  water: "Water",
  "power-failure": "Power Failure",
};

export const SOC_STATUS_COLORS: Record<SocOperationalStatus, string> = {
  normal: "#8ff0c7",
  warning: "#ffd36e",
  critical: "#ff6378",
  offline: "#a8b4c2",
};

export const SOC_ASSET_COLORS: Record<SocMapAssetType, string> = {
  camera: "#72d8ff",
  sensor: "#8ff0c7",
  lock: "#ffdca3",
  alarm: "#ff6378",
};

function deviceStatus(device: Pick<SecurityDeviceSpec, "onlineStatus" | "healthStatus" | "signalStrength">): SocOperationalStatus {
  if (device.onlineStatus === "offline") return "offline";
  if (device.healthStatus === "service-required") return "critical";
  if (device.healthStatus === "warning" || device.signalStrength < 68) return "warning";
  return "normal";
}

function assetId(prefix: SocMapAssetType, deviceId: string) {
  return `she-soc-${prefix}-${deviceId}`;
}

function mapAssetForCamera(camera: SecurityCameraSpec): SocLiveMapAsset {
  return {
    id: assetId("camera", camera.id),
    sourceDeviceId: camera.id,
    type: "camera",
    layer: "cameras",
    label: camera.name,
    roomId: camera.roomId,
    roomName: camera.roomName,
    status: deviceStatus(camera),
    render: {
      position: camera.render.position,
      size: [0.24, 0.18, 0.24],
      color: SOC_ASSET_COLORS.camera,
      visibility: true,
      lod: camera.render.lod,
      collision: false,
      shadow: false,
    },
    coverageMeters: camera.coverage.distanceMeters,
  };
}

function mapAssetForSensor(sensor: SecuritySensorSpec): SocLiveMapAsset {
  const isAlarm = sensor.category === "alarm";

  return {
    id: assetId(isAlarm ? "alarm" : "sensor", sensor.id),
    sourceDeviceId: sensor.id,
    type: isAlarm ? "alarm" : "sensor",
    layer: isAlarm ? "alarms" : "sensors",
    label: sensor.name,
    roomId: sensor.roomId,
    roomName: sensor.roomName,
    status: deviceStatus(sensor),
    render: {
      position: sensor.render.position,
      size: isAlarm ? [0.24, 0.22, 0.24] : [0.16, 0.16, 0.16],
      color: isAlarm ? SOC_ASSET_COLORS.alarm : SOC_ASSET_COLORS.sensor,
      visibility: true,
      lod: sensor.render.lod,
      collision: false,
      shadow: false,
    },
    coverageMeters: sensor.detectionRadiusMeters,
  };
}

function mapAssetForLock(access: SecurityAccessControlSpec): SocLiveMapAsset {
  return {
    id: assetId("lock", access.id),
    sourceDeviceId: access.id,
    type: "lock",
    layer: "locks",
    label: access.name,
    roomId: access.roomId,
    roomName: access.roomName,
    status: deviceStatus(access),
    render: {
      position: access.render.position,
      size: [0.18, 0.28, 0.12],
      color: SOC_ASSET_COLORS.lock,
      visibility: true,
      lod: access.render.lod,
      collision: false,
      shadow: false,
    },
    coverageMeters: 1.4,
  };
}

export const SOC_LIVE_MAP_ASSETS: readonly SocLiveMapAsset[] = [
  ...SECURITY_CAMERAS.map(mapAssetForCamera),
  ...SECURITY_SENSORS.map(mapAssetForSensor),
  ...SECURITY_ACCESS_CONTROLS.filter((device) => device.category === "access-control").map(mapAssetForLock),
] as const;

function subsystemStatus(
  id: string,
  name: string,
  devices: readonly Pick<SecurityDeviceSpec, "onlineStatus" | "healthStatus" | "signalStrength">[],
  message: string,
): SocSubsystemStatus {
  const onlineCount = devices.filter((device) => device.onlineStatus === "online").length;
  const criticalCount = devices.filter((device) => deviceStatus(device) === "critical" || deviceStatus(device) === "offline").length;
  const warningCount = devices.filter((device) => deviceStatus(device) === "warning").length;
  const status: SocOperationalStatus = criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "normal";

  return {
    id,
    name,
    status,
    onlineCount,
    totalCount: devices.length,
    criticalCount,
    message,
  };
}

function powerStatus(): SocSubsystemStatus {
  const criticalCount = ENERGY_SOURCES.filter((source) => source.status === "offline").length;
  const activeCount = ENERGY_SOURCES.filter((source) => source.status === "active" || source.status === "charging" || source.status === "discharging").length;
  const warningCount = ENERGY_SOURCES.filter((source) => source.status === "standby").length;

  return {
    id: "soc-power-status",
    name: "Power Status",
    status: criticalCount > 0 ? "critical" : activeCount >= 2 ? "normal" : warningCount > 0 ? "warning" : "normal",
    onlineCount: activeCount,
    totalCount: ENERGY_SOURCES.length,
    criticalCount,
    message: "Solar, battery, grid, generator, and UPS source switching is visible to SOC.",
  };
}

export const SOC_COMMAND_CENTER_STATUS: SocCommandCenterStatus = {
  cameraWall: subsystemStatus("soc-camera-wall", "Camera Wall", SECURITY_CAMERAS, "All camera channels are arranged for live wall monitoring."),
  alarmStatus: subsystemStatus("soc-alarm-status", "Alarm Status", SECURITY_SENSORS.filter((device) => device.category === "alarm"), "Sirens and panic buttons are tracked as alarm endpoints."),
  doorStatus: subsystemStatus(
    "soc-door-status",
    "Door Status",
    [
      ...SECURITY_ACCESS_CONTROLS,
      ...SECURITY_SENSORS.filter((device) => device.notificationType === "door-open" || device.type === "garage-sensor" || device.type === "gate-sensor"),
    ],
    "Doors, garage, gate, and access-control locks are monitored.",
  ),
  sensorStatus: subsystemStatus("soc-sensor-status", "Sensor Status", SECURITY_SENSORS, "Motion, door, window, smoke, gas, water, and glass-break sensors are monitored."),
  networkStatus: subsystemStatus("soc-network-status", "Network Status", SECURITY_DEVICES, "Endpoint signal strength and online state are rolled into SOC network health."),
  powerStatus: powerStatus(),
};

function bookmarkForCamera(camera: SecurityCameraSpec, index: number): SocVideoBookmark {
  return {
    id: `she-soc-bookmark-${String(index).padStart(3, "0")}`,
    cameraId: camera.id,
    label: `${camera.roomName} security review`,
    timestampLabel: `${String(Math.floor(index / 4)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")} ago`,
    offsetSeconds: 45 + index * 18,
  };
}

export const SOC_VIDEO_BOOKMARKS: readonly SocVideoBookmark[] = SECURITY_CAMERAS.map(bookmarkForCamera);

function cameraWallTile(camera: SecurityCameraSpec): SocCameraWallTile {
  const bookmarkIds = SOC_VIDEO_BOOKMARKS.filter((bookmark) => bookmark.cameraId === camera.id).map((bookmark) => bookmark.id);

  return {
    id: `she-soc-camera-wall-${camera.id}`,
    cameraId: camera.id,
    name: camera.name,
    roomName: camera.roomName,
    channel: camera.liveView.channel,
    resolution: camera.liveView.resolution,
    fps: camera.liveView.fps,
    latencyMs: camera.liveView.latencyMs,
    status: deviceStatus(camera),
    recordingStatus: camera.recordingStatus,
    storageStatus: camera.storageStatus,
    playbackAvailable: true,
    snapshotAvailable: true,
    timelineAvailable: true,
    bookmarkIds,
  };
}

export const SOC_CAMERA_WALL_TILES: readonly SocCameraWallTile[] = SECURITY_CAMERAS.map(cameraWallTile);

function eventTypeFromNotification(notification: SecurityNotificationSpec): SocEventType {
  if (notification.type === "door-open") return "door";
  if (notification.type === "window-open") return "window";
  if (notification.type === "smoke") return "smoke";
  if (notification.type === "gas") return "gas";
  if (notification.type === "water-leak") return "water";
  if (notification.type === "offline-device" || notification.type === "low-battery") return "power-failure";
  return "motion";
}

function eventTitle(type: SocEventType, roomName: string) {
  return `${SOC_EVENT_LABELS[type]} event in ${roomName}`;
}

function eventSeverity(notification: SecurityNotificationSpec, type: SocEventType): SocEventSeverity {
  if (notification.severity === "critical" || type === "smoke" || type === "gas" || type === "water" || type === "power-failure") return "critical";
  if (notification.severity === "warning") return "warning";
  return "info";
}

function timelineEvent(notification: SecurityNotificationSpec, index: number): SocEventTimelineItem {
  const type = eventTypeFromNotification(notification);
  const incidentId = `she-soc-incident-${String(index).padStart(3, "0")}`;

  return {
    id: `she-soc-event-${String(index).padStart(3, "0")}`,
    type,
    title: eventTitle(type, notification.roomName),
    severity: eventSeverity(notification, type),
    sourceDeviceId: notification.deviceId,
    roomId: notification.roomId,
    roomName: notification.roomName,
    timestampLabel: `${Math.max(1, index + 1)} min ago`,
    minutesAgo: index + 1,
    acknowledged: notification.acknowledged,
    incidentId,
  };
}

const generatedTimelineEvents = SECURITY_NOTIFICATIONS.map(timelineEvent);
const powerTransferEvent: SocEventTimelineItem = {
  id: "she-soc-event-power-transfer",
  type: "power-failure",
  title: "Power source transfer detected",
  severity: "warning",
  sourceDeviceId: "energy-source-grid",
  roomId: "site-power",
  roomName: "Power Plant",
  timestampLabel: "Live",
  minutesAgo: 0,
  acknowledged: false,
  incidentId: `she-soc-incident-${String(generatedTimelineEvents.length).padStart(3, "0")}`,
};

export const SOC_EVENT_TIMELINE: readonly SocEventTimelineItem[] = [powerTransferEvent, ...generatedTimelineEvents] as const;

function incidentQueue(type: SocEventType): SocIncident["assignedQueue"] {
  if (type === "power-failure") return "Electrical";
  if (type === "smoke" || type === "gas" || type === "water") return "Facilities";
  if (type === "door" || type === "window" || type === "motion") return "Security";
  return "SOC";
}

function incidentStatus(event: SocEventTimelineItem, index: number): SocIncident["status"] {
  if (event.severity === "critical") return index % 3 === 0 ? "escalated" : "investigating";
  if (event.severity === "warning") return "open";
  return "resolved";
}

function responsePlaybook(type: SocEventType) {
  const playbooks: Record<SocEventType, string> = {
    motion: "Verify camera wall, bookmark footage, dispatch patrol if repeated.",
    door: "Validate lock state, check camera playback, contact access owner.",
    window: "Review glass-break and window sensor pair, inspect perimeter cameras.",
    smoke: "Escalate life-safety response, confirm detector health, prepare evacuation.",
    gas: "Escalate facilities response, isolate kitchen or utility zone.",
    water: "Dispatch facilities response and check leak isolation readiness.",
    "power-failure": "Confirm source transfer, check UPS runtime, preserve camera recording.",
  };

  return playbooks[type];
}

export const SOC_INCIDENTS: readonly SocIncident[] = SOC_EVENT_TIMELINE.map((event, index) => ({
  id: event.incidentId,
  eventId: event.id,
  title: event.title,
  severity: event.severity,
  status: incidentStatus(event, index),
  sourceDeviceId: event.sourceDeviceId,
  roomId: event.roomId,
  roomName: event.roomName,
  createdAtLabel: event.timestampLabel,
  assignedQueue: incidentQueue(event.type),
  responsePlaybook: responsePlaybook(event.type),
}));

function quoteRecommendation(
  id: string,
  name: SocQuoteRecommendation["name"],
  quantity: number,
  equipmentCost: number,
  installationCost: number,
  labourCost: number,
  reason: string,
): SocQuoteRecommendation {
  return { id, name, quantity, equipmentCost, installationCost, labourCost, reason };
}

function socQuoteRecommendations(): readonly SocQuoteRecommendation[] {
  const cameraWallDisplays = Math.max(6, Math.ceil(SOC_CAMERA_WALL_TILES.length / 4));
  const alarmCount = SECURITY_SENSORS.filter((device) => device.category === "alarm").length;
  const accessControllers = Math.max(2, Math.ceil(SECURITY_ACCESS_CONTROLS.length / 8));
  const environmentalSensorGap = Math.max(1, Math.ceil(SECURITY_SENSORS.filter((device) => device.notificationType === "gas" || device.notificationType === "water-leak").length / 12));

  return [
    quoteRecommendation("soc-workstation", "Command Center Workstation", 2, 3200, 420, 260, "Dual operator seats for live monitoring, playback, snapshot review, and incident dispatch."),
    quoteRecommendation("soc-video-wall", "Video Wall Display", cameraWallDisplays, 980, 240, 180, "Camera wall density requires dedicated displays instead of ordinary room tablets."),
    quoteRecommendation("soc-failover-nvr", "Failover NVR", 1, 3600, 520, 340, `Failover recorder protects ${SOC_CAMERA_WALL_TILES.length} camera channels.`),
    quoteRecommendation("soc-access-controller", "Access Control Controller", accessControllers, 1180, 360, 240, "Door, garage, gate, and restricted-room locks need centralized SOC access hardware."),
    quoteRecommendation("soc-environmental-pack", "Environmental Sensor Pack", environmentalSensorGap, 740, 180, 120, "Adds spare smoke, gas, and water sensors for rooms with highest incident risk."),
    quoteRecommendation("soc-network-health", "Network Health Appliance", 1, 1450, 260, 180, "SOC network status requires independent endpoint monitoring and alert retention."),
    quoteRecommendation("soc-response-keypad", "Incident Response Keypad", Math.max(1, alarmCount), 420, 120, 85, "Dedicated panic and incident acknowledgement controls for command-center operators."),
  ];
}

function calculateSocQuoteSummary(): SocQuoteSummary {
  const recommendations = socQuoteRecommendations();
  const equipmentCost = recommendations.reduce((total, item) => total + item.equipmentCost * item.quantity, 0);
  const installationCost = recommendations.reduce((total, item) => total + item.installationCost * item.quantity, 0);
  const labourCost = recommendations.reduce((total, item) => total + item.labourCost * item.quantity, 0);

  return {
    equipmentCost,
    installationCost,
    labourCost,
    totalCost: equipmentCost + installationCost + labourCost,
    recommendations,
    currency: "USD",
    source: "experience-soc-internal-model",
    existingQuotationEngineModified: false,
  };
}

export const SOC_QUOTE_SUMMARY = calculateSocQuoteSummary();

export const SOC_VIDEO_SESSION: SocVideoSession = {
  selectedCameraId: SOC_CAMERA_WALL_TILES[0]?.cameraId ?? "",
  mode: "live",
  currentTimestampLabel: "Live",
  timelineWindowMinutes: 60,
  playbackAvailable: true,
  snapshotAvailable: true,
  bookmarksAvailable: true,
};

export const SOC_OPERATIONS_REPORT: SocOperationsReport = {
  securityLevels: SOC_SECURITY_LEVELS,
  commandCenter: SOC_COMMAND_CENTER_STATUS,
  cameraWallTileCount: SOC_CAMERA_WALL_TILES.length,
  liveMapAssetCount: SOC_LIVE_MAP_ASSETS.length,
  eventTimelineCount: SOC_EVENT_TIMELINE.length,
  incidentCount: SOC_INCIDENTS.length,
  videoBookmarkCount: SOC_VIDEO_BOOKMARKS.length,
  quoteSummary: SOC_QUOTE_SUMMARY,
  capabilities: {
    cameraWall: true,
    alarmStatus: true,
    doorStatus: true,
    sensorStatus: true,
    networkStatus: true,
    powerStatus: true,
    liveMap: true,
    eventTimeline: true,
    playback: true,
    snapshot: true,
    timeline: true,
    bookmarks: true,
    everyEventBecomesIncident: true,
  },
  constraints: {
    externalQuotationEngine: "untouched",
    api: "untouched",
    database: "untouched",
    authentication: "untouched",
    aiAnalysis: "excluded",
  },
};

export function getSocCameraTile(cameraId: string) {
  return SOC_CAMERA_WALL_TILES.find((tile) => tile.cameraId === cameraId) ?? null;
}

export function getSocIncident(incidentId: string) {
  return SOC_INCIDENTS.find((incident) => incident.id === incidentId) ?? null;
}

export function getSocMapAsset(assetId: string) {
  return SOC_LIVE_MAP_ASSETS.find((asset) => asset.id === assetId) ?? null;
}
