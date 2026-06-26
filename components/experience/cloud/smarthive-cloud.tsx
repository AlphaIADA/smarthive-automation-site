"use client";

import { CloudSyncRenderer } from "./generators/cloud-sync-renderer";

export function SmartHiveCloud() {
  return (
    <group
      name="SmartHive Cloud"
      userData={{
        milestone: 22,
        system: "smarthive-cloud",
        cloudSync: true,
        projectBackup: true,
        deviceBackup: true,
        automationBackup: true,
        sceneBackup: true,
        customerProfiles: true,
        propertyProfiles: true,
        offlineEngine: true,
        conflictResolution: true,
        realCloudConnection: "not-created",
      }}
    >
      <CloudSyncRenderer />
    </group>
  );
}
