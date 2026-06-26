import { BAS_SYSTEM_REPORT } from "@/lib/experience/automation/bas-system";
import { DEVICE_DRIVER_ENDPOINTS } from "@/lib/experience/communication";
import { ENTERPRISE_DEVICE_MANAGEMENT_REPORT } from "@/lib/experience/device-management";
import { ENERGY_SYSTEM_REPORT } from "@/lib/experience/energy/energy-catalog";
import { SECURITY_PLATFORM_REPORT } from "@/lib/experience/security/security-catalog";
import type {
  DeviceDriverEndpoint,
  EstateBlockNode,
  EstateBuildingNode,
  EstateCrmLink,
  EstateCustomerProfile,
  EstateDeviceStatus,
  EstateFloorNode,
  EstateGlobalDashboard,
  EstateLocation,
  EstateManagedDeviceRef,
  EstateMaintenanceContract,
  EstateManagementReport,
  EstateMapPoint,
  EstateOperationalStatus,
  EstatePropertyRecord,
  EstatePropertyType,
  EstateReportCard,
  EstateReportType,
  EstateRole,
  EstateRolePolicy,
  EstateRoomNode,
} from "@/types/experience";

export const ESTATE_PROPERTY_TYPES: readonly EstatePropertyType[] = [
  "villa",
  "apartment",
  "duplex",
  "penthouse",
  "estate",
  "office",
  "hotel",
  "school",
  "hospital",
  "shopping-mall",
  "warehouse",
  "factory",
] as const;

export const ESTATE_ROLES: readonly EstateRole[] = ["owner", "installer", "technician", "facility-manager", "security", "guest", "tenant"] as const;

export const ESTATE_REPORT_TYPES: readonly EstateReportType[] = [
  "building-health",
  "security-score",
  "energy-score",
  "automation-score",
  "maintenance-cost",
  "asset-value",
] as const;

interface CustomerBlueprint {
  readonly id: string;
  readonly name: string;
  readonly crmProfileId: string;
}

interface PropertyBlueprint {
  readonly id: string;
  readonly name: string;
  readonly propertyType: EstatePropertyType;
  readonly customerId: string;
  readonly customerName: string;
  readonly crmProfileId: string;
  readonly location: EstateLocation;
  readonly blockCount: number;
  readonly buildingsPerBlock: number;
  readonly floorsPerBuilding: number;
  readonly roomsPerFloor: number;
  readonly energyMultiplier: number;
  readonly assetValue: number;
  readonly maintenanceLevel: EstateMaintenanceContract["level"];
}

interface BlockBase {
  readonly id: string;
  readonly name: string;
  readonly buildingIds: string[];
}

interface BuildingBase {
  readonly id: string;
  readonly blockId: string;
  readonly name: string;
  readonly floorIds: string[];
}

interface FloorBase {
  readonly id: string;
  readonly buildingId: string;
  readonly name: string;
  readonly roomIds: string[];
}

interface RoomBase {
  readonly id: string;
  readonly buildingId: string;
  readonly floorId: string;
  readonly name: string;
}

const CUSTOMER_BLUEPRINTS: readonly CustomerBlueprint[] = [
  { id: "estate-customer-ultra-luxury", name: "Ultra Luxury Residential Client", crmProfileId: "crm-ultra-luxury-residential" },
  { id: "estate-customer-palm-portfolio", name: "Palm Estate Owner", crmProfileId: "crm-palm-estate-owner" },
  { id: "estate-customer-commercial", name: "SmartHive Commercial Holdings", crmProfileId: "crm-smarthive-commercial-holdings" },
  { id: "estate-customer-civic", name: "Civic Healthcare and Education Group", crmProfileId: "crm-civic-healthcare-education" },
] as const;

