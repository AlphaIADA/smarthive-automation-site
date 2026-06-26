import type { SmartDeviceCategory, SmartDeviceRoomRegistry, SmartDeviceSnapshot } from "@/types/experience";
import { SmartDevice } from "./smart-device";

function emptyCategoryCounts(): Record<SmartDeviceCategory, number> {
  return {
    lighting: 0,
    switches: 0,
    sockets: 0,
    curtains: 0,
    blinds: 0,
    thermostats: 0,
    hvac: 0,
    cctv: 0,
    doorbells: 0,
    "smart-locks": 0,
    "motion-sensors": 0,
    "door-sensors": 0,
    "window-sensors": 0,
    "smoke-detector": 0,
    "gas-detector": 0,
    "water-leak-sensor": 0,
    "temperature-sensor": 0,
    "humidity-sensor": 0,
    "ir-blaster": 0,
    "smart-hub": 0,
    "voice-assistant": 0,
    "garage-controller": 0,
    "gate-controller": 0,
    "pool-controller": 0,
    "garden-irrigation": 0,
    "solar-inverter": 0,
    "battery-storage": 0,
    ups: 0,
    "ev-charger": 0,
    "smart-tv": 0,
    "audio-system": 0,
    "coffee-machine": 0,
    dishwasher: 0,
    refrigerator: 0,
    "water-heater": 0,
    "smart-mirror": 0,
  };
}

export class SmartDeviceRegistry {
  private readonly devices = new Map<string, SmartDevice>();

  register(device: SmartDevice): SmartDeviceSnapshot {
    this.devices.set(device.uniqueId, device);
    return device.snapshot();
  }

  remove(deviceId: string): SmartDeviceSnapshot | null {
    const device = this.devices.get(deviceId);
    if (!device) return null;
    this.devices.delete(deviceId);
    return device.snapshot();
  }

  get(deviceId: string): SmartDevice | null {
    return this.devices.get(deviceId) ?? null;
  }

  getSnapshot(deviceId: string): SmartDeviceSnapshot | null {
    return this.devices.get(deviceId)?.snapshot() ?? null;
  }

  list(): readonly SmartDeviceSnapshot[] {
    return Array.from(this.devices.values()).map((device) => device.snapshot());
  }

  listByRoom(roomId: string): readonly SmartDeviceSnapshot[] {
    return this.list().filter((device) => device.roomId === roomId);
  }

  listByCategory(category: SmartDeviceCategory): readonly SmartDeviceSnapshot[] {
    return this.list().filter((device) => device.category === category);
  }

  roomRegistries(): readonly SmartDeviceRoomRegistry[] {
    const grouped = new Map<string, SmartDeviceSnapshot[]>();

    this.list().forEach((device) => {
      const devices = grouped.get(device.roomId) ?? [];
      devices.push(device);
      grouped.set(device.roomId, devices);
    });

    return Array.from(grouped.entries()).map(([roomId, devices]) => {
      const categoryCounts = emptyCategoryCounts();
      devices.forEach((device) => {
        categoryCounts[device.category] += 1;
      });

      return {
        roomId,
        roomName: devices[0]?.roomName ?? roomId,
        devices,
        categoryCounts,
      };
    });
  }

  clear(): void {
    this.devices.clear();
  }
}

export const CENTRAL_DEVICE_REGISTRY = new SmartDeviceRegistry();
