"use client";

import { useEffect, useMemo } from "react";
import { getExperienceRuntime } from "@/lib/experience/runtime";
import {
  useCameraStore,
  useExperienceStore,
  useImmersiveWalkStore,
  usePerformanceStore,
  usePluginStore,
  useSelectionStore,
  useThemeStore,
} from "@/lib/experience/stores";

export function useExperienceRuntime() {
  const runtime = useMemo(() => getExperienceRuntime(), []);

  useEffect(() => {
    const eventBus = runtime.eventBus;
    const unsubscribers = [
      eventBus.subscribe("EXPERIENCE_READY", ({ managerCount }) => {
        useExperienceStore.getState().setManagerCount(managerCount);
        useExperienceStore.getState().setStatus("ready");
      }),
      eventBus.subscribe("MANAGER_ERROR", () => {
        useExperienceStore.getState().setStatus("degraded");
      }),
      eventBus.subscribe("CAMERA_CHANGED", ({ preset }) => {
        useCameraStore.getState().setPreset(preset);
      }),
      eventBus.subscribe("CAMERA_FOCUS_REQUESTED", ({ roomId, position, target }) => {
        useCameraStore.getState().setFocus(roomId, position, target);
      }),
      eventBus.subscribe("MODE_CHANGED", ({ mode }) => {
        useExperienceStore.getState().setMode(mode);
        useImmersiveWalkStore.getState().setMode(mode);
      }),
      eventBus.subscribe("INPUT_CHANGED", ({ source }) => {
        useImmersiveWalkStore.getState().setInputSource(source === "pointer" ? "mouse" : source);
      }),
      eventBus.subscribe("DEVICE_SELECTED", ({ deviceId }) => {
        useSelectionStore.getState().select(deviceId ? "device" : "none", deviceId);
      }),
      eventBus.subscribe("SELECTION_CHANGED", ({ kind, id }) => {
        useSelectionStore.getState().select(kind, id);
      }),
      eventBus.subscribe("PERFORMANCE_UPDATED", (snapshot) => {
        usePerformanceStore.getState().update(snapshot);
      }),
      eventBus.subscribe("PLUGIN_REGISTERED", ({ plugin }) => {
        usePluginStore.getState().register(plugin);
      }),
      eventBus.subscribe("PLUGIN_TOGGLED", ({ pluginId, enabled }) => {
        usePluginStore.getState().setEnabled(pluginId, enabled);
      }),
      eventBus.subscribe("THEME_CHANGED", ({ theme }) => {
        useThemeStore.getState().setTheme(theme);
      }),
    ];

    useExperienceStore.getState().setStatus("loading");
    runtime.acquire();

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      runtime.release();
    };
  }, [runtime]);

  return runtime;
}