const PROPERTY_BLUEPRINTS: readonly PropertyBlueprint[] = [
  property("property-signature-villa", "SmartHive Signature Villa", "villa", CUSTOMER_BLUEPRINTS[0], "Dubai Hills", 25.0787, 55.2482, 1, 1, 2, 18, 1, 5800000, "premium"),
  property("property-skyline-apartment", "Skyline Smart Apartment", "apartment", CUSTOMER_BLUEPRINTS[0], "Downtown Dubai", 25.1972, 55.2744, 1, 1, 1, 8, 0.42, 1250000, "standard"),
  property("property-marina-duplex", "Marina Duplex Residence", "duplex", CUSTOMER_BLUEPRINTS[0], "Dubai Marina", 25.0806, 55.1404, 1, 1, 2, 10, 0.68, 2100000, "premium"),
  property("property-sky-penthouse", "Sky Penthouse", "penthouse", CUSTOMER_BLUEPRINTS[0], "Business Bay", 25.1848, 55.2654, 1, 1, 1, 14, 0.82, 4200000, "premium"),
  property("property-palm-estate", "Palm Jumeirah Smart Estate", "estate", CUSTOMER_BLUEPRINTS[1], "Palm Jumeirah", 25.1122, 55.1386, 3, 2, 3, 7, 2.4, 18500000, "enterprise"),
  property("property-executive-villa", "Riyadh Executive Villa", "villa", CUSTOMER_BLUEPRINTS[1], "Riyadh Diplomatic Quarter", 24.6789, 46.6248, 1, 1, 2, 18, 1.08, 6200000, "premium"),
  property("property-commerce-office", "Commerce Tower Office", "office", CUSTOMER_BLUEPRINTS[2], "Dubai Internet City", 25.0951, 55.1603, 1, 1, 8, 12, 2.15, 9800000, "enterprise"),
  property("property-atlas-hotel", "Atlas Smart Hotel", "hotel", CUSTOMER_BLUEPRINTS[2], "Jumeirah Beach", 25.2048, 55.2708, 1, 2, 12, 14, 4.8, 46000000, "enterprise"),
  property("property-civic-school", "Civic Smart School", "school", CUSTOMER_BLUEPRINTS[3], "Abu Dhabi", 24.4539, 54.3773, 1, 3, 4, 10, 3.1, 22000000, "enterprise"),
  property("property-health-hospital", "HealthGrid Hospital", "hospital", CUSTOMER_BLUEPRINTS[3], "Dubai Healthcare City", 25.2335, 55.3263, 1, 3, 8, 16, 6.2, 78000000, "mission-critical"),
  property("property-retail-mall", "Retail Nexus Mall", "shopping-mall", CUSTOMER_BLUEPRINTS[2], "Mall District", 25.1189, 55.2004, 1, 1, 5, 30, 5.3, 65000000, "mission-critical"),
  property("property-logistics-campus", "Logistics Warehouse and Factory", "warehouse", CUSTOMER_BLUEPRINTS[2], "Dubai South", 24.8968, 55.1614, 1, 2, 1, 12, 2.7, 14500000, "enterprise"),
  property("property-industrial-factory", "Industrial Automation Factory", "factory", CUSTOMER_BLUEPRINTS[2], "Jebel Ali Industrial", 24.9857, 55.0931, 1, 3, 2, 18, 4.4, 39000000, "mission-critical"),
] as const;

const ROOM_LABELS: Record<EstatePropertyType, readonly string[]> = {
  villa: ["Foyer", "Living", "Kitchen", "Bedroom", "Bathroom", "Office", "Cinema", "Gym", "Garage", "Patio"],
  apartment: ["Entry", "Lounge", "Kitchen", "Bedroom", "Bath", "Balcony", "Utility", "Study"],
  duplex: ["Entry", "Lounge", "Dining", "Kitchen", "Suite", "Bath", "Study", "Terrace"],
  penthouse: ["Gallery", "Lounge", "Kitchen", "Master Suite", "Guest Suite", "Sky Terrace", "Media", "Spa"],
  estate: ["Villa Room", "Staff Room", "Security", "Garden Hub", "Pool House", "Garage", "Service", "Lounge"],
  office: ["Reception", "Open Office", "Meeting", "Boardroom", "Server", "Pantry", "Focus", "Executive"],
  hotel: ["Lobby", "Suite", "Guest Room", "Corridor", "Restaurant", "Spa", "Service", "Back Office"],
  school: ["Classroom", "Lab", "Library", "Admin", "Hall", "Canteen", "Clinic", "Security"],
  hospital: ["Ward", "ICU", "Treatment", "Lab", "Nurse Station", "Pharmacy", "Theatre", "Utility"],
  "shopping-mall": ["Retail Unit", "Atrium", "Food Court", "Cinema", "Service Corridor", "Security", "Plant Room", "Parking"],
  warehouse: ["Storage Bay", "Loading Dock", "Dispatch", "Office", "Plant Room", "Security", "Cold Room", "Maintenance"],
  factory: ["Production Line", "Control Room", "Quality Lab", "Workshop", "Warehouse", "Office", "Utility", "Security"],
};

