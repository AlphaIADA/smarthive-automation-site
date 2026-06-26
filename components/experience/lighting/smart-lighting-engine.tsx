"use client";

import { LightingRenderer } from "./generators/lighting-renderer";

export function SmartLightingEngine() {
  return (
    <group
      name="SmartHive Signature Villa Lighting and Electrical System"
      userData={{
        milestone: 8,
        system: "lighting-electrical",
        noAi: true,
        noScenes: true,
        noVoice: true,
        quotationEngine: "untouched",
        internalQuoteModel: true,
      }}
    >
      <LightingRenderer />
    </group>
  );
}
