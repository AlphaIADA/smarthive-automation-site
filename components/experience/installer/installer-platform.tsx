"use client";

import { InstallerPlatformRenderer } from "./generators/installer-platform-renderer";

export function InstallerPlatform() {
  return (
    <group
      name="SmartHive Installer Platform"
      userData={{
        milestone: 23,
        system: "installer-platform",
        installerDashboard: true,
        projectWorkflow: true,
        roomInstallationMode: true,
        wiringPlanner: true,
        materialPlanner: true,
        technicianAppReady: true,
        installationReports: true,
        externalCrm: "payload-only",
      }}
    >
      <InstallerPlatformRenderer />
    </group>
  );
}