function property(
  id: string,
  name: string,
  propertyType: EstatePropertyType,
  customer: CustomerBlueprint,
  locationLabel: string,
  latitude: number,
  longitude: number,
  blockCount: number,
  buildingsPerBlock: number,
  floorsPerBuilding: number,
  roomsPerFloor: number,
  energyMultiplier: number,
  assetValue: number,
  maintenanceLevel: EstateMaintenanceContract["level"],
): PropertyBlueprint {
  return {
    id,
    name,
    propertyType,
    customerId: customer.id,
    customerName: customer.name,
    crmProfileId: customer.crmProfileId,
    location: { label: locationLabel, latitude, longitude },
    blockCount,
    buildingsPerBlock,
    floorsPerBuilding,
    roomsPerFloor,
    energyMultiplier,
    assetValue,
    maintenanceLevel,
  };
}

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function seed(value: string) {
  return value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function label(value: string) {
  return value.replace(/-/g, " ");
}

function roomName(propertyType: EstatePropertyType, roomIndex: number) {
  const names = ROOM_LABELS[propertyType];
  const base = names[roomIndex % names.length];
  const suffix = Math.floor(roomIndex / names.length) + 1;
  return `${base} ${suffix}`;
}

function buildStructure(blueprint: PropertyBlueprint) {
  const blocks: BlockBase[] = [];
  const buildings: BuildingBase[] = [];
  const floors: FloorBase[] = [];
  const rooms: RoomBase[] = [];
  let buildingCounter = 0;
  let floorCounter = 0;
  let roomCounter = 0;

  for (let blockIndex = 0; blockIndex < blueprint.blockCount; blockIndex += 1) {
    const blockId = `${blueprint.id}-block-${blockIndex + 1}`;
    const block: BlockBase = { id: blockId, name: blueprint.blockCount > 1 ? `Block ${blockIndex + 1}` : "Primary Block", buildingIds: [] };
    blocks.push(block);

    for (let buildingIndex = 0; buildingIndex < blueprint.buildingsPerBlock; buildingIndex += 1) {
      buildingCounter += 1;
      const buildingId = `${blueprint.id}-building-${buildingCounter}`;
      const building: BuildingBase = { id: buildingId, blockId, name: `${blueprint.name} Building ${buildingCounter}`, floorIds: [] };
      block.buildingIds.push(buildingId);
      buildings.push(building);

      for (let floorIndex = 0; floorIndex < blueprint.floorsPerBuilding; floorIndex += 1) {
        floorCounter += 1;
        const floorId = `${blueprint.id}-floor-${floorCounter}`;
        const floor: FloorBase = { id: floorId, buildingId, name: floorIndex === 0 ? "Ground Floor" : `Floor ${floorIndex + 1}`, roomIds: [] };
        building.floorIds.push(floorId);
        floors.push(floor);

        for (let roomIndex = 0; roomIndex < blueprint.roomsPerFloor; roomIndex += 1) {
          const roomId = `${blueprint.id}-room-${roomCounter + 1}`;
          const room: RoomBase = { id: roomId, buildingId, floorId, name: roomName(blueprint.propertyType, roomCounter) };
          floor.roomIds.push(roomId);
          rooms.push(room);
          roomCounter += 1;
        }
      }
    }
  }

  return { blocks, buildings, floors, rooms };
}

function deviceStatus(endpoint: DeviceDriverEndpoint): EstateDeviceStatus {
  if (!endpoint.online || endpoint.runtimeStatus === "offline") return "offline";
  if (endpoint.healthStatus === "critical") return "fault";
  if (endpoint.healthStatus === "warning") return "warning";
  return "online";
}

function deviceConnectivity(endpoint: DeviceDriverEndpoint, propertyId: string, propertyType: EstatePropertyType) {
  const propertyPenalty: Partial<Record<EstatePropertyType, number>> = {
    hospital: 2,
    "shopping-mall": 4,
    warehouse: 5,
    factory: 6,
    hotel: 3,
  };
  const variance = (seed(`${propertyId}:${endpoint.id}`) % 9) - 4;
  return clamp(endpoint.signalStrength - (propertyPenalty[propertyType] ?? 0) + variance, 42, 99);
}

function buildDevices(blueprint: PropertyBlueprint, rooms: readonly RoomBase[]): readonly EstateManagedDeviceRef[] {
  return DEVICE_DRIVER_ENDPOINTS.map((endpoint, index) => {
    const room = rooms[index % rooms.length];
    return {
      id: `estate-device-${blueprint.id}-${endpoint.id}`,
      propertyId: blueprint.id,
      buildingId: room.buildingId,
      floorId: room.floorId,
      roomId: room.id,
      name: endpoint.name,
      category: endpoint.source,
      manufacturer: endpoint.manufacturer,
      protocol: endpoint.protocol,
      status: deviceStatus(endpoint),
      connectivityPercent: deviceConnectivity(endpoint, blueprint.id, blueprint.propertyType),
    };
  });
}

function scoreProperty(blueprint: PropertyBlueprint, devices: readonly EstateManagedDeviceRef[]) {
  const offlineCount = devices.filter((device) => device.status === "offline").length;
  const warningCount = devices.filter((device) => device.status === "warning").length;
  const faultCount = devices.filter((device) => device.status === "fault").length;
  const lowConnectivityCount = devices.filter((device) => device.connectivityPercent < 70).length;
  const securityOnlineRatio = SECURITY_PLATFORM_REPORT.registrySummary.onlineCount / Math.max(1, SECURITY_PLATFORM_REPORT.registrySummary.deviceCount);
  const health = Math.round(clamp(100 - faultCount * 0.2 - offlineCount * 0.12 - warningCount * 0.06 - lowConnectivityCount * 0.03, 54, 99));
  const security = Math.round(clamp(securityOnlineRatio * 100 - faultCount * 0.03 - lowConnectivityCount * 0.02 - blueprint.energyMultiplier * 0.6, 62, 99));
  const energy = Math.round(clamp(96 - blueprint.energyMultiplier * 4.6 - ENERGY_SYSTEM_REPORT.villa.metrics.peakDemandKw * 0.08, 58, 98));
  const automation = Math.round(clamp(70 + BAS_SYSTEM_REPORT.failSafeCoveragePercent * 0.22 + BAS_SYSTEM_REPORT.ruleCount * 0.9 - warningCount * 0.01, 64, 99));

  return { health, security, energy, automation };
}

function propertyStatus(scores: ReturnType<typeof scoreProperty>, criticalAlertCount: number): EstateOperationalStatus {
  if (criticalAlertCount > 72 || scores.health < 68) return "critical";
  if (criticalAlertCount > 38 || scores.health < 82 || scores.security < 76) return "warning";
  if (scores.energy < 75) return "maintenance";
  return "online";
}

function createCrmLink(blueprint: PropertyBlueprint, operations: { readonly maintenanceCost: number; readonly assetValue: number }, propertyIndex: number): EstateCrmLink {
  return {
    customerProfileId: blueprint.crmProfileId,
    projectHistory: [
      {
        id: `crm-project-${blueprint.id}-commissioning`,
        title: `${blueprint.name} smart infrastructure commissioning`,
        status: propertyIndex % 4 === 0 ? "active" : "completed",
        value: round(operations.assetValue * 0.042),
        dateLabel: propertyIndex % 4 === 0 ? "Active project" : "Completed project",
      },
      {
        id: `crm-project-${blueprint.id}-expansion`,
        title: `${blueprint.name} expansion roadmap`,
        status: propertyIndex % 3 === 0 ? "planned" : "active",
        value: round(operations.assetValue * 0.018),
        dateLabel: "Roadmap ready",
      },
    ],
    serviceHistory: [
      {
        id: `crm-service-${blueprint.id}-health`,
        title: "Quarterly building health audit",
        status: propertyIndex % 5 === 0 ? "scheduled" : "closed",
        technicianTeam: "SmartHive Facilities",
        dateLabel: "Service cycle",
      },
      {
        id: `crm-service-${blueprint.id}-network`,
        title: "Connectivity and protocol review",
        status: propertyIndex % 6 === 0 ? "open" : "closed",
        technicianTeam: "SmartHive Network",
        dateLabel: "Support history",
      },
    ],
    warranty: {
      id: `crm-warranty-${blueprint.id}`,
      coverageLabel: `${label(blueprint.propertyType)} device and infrastructure warranty`,
      expiryLabel: "36 months remaining",
      coveredAssetValue: round(operations.assetValue * 0.34),
      active: true,
    },
    maintenanceContract: {
      id: `crm-maintenance-${blueprint.id}`,
      level: blueprint.maintenanceLevel,
      renewalLabel: "Annual renewal",
      annualCost: operations.maintenanceCost,
      responseSlaHours: blueprint.maintenanceLevel === "mission-critical" ? 2 : blueprint.maintenanceLevel === "enterprise" ? 4 : blueprint.maintenanceLevel === "premium" ? 8 : 24,
    },
  };
}

function buildProperty(blueprint: PropertyBlueprint, propertyIndex: number): EstatePropertyRecord {
  const structure = buildStructure(blueprint);
  const devices = buildDevices(blueprint, structure.rooms);
  const deviceIdsByRoom = new Map<string, string[]>();

  devices.forEach((device) => {
    const ids = deviceIdsByRoom.get(device.roomId) ?? [];
    ids.push(device.id);
    deviceIdsByRoom.set(device.roomId, ids);
  });

  const rooms: readonly EstateRoomNode[] = structure.rooms.map((room) => {
    const deviceIds = deviceIdsByRoom.get(room.id) ?? [];
    return {
      id: room.id,
      propertyId: blueprint.id,
      buildingId: room.buildingId,
      floorId: room.floorId,
      name: room.name,
      deviceIds,
      deviceCount: deviceIds.length,
    };
  });

  const floors: readonly EstateFloorNode[] = structure.floors.map((floor) => {
    const floorRooms = rooms.filter((room) => room.floorId === floor.id);
    return {
      id: floor.id,
      propertyId: blueprint.id,
      buildingId: floor.buildingId,
      name: floor.name,
      roomIds: floor.roomIds,
      roomCount: floorRooms.length,
      deviceCount: floorRooms.reduce((total, room) => total + room.deviceCount, 0),
    };
  });

  const scores = scoreProperty(blueprint, devices);
  const averageDevicePortfolioValue = ENTERPRISE_DEVICE_MANAGEMENT_REPORT.quote.totalCost / Math.max(1, ENTERPRISE_DEVICE_MANAGEMENT_REPORT.propertyCount);
  const warningCount = devices.filter((device) => device.status === "warning").length;
  const faultCount = devices.filter((device) => device.status === "fault").length;
  const offlineCount = devices.filter((device) => device.status === "offline").length;
  const alertCount = warningCount + faultCount + offlineCount;
  const criticalAlertCount = faultCount + offlineCount;
  const operations = {
    powerKw: round(ENERGY_SYSTEM_REPORT.villa.metrics.peakDemandKw * blueprint.energyMultiplier, 2),
    monthlyEnergyKwh: round(ENERGY_SYSTEM_REPORT.villa.metrics.monthlyUsageKwh * blueprint.energyMultiplier, 1),
    alertCount,
    criticalAlertCount,
    maintenanceCost: round(blueprint.assetValue * 0.012 + devices.length * 18 + alertCount * 120),
    assetValue: round(blueprint.assetValue + averageDevicePortfolioValue * blueprint.energyMultiplier),
  };
  const crm = createCrmLink(blueprint, operations, propertyIndex);
  const status = propertyStatus(scores, criticalAlertCount);
  const connectivityPercent = Math.round(devices.reduce((total, device) => total + device.connectivityPercent, 0) / Math.max(1, devices.length));

  const buildings: readonly EstateBuildingNode[] = structure.buildings.map((building, buildingIndex) => {
    const buildingFloors = floors.filter((floor) => floor.buildingId === building.id);
    const buildingRooms = rooms.filter((room) => room.buildingId === building.id);
    const buildingDeviceCount = buildingRooms.reduce((total, room) => total + room.deviceCount, 0);
    const scoreOffset = buildingIndex % 4;
    return {
      id: building.id,
      propertyId: blueprint.id,
      blockId: building.blockId,
      name: building.name,
      floorIds: building.floorIds,
      floorCount: buildingFloors.length,
      roomCount: buildingRooms.length,
      deviceCount: buildingDeviceCount,
      healthScore: clamp(scores.health - scoreOffset, 50, 99),
      securityScore: clamp(scores.security - scoreOffset, 50, 99),
      energyScore: clamp(scores.energy - scoreOffset, 50, 99),
      automationScore: clamp(scores.automation - scoreOffset, 50, 99),
    };
  });

  const blocks: readonly EstateBlockNode[] = structure.blocks.map((block) => {
    const blockBuildings = buildings.filter((building) => building.blockId === block.id);
    return {
      id: block.id,
      propertyId: blueprint.id,
      name: block.name,
      buildingIds: block.buildingIds,
      buildingCount: blockBuildings.length,
      floorCount: blockBuildings.reduce((total, building) => total + building.floorCount, 0),
      roomCount: blockBuildings.reduce((total, building) => total + building.roomCount, 0),
      deviceCount: blockBuildings.reduce((total, building) => total + building.deviceCount, 0),
    };
  });

  const mapPoint: EstateMapPoint = {
    id: `estate-map-${blueprint.id}`,
    propertyId: blueprint.id,
    label: blueprint.name,
    propertyType: blueprint.propertyType,
    location: blueprint.location,
    status,
    healthScore: scores.health,
    connectivityPercent,
  };

  return {
    id: blueprint.id,
    name: blueprint.name,
    propertyType: blueprint.propertyType,
    customerId: blueprint.customerId,
    customerName: blueprint.customerName,
    crmProfileId: blueprint.crmProfileId,
    location: blueprint.location,
    status,
    connectivityPercent,
    blocks,
    buildings,
    floors,
    rooms,
    devices,
    scores,
    operations,
    crm,
    mapPoint,
  };
}

export const ESTATE_PROPERTIES: readonly EstatePropertyRecord[] = PROPERTY_BLUEPRINTS.map((blueprint, index) => buildProperty(blueprint, index));

export const ESTATE_CUSTOMERS: readonly EstateCustomerProfile[] = CUSTOMER_BLUEPRINTS.map((customer) => {
  const properties = ESTATE_PROPERTIES.filter((propertyRecord) => propertyRecord.customerId === customer.id);
  return {
    id: customer.id,
    name: customer.name,
    crmProfileId: customer.crmProfileId,
    propertyIds: properties.map((propertyRecord) => propertyRecord.id),
    propertyCount: properties.length,
    activeProjectCount: properties.reduce((total, propertyRecord) => total + propertyRecord.crm.projectHistory.filter((project) => project.status === "active").length, 0),
    openServiceCount: properties.reduce((total, propertyRecord) => total + propertyRecord.crm.serviceHistory.filter((service) => service.status === "open" || service.status === "scheduled").length, 0),
    warrantyAssetValue: round(properties.reduce((total, propertyRecord) => total + propertyRecord.crm.warranty.coveredAssetValue, 0)),
    maintenanceContractValue: round(properties.reduce((total, propertyRecord) => total + propertyRecord.crm.maintenanceContract.annualCost, 0)),
  };
});

export const ESTATE_MAP_POINTS: readonly EstateMapPoint[] = ESTATE_PROPERTIES.map((propertyRecord) => propertyRecord.mapPoint);

function dashboard(): EstateGlobalDashboard {
  const totalPower = ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.operations.powerKw, 0);
  const totalEnergy = ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.operations.monthlyEnergyKwh, 0);
  const totalMaintenance = ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.operations.maintenanceCost, 0);
  const totalAssetValue = ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.operations.assetValue, 0);
  const averageSecurity = ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.scores.security, 0) / Math.max(1, ESTATE_PROPERTIES.length);
  const averageAutomation = ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.scores.automation, 0) / Math.max(1, ESTATE_PROPERTIES.length);

  return {
    powerKw: round(totalPower, 2),
    monthlyEnergyKwh: round(totalEnergy, 1),
    securityScore: Math.round(averageSecurity),
    automationScore: Math.round(averageAutomation),
    alertCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.operations.alertCount, 0),
    criticalAlertCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.operations.criticalAlertCount, 0),
    maintenanceCost: round(totalMaintenance),
    assetValue: round(totalAssetValue),
    onlinePropertyCount: ESTATE_PROPERTIES.filter((propertyRecord) => propertyRecord.status === "online").length,
    warningPropertyCount: ESTATE_PROPERTIES.filter((propertyRecord) => propertyRecord.status === "warning" || propertyRecord.status === "maintenance").length,
    criticalPropertyCount: ESTATE_PROPERTIES.filter((propertyRecord) => propertyRecord.status === "critical").length,
  };
}

