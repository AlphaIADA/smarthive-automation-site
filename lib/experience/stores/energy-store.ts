import { create } from "zustand";
import type { EnergySourceType } from "@/types/experience";
import { ENERGY_CIRCUIT_MONITORS, ENERGY_ROOM_MONITORS, ENERGY_SOURCES } from "@/lib/experience/energy/energy-catalog";

interface EnergyStoreState {
  heatmapVisible: boolean;
  powerFlowVisible: boolean;
  selectedRoomId: string;
  selectedCircuitId: string;
  selectedSourceType: EnergySourceType;
  setHeatmapVisible: (visible: boolean) => void;
  setPowerFlowVisible: (visible: boolean) => void;
  selectRoom: (roomId: string) => void;
  selectCircuit: (circuitId: string) => void;
  selectSource: (sourceType: EnergySourceType) => void;
}

export const useEnergyStore = create<EnergyStoreState>((set) => ({
  heatmapVisible: true,
  powerFlowVisible: true,
  selectedRoomId: ENERGY_ROOM_MONITORS[0]?.roomId ?? "",
  selectedCircuitId: ENERGY_CIRCUIT_MONITORS[0]?.id ?? "",
  selectedSourceType: ENERGY_SOURCES[0]?.type ?? "solar",
  setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),
  setPowerFlowVisible: (powerFlowVisible) => set({ powerFlowVisible }),
  selectRoom: (selectedRoomId) => set({ selectedRoomId }),
  selectCircuit: (selectedCircuitId) => set({ selectedCircuitId }),
  selectSource: (selectedSourceType) => set({ selectedSourceType }),
}));
