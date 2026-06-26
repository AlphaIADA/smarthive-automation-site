import type {
  SmartDeviceAutomationHooks,
  SmartDeviceBatteryStatus,
  SmartDeviceCategory,
  SmartDeviceConnectivity,
  SmartDeviceHealthStatus,
  SmartDeviceOnlineStatus,
  SmartDevicePlaceholder,
  SmartDevicePowerConsumption,
  SmartDevicePowerState,
  SmartDevicePricing,
  SmartDeviceSnapshot,
  SmartDeviceSpec,
  SmartDeviceWarranty,
} from "@/types/experience";

export abstract class SmartDevice {
  protected spec: SmartDeviceSpec;

  protected constructor(spec: SmartDeviceSpec) {
    this.spec = spec;
  }

  get uniqueId(): string {
    return this.spec.uniqueId;
  }

  get name(): string {
    return this.spec.name;
  }

  get category(): SmartDeviceCategory {
    return this.spec.category;
  }

  get manufacturer(): string {
    return this.spec.manufacturer;
  }

  get model(): string {
    return this.spec.model;
  }

  get firmwareVersion(): string {
    return this.spec.firmwareVersion;
  }

  get roomId(): string {
    return this.spec.roomId;
  }

  get roomName(): string {
    return this.spec.roomName;
  }

  get powerState(): SmartDevicePowerState {
    return this.spec.powerState;
  }

  get healthStatus(): SmartDeviceHealthStatus {
    return this.spec.healthStatus;
  }

  get batteryStatus(): SmartDeviceBatteryStatus | null {
    return this.spec.batteryStatus;
  }

  get signalStrength(): number {
    return this.spec.signalStrength;
  }

  get onlineStatus(): SmartDeviceOnlineStatus {
    return this.spec.onlineStatus;
  }

  get connectivity(): SmartDeviceConnectivity {
    return this.spec.connectivity;
  }

  get pricing(): SmartDevicePricing {
    return this.spec.pricing;
  }

  get warranty(): SmartDeviceWarranty {
    return this.spec.warranty;
  }

  get powerConsumption(): SmartDevicePowerConsumption {
    return this.spec.powerConsumption;
  }

  get futureAutomationHooks(): SmartDeviceAutomationHooks {
    return this.spec.futureAutomationHooks;
  }

  get placeholder(): SmartDevicePlaceholder {
    return this.spec.placeholder;
  }

  enable(): void {
    this.spec = { ...this.spec, powerState: "on", onlineStatus: "online" };
  }

  disable(): void {
    this.spec = { ...this.spec, powerState: "off" };
  }

  rename(name: string): void {
    this.spec = { ...this.spec, name };
  }

  moveRoom(roomId: string, roomName: string): void {
    this.spec = { ...this.spec, roomId, roomName };
  }

  snapshot(): SmartDeviceSnapshot {
    return {
      ...this.spec,
      room: {
        id: this.spec.roomId,
        name: this.spec.roomName,
      },
    };
  }
}

export class RegisteredSmartDevice extends SmartDevice {
  constructor(spec: SmartDeviceSpec) {
    super(spec);
  }
}
