import type { SmartDeviceSearchFilters, SmartDeviceSnapshot } from "@/types/experience";

export const DEFAULT_DEVICE_SEARCH_FILTERS: SmartDeviceSearchFilters = {
  query: "",
  category: "all",
  manufacturer: "all",
  roomId: "all",
  onlineStatus: "all",
} as const;

export function filterSmartDevices(devices: readonly SmartDeviceSnapshot[], filters: SmartDeviceSearchFilters): readonly SmartDeviceSnapshot[] {
  const query = filters.query.trim().toLowerCase();

  return devices.filter((device) => {
    const queryMatches =
      query.length === 0 ||
      device.name.toLowerCase().includes(query) ||
      device.uniqueId.toLowerCase().includes(query) ||
      device.manufacturer.toLowerCase().includes(query) ||
      device.model.toLowerCase().includes(query) ||
      device.roomName.toLowerCase().includes(query);
    const categoryMatches = filters.category === "all" || device.category === filters.category;
    const manufacturerMatches = filters.manufacturer === "all" || device.manufacturer === filters.manufacturer;
    const roomMatches = filters.roomId === "all" || device.roomId === filters.roomId;
    const onlineMatches = filters.onlineStatus === "all" || device.onlineStatus === filters.onlineStatus;

    return queryMatches && categoryMatches && manufacturerMatches && roomMatches && onlineMatches;
  });
}
