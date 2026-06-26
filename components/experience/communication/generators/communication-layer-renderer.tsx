"use client";

import { useMemo } from "react";
import { DEVICE_DRIVER_ENDPOINTS, PROTOCOL_PLUGINS } from "@/lib/experience/communication";
import { useCommunicationStore } from "@/lib/experience/stores";
import type { DeviceDriverEndpoint, ProtocolPlugin, SmartHomeProtocol } from "@/types/experience";

const PROTOCOL_COLORS: Record<SmartHomeProtocol, string> = {
  matter: "#72d8ff",
  thread: "#8ff0c7",
  zigbee: "#f8d88a",
  "z-wave": "#d4c1ff",
  wifi: "#70c2ff",
  "bluetooth-le": "#8ed7ff",
  knx: "#ffd36e",
  modbus: "#ffb26b",
  bacnet: "#cdd5df",
  mqtt: "#8fe388",
  "home-assistant": "#62d9ff",
  tuya: "#9adfff",
  shelly: "#ff9b72",
  sonoff: "#f2c05f",
  control4: "#d8b35f",
  lutron: "#fff2cf",
  crestron: "#b48cff",
  savant: "#ffc778",
};

function protocolPosition(index: number): readonly [number, number, number] {
  const angle = (index / PROTOCOL_PLUGINS.length) * Math.PI * 2;
  return [Math.cos(angle) * 4.6, 8.8 + Math.sin(index * 0.7) * 0.35, -7.5 + Math.sin(angle) * 4.6] as const;
}

function ProtocolNode({ plugin, index, selected }: { readonly plugin: ProtocolPlugin; readonly index: number; readonly selected: boolean }) {
  const color = PROTOCOL_COLORS[plugin.id];
  const [x, y, z] = protocolPosition(index);

  return (
    <group
      name={`communication-protocol-${plugin.id}`}
      position={[x, y, z]}
      userData={{
        communicationProtocol: true,
        protocol: plugin.id,
        autoDiscovery: plugin.autoDiscovery,
        healthMonitoring: plugin.healthMonitoring,
        versionManagement: plugin.versionManagement,
        liveModeSupported: plugin.liveModeSupported,
      }}
    >
      <mesh>
        <sphereGeometry args={[selected ? 0.2 : 0.14, 16, 12]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.95 : 0.72} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[selected ? 0.52 : 0.34, 0.01, 8, 48]} />
        <meshBasicMaterial color={color} transparent opacity={selected ? 0.54 : 0.28} toneMapped={false} />
      </mesh>
    </group>
  );
}

function EndpointMarker({ endpoint }: { readonly endpoint: DeviceDriverEndpoint }) {
  const color = PROTOCOL_COLORS[endpoint.protocol];
  const [x, y, z] = endpoint.position;
  const opacity = endpoint.healthStatus === "critical" ? 0.86 : endpoint.healthStatus === "warning" ? 0.68 : 0.48;

  return (
    <mesh
      name={`communication-driver-${endpoint.id}`}
      position={[x, y + 0.12, z]}
      userData={{
        communicationDriver: true,
        endpointId: endpoint.id,
        protocol: endpoint.protocol,
        source: endpoint.source,
        healthStatus: endpoint.healthStatus,
        runtimeStatus: endpoint.runtimeStatus,
        simulated: endpoint.simulated,
      }}
    >
      <sphereGeometry args={[0.055, 8, 6]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
    </mesh>
  );
}

export function CommunicationLayerRenderer() {
  const selectedProtocol = useCommunicationStore((state) => state.selectedProtocol);
  const visibleEndpoints = useMemo(() => DEVICE_DRIVER_ENDPOINTS.filter((_, index) => index % 8 === 0).slice(0, 140), []);

  return (
    <group
      name="SmartHive Universal Communication Layer Renderer"
      userData={{
        milestone: 18,
        protocolCount: PROTOCOL_PLUGINS.length,
        endpointCount: DEVICE_DRIVER_ENDPOINTS.length,
        simulationMode: true,
        liveModeFutureSupport: true,
      }}
    >
      <group name="communication-protocol-plugin-ring">
        {PROTOCOL_PLUGINS.map((plugin, index) => (
          <ProtocolNode key={plugin.id} plugin={plugin} index={index} selected={selectedProtocol === plugin.id} />
        ))}
      </group>
      <group name="communication-driver-endpoints-sample">
        {visibleEndpoints.map((endpoint) => (
          <EndpointMarker key={endpoint.id} endpoint={endpoint} />
        ))}
      </group>
    </group>
  );
}
