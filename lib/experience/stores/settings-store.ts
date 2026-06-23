import { create } from "zustand";

interface SettingsState {
  shadows: boolean;
  reducedMotion: boolean;
  pixelRatio: number;
  setShadows: (shadows: boolean) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setPixelRatio: (pixelRatio: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  shadows: true,
  reducedMotion: false,
  pixelRatio: 1.5,
  setShadows: (shadows) => set({ shadows }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setPixelRatio: (pixelRatio) => set({ pixelRatio: Math.min(2, Math.max(1, pixelRatio)) }),
}));
