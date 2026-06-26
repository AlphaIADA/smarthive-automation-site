import type {
  ElectricalSocketSpec,
  ElectricalSwitchSpec,
  LightingFixtureSpec,
  LightingPowerSummary,
  LightingQuoteSummary,
  LightingRoomLoadSummary,
} from "@/types/experience";
import { resolveLightingFixtures, type LightingControlOverrides } from "./lighting-controls";

function round(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function calculateLightingPowerSummary(
  fixtures: readonly LightingFixtureSpec[],
  switches: readonly ElectricalSwitchSpec[],
  sockets: readonly ElectricalSocketSpec[],
  overrides: LightingControlOverrides = {},
): LightingPowerSummary {
  const resolvedFixtures = resolveLightingFixtures(fixtures, overrides);
  const rooms = new Map<string, LightingRoomLoadSummary>();

  function ensureRoom(roomId: string, roomName: string): LightingRoomLoadSummary {
    const existing = rooms.get(roomId);
    if (existing) return existing;

    const summary: LightingRoomLoadSummary = {
      roomId,
      roomName,
      fixtureCount: 0,
      switchCount: 0,
      socketCount: 0,
      totalWattage: 0,
      currentConsumptionAmps: 0,
      estimatedMonthlyUsageKwh: 0,
      peakLoadWatts: 0,
    };
    rooms.set(roomId, summary);
    return summary;
  }

  resolvedFixtures.forEach((fixture) => {
    const room = ensureRoom(fixture.roomId, fixture.roomName);
    rooms.set(fixture.roomId, {
      ...room,
      fixtureCount: room.fixtureCount + 1,
      totalWattage: round(room.totalWattage + fixture.load.consumptionWatts),
      currentConsumptionAmps: round(room.currentConsumptionAmps + fixture.load.currentAmps, 3),
      estimatedMonthlyUsageKwh: round(room.estimatedMonthlyUsageKwh + fixture.load.estimatedMonthlyKwh),
      peakLoadWatts: round(room.peakLoadWatts + fixture.load.peakLoadWatts),
    });
  });

  switches.forEach((switchSpec) => {
    const room = ensureRoom(switchSpec.roomId, switchSpec.roomName);
    rooms.set(switchSpec.roomId, {
      ...room,
      switchCount: room.switchCount + 1,
      totalWattage: round(room.totalWattage + switchSpec.standbyWatts),
      currentConsumptionAmps: round(room.currentConsumptionAmps + switchSpec.standbyWatts / 230, 3),
      estimatedMonthlyUsageKwh: round(room.estimatedMonthlyUsageKwh + (switchSpec.standbyWatts * 720) / 1000),
      peakLoadWatts: round(room.peakLoadWatts + switchSpec.standbyWatts),
    });
  });

  sockets.forEach((socket) => {
    const room = ensureRoom(socket.roomId, socket.roomName);
    rooms.set(socket.roomId, {
      ...room,
      socketCount: room.socketCount + 1,
      totalWattage: round(room.totalWattage + socket.standbyWatts),
      currentConsumptionAmps: round(room.currentConsumptionAmps + socket.standbyWatts / socket.ratedVoltage, 3),
      estimatedMonthlyUsageKwh: round(room.estimatedMonthlyUsageKwh + (socket.standbyWatts * 720) / 1000),
      peakLoadWatts: round(room.peakLoadWatts + socket.peakLoadWatts),
    });
  });

  const roomLoads = Array.from(rooms.values()).sort((a, b) => b.peakLoadWatts - a.peakLoadWatts);

  return {
    voltage: 230,
    fixtureCount: fixtures.length,
    switchCount: switches.length,
    socketCount: sockets.length,
    totalWattage: round(roomLoads.reduce((total, room) => total + room.totalWattage, 0)),
    currentConsumptionAmps: round(roomLoads.reduce((total, room) => total + room.currentConsumptionAmps, 0), 3),
    estimatedMonthlyUsageKwh: round(roomLoads.reduce((total, room) => total + room.estimatedMonthlyUsageKwh, 0)),
    peakLoadWatts: round(roomLoads.reduce((total, room) => total + room.peakLoadWatts, 0)),
    roomLoads,
  };
}

export function calculateLightingQuoteSummary(
  fixtures: readonly LightingFixtureSpec[],
  switches: readonly ElectricalSwitchSpec[],
  sockets: readonly ElectricalSocketSpec[],
): LightingQuoteSummary {
  const allPricing = [
    ...fixtures.map((fixture) => fixture.pricing),
    ...switches.map((switchSpec) => switchSpec.pricing),
    ...sockets.map((socket) => socket.pricing),
  ];
  const equipmentCost = round(allPricing.reduce((total, pricing) => total + pricing.equipmentCost, 0));
  const installationCost = round(allPricing.reduce((total, pricing) => total + pricing.installationCost, 0));
  const labourCost = round(allPricing.reduce((total, pricing) => total + pricing.labourCost, 0));

  return {
    equipmentCost,
    installationCost,
    labourCost,
    totalCost: round(equipmentCost + installationCost + labourCost),
    currency: "USD",
    source: "experience-lighting-internal-model",
    existingQuotationEngineModified: false,
  };
}
