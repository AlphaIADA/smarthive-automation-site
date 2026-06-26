"use client";

import { VisionAiRenderer } from "./generators/vision-ai-renderer";

export function SmartHiveVisionAi() {
  return (
    <group
      name="SmartHive Vision AI Engine"
      userData={{
        milestone: 16,
        system: "smarthive-vision-ai",
        objectRecognition: true,
        roomRecognition: true,
        furnitureRecognition: true,
        lightingRecognition: true,
        securityRecognition: true,
        deviceRecognition: true,
        powerRecognition: true,
        photoImportFutureReady: true,
        cameraModeReady: true,
        internalVisionQuoteBuilder: true,
        externalVisionProvider: "not-required",
        existingQuoteEngineModified: false,
      }}
    >
      <VisionAiRenderer />
    </group>
  );
}