export const ESTATE_GLOBAL_DASHBOARD: EstateGlobalDashboard = dashboard();

function propertyIdsForRole(role: EstateRole) {
  if (role === "guest") return ESTATE_PROPERTIES.slice(0, 1).map((propertyRecord) => propertyRecord.id);
  if (role === "tenant") return ESTATE_PROPERTIES.filter((propertyRecord) => ["apartment", "duplex", "penthouse"].includes(propertyRecord.propertyType)).map((propertyRecord) => propertyRecord.id);
  if (role === "technician") return ESTATE_PROPERTIES.filter((propertyRecord) => propertyRecord.status !== "online").map((propertyRecord) => propertyRecord.id);
  return ESTATE_PROPERTIES.map((propertyRecord) => propertyRecord.id);
}

export const ESTATE_ROLE_POLICIES: readonly EstateRolePolicy[] = [
  {
    role: "owner",
    label: "Owner",
    propertyScope: "all-properties",
    permissions: ["view-global-dashboard", "view-crm", "view-reports", "approve-maintenance", "view-financials"],
    propertyIds: propertyIdsForRole("owner"),
  },
  {
    role: "installer",
    label: "Installer",
    propertyScope: "assigned-properties",
    permissions: ["view-installation", "update-installation-status", "view-device-map", "view-maintenance-plan"],
    propertyIds: propertyIdsForRole("installer"),
  },
  {
    role: "technician",
    label: "Technician",
    propertyScope: "assigned-properties",
    permissions: ["view-alerts", "run-diagnostics", "schedule-service", "view-warranty"],
    propertyIds: propertyIdsForRole("technician"),
  },
  {
    role: "facility-manager",
    label: "Facility Manager",
    propertyScope: "all-properties",
    permissions: ["view-power", "view-security", "view-automation", "view-maintenance", "view-reports"],
    propertyIds: propertyIdsForRole("facility-manager"),
  },
  {
    role: "security",
    label: "Security",
    propertyScope: "assigned-properties",
    permissions: ["view-security", "view-alerts", "view-map", "view-locks"],
    propertyIds: propertyIdsForRole("security"),
  },
  {
    role: "guest",
    label: "Guest",
    propertyScope: "guest-limited",
    permissions: ["view-assigned-property", "view-public-status"],
    propertyIds: propertyIdsForRole("guest"),
  },
  {
    role: "tenant",
    label: "Tenant",
    propertyScope: "assigned-properties",
    permissions: ["view-unit", "view-service-history", "request-maintenance"],
    propertyIds: propertyIdsForRole("tenant"),
  },
] as const;

