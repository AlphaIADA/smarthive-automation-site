"use client";

import { EstateManagementRenderer } from "./generators/estate-management-renderer";

export function EstateManagementPlatform() {
  return (
    <group
      name="SmartHive Estate Management Platform"
      userData={{
        milestone: 20,
        system: "estate-management-platform",
        unlimitedPropertyModel: true,
        propertyTypes: true,
        customerPortfolio: true,
        estateHierarchy: true,
        globalDashboard: true,
        mapView: true,
        roleManagement: true,
        crmLinkPayloads: true,
        reports: true,
        externalCrmModified: false,
      }}
    >
      <EstateManagementRenderer />
    </group>
  );
}
