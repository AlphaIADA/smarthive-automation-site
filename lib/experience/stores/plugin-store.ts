import { create } from "zustand";
import type { ExperiencePluginManifest } from "@/types/experience";

interface PluginState {
  plugins: readonly ExperiencePluginManifest[];
  register: (plugin: ExperiencePluginManifest) => void;
  setEnabled: (pluginId: string, enabled: boolean) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  plugins: [],
  register: (plugin) =>
    set((state) => ({
      plugins: state.plugins.some((entry) => entry.id === plugin.id)
        ? state.plugins
        : [...state.plugins, plugin],
    })),
  setEnabled: (pluginId, enabled) =>
    set((state) => ({
      plugins: state.plugins.map((plugin) =>
        plugin.id === pluginId
          ? { ...plugin, status: enabled ? "enabled" : "disabled" }
          : plugin,
      ),
    })),
}));
