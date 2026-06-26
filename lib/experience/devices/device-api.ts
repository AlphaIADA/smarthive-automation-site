import type { SmartDeviceApiResult } from "@/types/experience";
import { CENTRAL_DEVICE_REGISTRY } from "./device-registry";
import { RegisteredSmartDevice } from "./smart-device";

function result(ok: boolean, deviceId: string, message: string): SmartDeviceApiResult {
  return {
    ok,
    device: CENTRAL_DEVICE_REGISTRY.getSnapshot(deviceId),
    message,
  };
}

export const SmartDeviceApi = {
  register(device: RegisteredSmartDevice): SmartDeviceApiResult {
    const snapshot = CENTRAL_DEVICE_REGISTRY.register(device);
    return {
      ok: true,
      device: snapshot,
      message: `${snapshot.name} registered.`,
    };
  },

  remove(deviceId: string): SmartDeviceApiResult {
    const snapshot = CENTRAL_DEVICE_REGISTRY.remove(deviceId);
    return {
      ok: Boolean(snapshot),
      device: snapshot,
      message: snapshot ? `${snapshot.name} removed.` : `Device ${deviceId} was not found.`,
    };
  },

  enable(deviceId: string): SmartDeviceApiResult {
    const device = CENTRAL_DEVICE_REGISTRY.get(deviceId);
    if (!device) return result(false, deviceId, `Device ${deviceId} was not found.`);
    device.enable();
    return result(true, deviceId, `${device.name} enabled internally.`);
  },

  disable(deviceId: string): SmartDeviceApiResult {
    const device = CENTRAL_DEVICE_REGISTRY.get(deviceId);
    if (!device) return result(false, deviceId, `Device ${deviceId} was not found.`);
    device.disable();
    return result(true, deviceId, `${device.name} disabled internally.`);
  },

  rename(deviceId: string, name: string): SmartDeviceApiResult {
    const device = CENTRAL_DEVICE_REGISTRY.get(deviceId);
    if (!device) return result(false, deviceId, `Device ${deviceId} was not found.`);
    device.rename(name);
    return result(true, deviceId, `${deviceId} renamed to ${name}.`);
  },

  moveRoom(deviceId: string, roomId: string, roomName: string): SmartDeviceApiResult {
    const device = CENTRAL_DEVICE_REGISTRY.get(deviceId);
    if (!device) return result(false, deviceId, `Device ${deviceId} was not found.`);
    device.moveRoom(roomId, roomName);
    return result(true, deviceId, `${device.name} moved to ${roomName}.`);
  },

  futureAutomation(deviceId: string): SmartDeviceApiResult {
    const device = CENTRAL_DEVICE_REGISTRY.get(deviceId);
    if (!device) return result(false, deviceId, `Device ${deviceId} was not found.`);
    return result(true, deviceId, `${device.name} exposes automation hooks but automation logic is intentionally not implemented.`);
  },
} as const;
