"use client";

import { DigitalTwinRenderer } from "./generators/digital-twin-renderer";

export function DigitalTwinIntelligenceEngine() {
  return (
    <group
      name="SmartHive Digital Twin Intelligence Engine"
      userData={{
        milestone: 15,
        system: "digital-twin-intelligence-engine",
        centralizedTwinRegistry: true,
        hierarchicalObjectGraph: true,
        liveStateEngine: true,
        timeMachine: true,
        internalTwinApi: true,
        routeHandlersCreated: false,
        websiteFunctionality: "untouched",
      }}
    >
      <DigitalTwinRenderer />
    </group>
  );
}
