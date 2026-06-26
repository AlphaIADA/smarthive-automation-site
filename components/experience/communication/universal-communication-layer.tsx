"use client";

import { CommunicationLayerRenderer } from "./generators/communication-layer-renderer";

export function UniversalCommunicationLayer() {
  return (
    <group
      name="SmartHive Universal Smart Device Communication Layer"
      userData={{
        milestone: 18,
        system: "universal-smart-device-communication-layer",
        protocolPlugins: true,
        autoDiscovery: true,
        healthMonitoring: true,
        versionManagement: true,
        simulationMode: true,
        liveModeFutureSupport: true,
        realDeviceConnections: "not-created",
      }}
    >
      <CommunicationLayerRenderer />
    </group>
  );
}
