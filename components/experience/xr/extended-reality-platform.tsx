"use client";

import { XrRenderer } from "./generators/xr-renderer";

export function ExtendedRealityPlatform() {
  return (
    <group
      name="SmartHive Extended Reality Platform"
      userData={{
        milestone: 21,
        system: "extended-reality-platform",
        desktop: true,
        mobile: true,
        tablet: true,
        vr: true,
        ar: true,
        mixedReality: true,
        appleVisionProReady: true,
        metaQuestReady: true,
        androidXrReady: true,
        nativeXrSessionStarted: false,
      }}
    >
      <XrRenderer />
    </group>
  );
}
