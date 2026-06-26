import { create } from "zustand";
import type { SecurityDashboardMode, SecurityMapLayer } from "@/types/experience";

interface SecurityStoreState {
  dashboardMode: SecurityDashboardMode;
  selectedSecurityDeviceId: string | null;
  visibleLayers: Readonly<Record<SecurityMapLayer, boolean>>;
  setDashboardMode: (dashboardMode: SecurityDashboardMode) => void;
  selectSecurityDevice: (deviceId: string) => void;
  clearSecuritySelection: () => void;
  toggleLayer: (layer: SecurityMapLayer, visible: boolean) => void;
}

export const useSecurityStore = create<SecurityStoreState>((set) => ({
  dashboardMode: "armed",
  selectedSecurityDeviceId: null,
  visibleLayers: {
    sensors: true,
    "camera-coverage": true,
    locks: true,
  },
  setDashboardMode: (dashboardMode) => set({ dashboardMode }),
  selectSecurityDevice: (deviceId) => set({ selectedSecurityDeviceId: deviceId }),
  clearSecuritySelection: () => set({ selectedSecurityDeviceId: null }),
  toggleLayer: (layer, visible) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: visible,
      },
    })),
}));
