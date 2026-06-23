"use client";

import { useEffect } from "react";
import { useMedia } from "react-use";
import { useDebugShortcut, useExperienceRuntime } from "@/hooks/experience";
import { useSettingsStore, useThemeStore } from "@/lib/experience/stores";
import { BottomStatusBar } from "@/components/experience/ui/bottom-status-bar";
import { FloatingActionButton } from "@/components/experience/ui/floating-action-button";
import { LeftNavigation } from "@/components/experience/ui/left-navigation";
import { RightInspector } from "@/components/experience/ui/right-inspector";
import { TopToolbar } from "@/components/experience/ui/top-toolbar";
import { DebugOverlay } from "@/components/experience/overlays/debug-overlay";
import { NotificationStack } from "@/components/experience/overlays/notification-stack";
import { ExperienceCanvas } from "./experience-canvas";
import styles from "@/styles/experience/experience.module.css";

export default function ExperienceShell() {
  const runtime = useExperienceRuntime();
  const debugVisible = useDebugShortcut(runtime.eventBus);
  const theme = useThemeStore((state) => state.theme);
  const prefersReducedMotion = useMedia("(prefers-reduced-motion: reduce)", false);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion, setReducedMotion]);

  useEffect(() => {
    const backgroundLandmarks = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && (element.tagName === "HEADER" || element.tagName === "FOOTER"),
    );
    backgroundLandmarks.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    return () => {
      backgroundLandmarks.forEach((element) => {
        element.inert = false;
        element.removeAttribute("aria-hidden");
      });
    };
  }, []);

  return (
    <div className={styles.shell} data-theme={theme}>
      <ExperienceCanvas eventBus={runtime.eventBus} />
      <div className={styles.noise} />
      <TopToolbar eventBus={runtime.eventBus} />
      <LeftNavigation />
      <RightInspector />
      <BottomStatusBar />
      <FloatingActionButton eventBus={runtime.eventBus} />
      <NotificationStack eventBus={runtime.eventBus} />
      <DebugOverlay visible={debugVisible} />
    </div>
  );
}
