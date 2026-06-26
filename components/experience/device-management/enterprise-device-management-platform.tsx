"use client";

import { EnterpriseDeviceManagementRenderer } from "./generators/enterprise-device-management-renderer";

export function EnterpriseDeviceManagementPlatform() {
  return (
    <group
      name="SmartHive Enterprise Device Management Platform"
      userData={{
        milestone: 19,
        system: "enterprise-device-management-platform",
        inventory: true,
        firmware: true,
        health: true,
        logs: true,
        battery: true,
        connectivity: true,
        diagnostics: true,
        restart: "simulated",
        reset: "simulated",
        maintenance: true,
        replacement: true,
        ota: true,
        grouping: true,
        quoteCostSync: "internal",
        realDeviceActions: "not-executed",
      }}
    >
      <EnterpriseDeviceManagementRenderer />
    </group>
  );
}
