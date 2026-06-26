"use client";

import { BasNetworkRenderer } from "./generators/bas-network-renderer";

export function BuildingAutomationSystem() {
  return (
    <group
      name="SmartHive Building Automation System"
      userData={{
        milestone: 10,
        system: "building-automation-system",
        controlsDigitalTwin: true,
        noAi: true,
        database: "untouched",
        api: "untouched",
      }}
    >
      <BasNetworkRenderer />
    </group>
  );
}
