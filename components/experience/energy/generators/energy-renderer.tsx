"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import { ENERGY_HEATMAP_ROOMS, ENERGY_POWER_FLOWS, ENERGY_SOURCES } from "@/lib/experience/energy/energy-catalog";
import { useEnergyStore } from "@/lib/experience/stores";
import type { EnergyFlowNodeType } from "@/types/experience";

const SOURCE_COLORS: Record<EnergyFlowNodeType, string> = {
  solar: "#ffd36e",
  battery: "#8fe388",
  grid: "#70c2ff",
  generator: "#ffb26b",
  ups: "#d4c1ff",
  devices: "#f2f4f5",
};

const NODE_POSITIONS: Record<EnergyFlowNodeType, [number, number, number]> = {
  solar: [-5.8, 6.6, -4.8],
  battery: [-3.6, 5.6, -3.4],
  grid: [-0.8, 5.25, -5.2],
  generator: [2.15, 5.1, -4.9],
  ups: [4.0, 4.65, -3.2],
  devices: [-0.35, 3.05, -1.4],
};

function HeatmapRoomPlanes() {
  const visible = useEnergyStore((state) => state.heatmapVisible);
  if (!visible) return null;

  return (
    <group name="energy-room-heatmap">
      {ENERGY_HEATMAP_ROOMS.map((room) => (
        <mesh
          key={room.roomId}
          name={`energy-heatmap-${room.roomId}`}
          position={room.position}
          rotation={[-Math.PI / 2, 0, 0]}
          userData={{
            roomId: room.roomId,
            energyLevel: room.level,
            instantWatts: room.metrics.instantConsumptionWatts,
            monthlyKwh: room.metrics.monthlyUsageKwh,
            projectedCostUsd: room.metrics.projectedCostUsd,
          }}
        >
          <planeGeometry args={[room.size[0], room.size[1]]} />
          <meshBasicMaterial color={room.color} transparent opacity={0.18 + room.intensity * 0.26} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function FlowPulse({ from, to, color, speed, offset }: { readonly from: Vector3; readonly to: Vector3; readonly color: string; readonly speed: number; readonly offset: number }) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = (clock.elapsedTime * speed + offset) % 1;
    mesh.position.lerpVectors(from, to, t);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.055, 12, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function FlowLine({ from, to, color }: { readonly from: Vector3; readonly to: Vector3; readonly color: string }) {
  const midpoint = useMemo(() => from.clone().add(to).multiplyScalar(0.5), [from, to]);
  const length = from.distanceTo(to);
  const yaw = Math.atan2(to.x - from.x, to.z - from.z);
  const pitch = Math.atan2(to.y - from.y, Math.hypot(to.x - from.x, to.z - from.z));

  return (
    <mesh position={midpoint} rotation={[Math.PI / 2 + pitch, 0, yaw]}>
      <cylinderGeometry args={[0.012, 0.012, length, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.28} />
    </mesh>
  );
}

function PowerFlowGraph() {
  const visible = useEnergyStore((state) => state.powerFlowVisible);
  const selectedSourceType = useEnergyStore((state) => state.selectedSourceType);
  if (!visible) return null;

  return (
    <group name="animated-energy-power-flow">
      {ENERGY_SOURCES.map((source) => {
        const position = NODE_POSITIONS[source.type];
        const selected = source.type === selectedSourceType;

        return (
          <group key={source.id} position={position}>
            <mesh castShadow>
              <sphereGeometry args={[selected ? 0.18 : 0.13, 18, 12]} />
              <meshStandardMaterial color={SOURCE_COLORS[source.type]} roughness={0.28} metalness={0.35} emissive={SOURCE_COLORS[source.type]} emissiveIntensity={selected ? 0.45 : 0.18} />
            </mesh>
          </group>
        );
      })}
      <group position={NODE_POSITIONS.devices}>
        <mesh castShadow>
          <boxGeometry args={[0.34, 0.2, 0.34]} />
          <meshStandardMaterial color={SOURCE_COLORS.devices} roughness={0.28} metalness={0.24} emissive="#ffffff" emissiveIntensity={0.12} />
        </mesh>
      </group>
      {ENERGY_POWER_FLOWS.map((flow, index) => {
        const from = new Vector3(...NODE_POSITIONS[flow.from]);
        const to = new Vector3(...NODE_POSITIONS[flow.to]);
        const color = SOURCE_COLORS[flow.from];
        const active = flow.kw > 0;

        return (
          <group key={flow.id} visible={active} userData={{ flowId: flow.id, kw: flow.kw, animated: flow.animated, label: flow.label }}>
            <FlowLine from={from} to={to} color={color} />
            <FlowPulse from={from} to={to} color={color} speed={0.16 + flow.kw / 40} offset={index * 0.21} />
            <FlowPulse from={from} to={to} color={color} speed={0.16 + flow.kw / 40} offset={index * 0.21 + 0.45} />
          </group>
        );
      })}
    </group>
  );
}

export function EnergyRenderer() {
  return (
    <group name="SmartHive Enterprise Energy Management Renderer">
      <HeatmapRoomPlanes />
      <PowerFlowGraph />
    </group>
  );
}
