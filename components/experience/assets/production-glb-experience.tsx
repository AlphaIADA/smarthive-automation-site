"use client";

import { useEffect, useMemo } from "react";
import { ContactShadows, Environment } from "@react-three/drei";
import type { CameraPresetId } from "@/types/experience";
import type { EventBus } from "@/lib/experience/event-bus";
import { PRIMARY_VILLA_MODEL, roomChunksForCameraPreset } from "@/lib/experience/assets/model-manifest";
import { useCameraStore, useModelAssetStore, useSettingsStore } from "@/lib/experience/stores";
import { CheckedModelAsset } from "./model-asset-loader";
import { ProductionModelPlaceholder } from "./model-placeholder";
import { HotspotLayer } from "./hotspot-layer";

const GUIDED_TOUR_PRESETS: readonly CameraPresetId[] = [
  "exterior-arrival",
  "living-room",
  "kitchen",
  "master-bedroom",
  "cinema",
  "gym",
  "pool-area",
  "security-overview",
  "full-house-top",
] as const;

export function ProductionGlbExperience({ eventBus }: { readonly eventBus: EventBus }) {
  const renderMode = useModelAssetStore((state) => state.renderMode);
  const assetStatuses = useModelAssetStore((state) => state.assetStatuses);
  const guidedTourActive = useModelAssetStore((state) => state.guidedTourActive);
  const guidedTourIndex = useModelAssetStore((state) => state.guidedTourIndex);
  const advanceGuidedTour = useModelAssetStore((state) => state.advanceGuidedTour);
  const preset = useCameraStore((state) => state.preset);
  const setPreset = useCameraStore((state) => state.setPreset);
  const shadows = useSettingsStore((state) => state.shadows);
  const primaryStatus = assetStatuses.villa?.status ?? "idle";
  const activePreset = guidedTourActive ? GUIDED_TOUR_PRESETS[guidedTourIndex] ?? "exterior-arrival" : preset;

  useEffect(() => {
    if (!guidedTourActive) return;
    setPreset(activePreset);
    const timer = window.setTimeout(() => {
      advanceGuidedTour(GUIDED_TOUR_PRESETS.length);
    }, 5200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activePreset, advanceGuidedTour, guidedTourActive, setPreset]);

  const activeChunks = useMemo(() => roomChunksForCameraPreset(activePreset), [activePreset]);

  if (renderMode !== "production-glb") return null;

  return (
    <group name="SmartHive production GLB experience">
      <Environment preset="city" background={false} />
      <CheckedModelAsset asset={PRIMARY_VILLA_MODEL} />
      {primaryStatus === "missing" || primaryStatus === "error" ? <ProductionModelPlaceholder /> : null}
      {primaryStatus === "available" ? (
        <>
          {activeChunks.map((asset) => (
            <CheckedModelAsset key={asset.id} asset={asset} />
          ))}
          <HotspotLayer eventBus={eventBus} />
          {shadows ? <ContactShadows position={[0, -0.02, 0]} opacity={0.28} scale={58} blur={2.6} far={22} resolution={1024} /> : null}
        </>
      ) : null}
    </group>
  );
}
