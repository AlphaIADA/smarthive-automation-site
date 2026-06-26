import { create } from "zustand";
import {
  COMMUNICATION_DISCOVERY_RESULTS,
  COMMUNICATION_HEALTH_SNAPSHOT,
  DEVICE_DRIVER_ENDPOINTS,
  DiscoverDevices,
  MonitorHealth,
  PrepareLiveSync,
  SimulateDevice,
  SwitchMode,
} from "@/lib/experience/communication";
import type {
  CommunicationHealthSnapshot,
  CommunicationMode,
  DeviceDriverEndpoint,
  ProtocolDiscoveryResult,
  SmartHomeProtocol,
} from "@/types/experience";

interface CommunicationStoreState {
  mode: CommunicationMode;
  selectedProtocol: SmartHomeProtocol | "all";
  selectedEndpointId: string;
  discoveryResults: readonly ProtocolDiscoveryResult[];
  healthSnapshot: CommunicationHealthSnapshot;
  liveSyncPreview: readonly DeviceDriverEndpoint[];
  simulatedEndpoint: DeviceDriverEndpoint | null;
  setMode: (mode: CommunicationMode) => void;
  selectProtocol: (protocol: SmartHomeProtocol | "all") => void;
  selectEndpoint: (endpointId: string) => void;
  runDiscovery: () => void;
  monitorHealth: () => void;
  simulateSelectedEndpoint: () => void;
  prepareLiveSync: () => void;
}

const initialEndpoint = DEVICE_DRIVER_ENDPOINTS[0];

export const useCommunicationStore = create<CommunicationStoreState>((set, get) => ({
  mode: "simulation",
  selectedProtocol: "all",
  selectedEndpointId: initialEndpoint?.id ?? "",
  discoveryResults: COMMUNICATION_DISCOVERY_RESULTS,
  healthSnapshot: COMMUNICATION_HEALTH_SNAPSHOT,
  liveSyncPreview: [],
  simulatedEndpoint: null,
  setMode: (mode) => set({ mode: SwitchMode(mode) }),
  selectProtocol: (selectedProtocol) => set({ selectedProtocol, discoveryResults: DiscoverDevices(selectedProtocol) }),
  selectEndpoint: (selectedEndpointId) => set({ selectedEndpointId }),
  runDiscovery: () => set({ discoveryResults: DiscoverDevices(get().selectedProtocol) }),
  monitorHealth: () => set({ healthSnapshot: MonitorHealth() }),
  simulateSelectedEndpoint: () => set({ simulatedEndpoint: SimulateDevice(get().selectedEndpointId) }),
  prepareLiveSync: () => set({ mode: "live-ready", liveSyncPreview: PrepareLiveSync() }),
}));