function reportCardsForProperty(propertyRecord: EstatePropertyRecord): readonly EstateReportCard[] {
  return [
    {
      id: `estate-report-${propertyRecord.id}-building-health`,
      propertyId: propertyRecord.id,
      type: "building-health",
      title: "Building Health",
      score: propertyRecord.scores.health,
      value: propertyRecord.scores.health,
      valueLabel: `${propertyRecord.scores.health}/100`,
      trendLabel: propertyRecord.status === "online" ? "Stable" : "Attention required",
    },
    {
      id: `estate-report-${propertyRecord.id}-security-score`,
      propertyId: propertyRecord.id,
      type: "security-score",
      title: "Security Score",
      score: propertyRecord.scores.security,
      value: propertyRecord.scores.security,
      valueLabel: `${propertyRecord.scores.security}/100`,
      trendLabel: `${SECURITY_PLATFORM_REPORT.registrySummary.cameraCount} camera model ready`,
    },
    {
      id: `estate-report-${propertyRecord.id}-energy-score`,
      propertyId: propertyRecord.id,
      type: "energy-score",
      title: "Energy Score",
      score: propertyRecord.scores.energy,
      value: propertyRecord.operations.monthlyEnergyKwh,
      valueLabel: `${propertyRecord.operations.monthlyEnergyKwh.toLocaleString("en-US")} kWh/mo`,
      trendLabel: `${ENERGY_SYSTEM_REPORT.sourceCount} source types modeled`,
    },
    {
      id: `estate-report-${propertyRecord.id}-automation-score`,
      propertyId: propertyRecord.id,
      type: "automation-score",
      title: "Automation Score",
      score: propertyRecord.scores.automation,
      value: BAS_SYSTEM_REPORT.ruleCount,
      valueLabel: `${propertyRecord.scores.automation}/100`,
      trendLabel: `${BAS_SYSTEM_REPORT.ruleCount} rules / ${BAS_SYSTEM_REPORT.sceneCount} scenes`,
    },
    {
      id: `estate-report-${propertyRecord.id}-maintenance-cost`,
      propertyId: propertyRecord.id,
      type: "maintenance-cost",
      title: "Maintenance Cost",
      score: null,
      value: propertyRecord.operations.maintenanceCost,
      valueLabel: formatCurrency(propertyRecord.operations.maintenanceCost),
      trendLabel: `${propertyRecord.crm.maintenanceContract.level} contract`,
    },
    {
      id: `estate-report-${propertyRecord.id}-asset-value`,
      propertyId: propertyRecord.id,
      type: "asset-value",
      title: "Asset Value",
      score: null,
      value: propertyRecord.operations.assetValue,
      valueLabel: formatCurrency(propertyRecord.operations.assetValue),
      trendLabel: "CRM-linked asset portfolio",
    },
  ] as const;
}

