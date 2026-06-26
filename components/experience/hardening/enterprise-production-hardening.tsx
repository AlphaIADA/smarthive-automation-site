"use client";

import { ProductionHardeningRenderer } from "./generators/production-hardening-renderer";

export function EnterpriseProductionHardening() {
  return (
    <group
      name="Enterprise Production Hardening"
      userData={{
        milestone: 24,
        system: "enterprise-production-hardening",
        performanceReport: true,
        securityReport: true,
        accessibilityReport: true,
        testCoverageReport: true,
        monitoringReport: true,
        globalHeaders: "report-only",
      }}
    >
      <ProductionHardeningRenderer />
    </group>
  );
}
