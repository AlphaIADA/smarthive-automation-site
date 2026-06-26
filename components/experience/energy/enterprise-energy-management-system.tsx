"use client";

import { EnergyRenderer } from "./generators/energy-renderer";

export function EnterpriseEnergyManagementSystem() {
  return (
    <group
      name="SmartHive Enterprise Energy Management System"
      userData={{
        milestone: 11,
        system: "enterprise-energy-management",
        powerFlowAnimated: true,
        quoteEngine: "untouched",
        internalEnergyRecommendations: true,
      }}
    >
      <EnergyRenderer />
    </group>
  );
}