export const ESTATE_REPORTS: readonly EstateReportCard[] = ESTATE_PROPERTIES.flatMap((propertyRecord) => reportCardsForProperty(propertyRecord));

export function getEstateProperty(propertyId: string) {
  return ESTATE_PROPERTIES.find((propertyRecord) => propertyRecord.id === propertyId) ?? null;
}

export function getEstateCustomer(customerId: string) {
  return ESTATE_CUSTOMERS.find((customer) => customer.id === customerId) ?? null;
}

export function getEstateRolePolicy(role: EstateRole) {
  return ESTATE_ROLE_POLICIES.find((policy) => policy.role === role) ?? null;
}

export function getEstateReports(propertyId: string, reportType?: EstateReportType) {
  return ESTATE_REPORTS.filter((report) => report.propertyId === propertyId && (!reportType || report.type === reportType));
}

export const EstateManagementApi = {
  GetProperty: getEstateProperty,
  GetCustomer: getEstateCustomer,
  GetRolePolicy: getEstateRolePolicy,
  GetReports: getEstateReports,
} as const;

export const ESTATE_MANAGEMENT_REPORT: EstateManagementReport = {
  propertyTypeCoverage: ESTATE_PROPERTY_TYPES,
  customerCount: ESTATE_CUSTOMERS.length,
  propertyCount: ESTATE_PROPERTIES.length,
  blockCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.blocks.length, 0),
  buildingCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.buildings.length, 0),
  floorCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.floors.length, 0),
  roomCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.rooms.length, 0),
  deviceCount: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.devices.length, 0),
  mapPointCount: ESTATE_MAP_POINTS.length,
  roleCount: ESTATE_ROLE_POLICIES.length,
  reportCount: ESTATE_REPORTS.length,
  dashboard: ESTATE_GLOBAL_DASHBOARD,
  crm: {
    linkedCustomerProfiles: ESTATE_CUSTOMERS.length,
    projectHistoryEntries: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.crm.projectHistory.length, 0),
    serviceHistoryEntries: ESTATE_PROPERTIES.reduce((total, propertyRecord) => total + propertyRecord.crm.serviceHistory.length, 0),
    warrantyRecords: ESTATE_PROPERTIES.length,
    maintenanceContracts: ESTATE_PROPERTIES.length,
    externalCrmModified: false,
  },
  hierarchy: {
    estateToBlocks: true,
    blocksToBuildings: true,
    buildingsToFloors: true,
    floorsToRooms: true,
    roomsToDevices: true,
  },
  reports: {
    buildingHealth: true,
    securityScore: true,
    energyScore: true,
    automationScore: true,
    maintenanceCost: true,
    assetValue: true,
  },
  constraints: {
    websiteFunctionality: "untouched",
    authentication: "untouched",
    apiRoutes: "untouched",
    database: "untouched",
    externalCrm: "untouched",
    externalQuoteEngine: "untouched",
  },
};
