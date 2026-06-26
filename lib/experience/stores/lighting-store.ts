import { create } from "zustand";
import type { LightingControlState, RoomLightGroupName } from "@/types/experience";
import { clampBrightness, clampTemperature, normalizeHexColour, type LightingControlOverride, type LightingControlOverrides } from "@/lib/experience/lighting/lighting-controls";

interface LightingStoreState {
  selectedLightId: string | null;
  overrides: LightingControlOverrides;
  selectLight: (fixtureId: string) => void;
  clearLightSelection: () => void;
  toggleLight: (fixtureId: string, enabled: boolean) => void;
  setBrightness: (fixtureId: string, brightnessPercent: number) => void;
  setColour: (fixtureId: string, colour: string) => void;
  setTemperature: (fixtureId: string, temperatureKelvin: number) => void;
  renameLight: (fixtureId: string, displayName: string) => void;
  setGroup: (fixtureId: string, groupId: RoomLightGroupName) => void;
}

function updateOverride(overrides: LightingControlOverrides, fixtureId: string, partial: LightingControlOverride): LightingControlOverrides {
  return {
    ...overrides,
    [fixtureId]: {
      ...(overrides[fixtureId] ?? {}),
      ...partial,
    },
  };
}

function sanitizeName(value: string) {
  return value.trim().slice(0, 64);
}

export const useLightingStore = create<LightingStoreState>((set) => ({
  selectedLightId: null,
  overrides: {},
  selectLight: (fixtureId) => set({ selectedLightId: fixtureId }),
  clearLightSelection: () => set({ selectedLightId: null }),
  toggleLight: (fixtureId, enabled) => set((state) => ({ overrides: updateOverride(state.overrides, fixtureId, { enabled }) })),
  setBrightness: (fixtureId, brightnessPercent) =>
    set((state) => ({
      overrides: updateOverride(state.overrides, fixtureId, { brightnessPercent: clampBrightness(brightnessPercent) }),
    })),
  setColour: (fixtureId, colour) => set((state) => ({ overrides: updateOverride(state.overrides, fixtureId, { colour: normalizeHexColour(colour) }) })),
  setTemperature: (fixtureId, temperatureKelvin) =>
    set((state) => ({
      overrides: updateOverride(state.overrides, fixtureId, { temperatureKelvin: clampTemperature(temperatureKelvin) }),
    })),
  renameLight: (fixtureId, displayName) =>
    set((state) => {
      const name = sanitizeName(displayName);
      const partial: Partial<LightingControlState> = name ? { displayName: name } : {};
      return { overrides: updateOverride(state.overrides, fixtureId, partial) };
    }),
  setGroup: (fixtureId, groupId) => set((state) => ({ overrides: updateOverride(state.overrides, fixtureId, { groupId }) })),
}));
