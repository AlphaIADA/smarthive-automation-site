import { create } from "zustand";
import { SOC_CAMERA_WALL_TILES, SOC_INCIDENTS, SOC_LIVE_MAP_ASSETS } from "@/lib/experience/security/security-operations-center";
import type { SocMapLayer, SocSecurityLevel, SocVideoMode } from "@/types/experience";

interface SecurityOperationsStoreState {
  securityLevel: SocSecurityLevel;
  selectedCameraId: string;
  selectedIncidentId: string;
  selectedMapAssetId: string;
  visibleLayers: Readonly<Record<SocMapLayer, boolean>>;
  videoMode: SocVideoMode;
  setSecurityLevel: (securityLevel: SocSecurityLevel) => void;
  selectCamera: (cameraId: string) => void;
  selectIncident: (incidentId: string) => void;
  selectMapAsset: (assetId: string) => void;
  toggleLayer: (layer: SocMapLayer, visible: boolean) => void;
  setVideoMode: (videoMode: SocVideoMode) => void;
}

export const useSecurityOperationsStore = create<SecurityOperationsStoreState>((set) => ({
  securityLevel: "armed",
  selectedCameraId: SOC_CAMERA_WALL_TILES[0]?.cameraId ?? "",
  selectedIncidentId: SOC_INCIDENTS[0]?.id ?? "",
  selectedMapAssetId: SOC_LIVE_MAP_ASSETS[0]?.id ?? "",
  visibleLayers: {
    cameras: true,
    sensors: true,
    locks: true,
    alarms: true,
  },
  videoMode: "live",
  setSecurityLevel: (securityLevel) => set({ securityLevel }),
  selectCamera: (selectedCameraId) => set({ selectedCameraId, videoMode: "live" }),
  selectIncident: (selectedIncidentId) => set({ selectedIncidentId }),
  selectMapAsset: (selectedMapAssetId) => set({ selectedMapAssetId }),
  toggleLayer: (layer, visible) =>
    set((state) => ({
      visibleLayers: {
        ...state.visibleLayers,
        [layer]: visible,
      },
    })),
  setVideoMode: (videoMode) => set({ videoMode }),
}));
