import { create } from "zustand";
import {
  ENTERPRISE_DEVICE_GROUPS,
  ENTERPRISE_DEVICE_INVENTORY,
  MarkReplacement,
  ResetDevice,
  RestartDevice,
  RollbackFirmware,
  RunDeviceDiagnostics,
  ScheduleFirmwareUpdate,
  ScheduleMaintenance,
  UpdateInstallationStatus,
} from "@/lib/experience/device-management";
import type {
  EnterpriseDeviceCommandResult,
  EnterpriseDeviceGroup,
  EnterpriseDeviceRecord,
  EnterpriseGroupType,
  EnterpriseInstallationStatus,
  EnterpriseOtaPlan,
} from "@/types/experience";

interface EnterpriseDeviceManagementStoreState {
  selectedInventoryId: string;
  selectedGroupType: EnterpriseGroupType;
  visibleGroups: readonly EnterpriseDeviceGroup[];
  selectedDevice: EnterpriseDeviceRecord | null;
  commandResult: EnterpriseDeviceCommandResult | null;
  otaPlan: EnterpriseOtaPlan | null;
  updatedInstallationDevice: EnterpriseDeviceRecord | null;
  selectInventory: (inventoryId: string) => void;
  setGroupType: (groupType: EnterpriseGroupType) => void;
  runDiagnostics: () => void;
  restart: () => void;
  reset: () => void;
  scheduleMaintenance: () => void;
  markReplacement: () => void;
  setInstallationStatus: (installationStatus: EnterpriseInstallationStatus) => void;
  scheduleOta: () => void;
  rollbackFirmware: () => void;
}

const initialDevice = ENTERPRISE_DEVICE_INVENTORY[0] ?? null;

function findDevice(inventoryId: string) {
  return ENTERPRISE_DEVICE_INVENTORY.find((record) => record.id === inventoryId) ?? null;
}

export const useEnterpriseDeviceManagementStore = create<EnterpriseDeviceManagementStoreState>((set, get) => ({
  selectedInventoryId: initialDevice?.id ?? "",
  selectedGroupType: "building",
  visibleGroups: ENTERPRISE_DEVICE_GROUPS.filter((group) => group.type === "building"),
  selectedDevice: initialDevice,
  commandResult: null,
  otaPlan: null,
  updatedInstallationDevice: null,
  selectInventory: (selectedInventoryId) => set({ selectedInventoryId, selectedDevice: findDevice(selectedInventoryId) }),
  setGroupType: (selectedGroupType) => set({ selectedGroupType, visibleGroups: ENTERPRISE_DEVICE_GROUPS.filter((group) => group.type === selectedGroupType) }),
  runDiagnostics: () => set({ commandResult: RunDeviceDiagnostics(get().selectedInventoryId) }),
  restart: () => set({ commandResult: RestartDevice(get().selectedInventoryId) }),
  reset: () => set({ commandResult: ResetDevice(get().selectedInventoryId) }),
  scheduleMaintenance: () => set({ commandResult: ScheduleMaintenance(get().selectedInventoryId) }),
  markReplacement: () => set({ commandResult: MarkReplacement(get().selectedInventoryId) }),
  setInstallationStatus: (installationStatus) => {
    const updatedInstallationDevice = UpdateInstallationStatus(get().selectedInventoryId, installationStatus);
    set({ updatedInstallationDevice, selectedDevice: updatedInstallationDevice ?? get().selectedDevice });
  },
  scheduleOta: () => set({ otaPlan: ScheduleFirmwareUpdate(get().selectedInventoryId) }),
  rollbackFirmware: () => set({ commandResult: RollbackFirmware(get().selectedInventoryId) }),
}));
