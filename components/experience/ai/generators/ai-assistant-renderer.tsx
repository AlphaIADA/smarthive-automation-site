"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";
import { AI_KNOWLEDGE_PACKAGES } from "@/lib/experience/ai/knowledge-base";
import { SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import { useSelectionStore } from "@/lib/experience/stores";

const DOMAIN_COLORS: Record<string, string> = {
  rooms: "#f8d88a",
  devices: "#72d8ff",
  automation: "#d4c1ff",
  lighting: "#fff2cf",
  security: "#ff6378",
  energy: "#8ff0c7",
  furniture: "#d8b35f",
  "interior-design": "#f4d4ff",
};

function roomCenter(roomId: string): [number, number, number] | null {
  const room = INTERIOR_ROOMS.find((candidate) => candidate.id === roomId);
  if (!room) return null;

  return [
    (room.boundingBox.min.x + room.boundingBox.max.x) / 2,
    room.boundingBox.max.y + 0.22,
    (room.boundingBox.min.z + room.boundingBox.max.z) / 2,
  ];
}

function deviceCenter(deviceId: string): [number, number, number] | null {
  const device = SMART_DEVICES.find((candidate) => candidate.uniqueId === deviceId);
  if (!device) return null;
  const [x, y, z] = device.placeholder.position;

  return [x, y + 0.32, z];
}

function KnowledgeNode({ index, total, color }: { readonly index: number; readonly total: number; readonly color: string }) {
  const angle = (index / total) * Math.PI * 2;
  const radius = 2.25;
  const position: [number, number, number] = [Math.cos(angle) * radius, Math.sin(index * 0.8) * 0.16, Math.sin(angle) * radius];

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.075, 14, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.34} roughness={0.24} metalness={0.2} />
      </mesh>
    </group>
  );
}

function AiKnowledgeHalo() {
  return (
    <group name="ai-knowledge-graph-halo" position={[0, 7.1, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.25, 0.01, 8, 96]} />
        <meshBasicMaterial color="#72d8ff" transparent opacity={0.32} toneMapped={false} />
      </mesh>
      {AI_KNOWLEDGE_PACKAGES.map((knowledgePackage, index) => (
        <KnowledgeNode
          key={knowledgePackage.id}
          index={index}
          total={AI_KNOWLEDGE_PACKAGES.length}
          color={DOMAIN_COLORS[knowledgePackage.domain] ?? "#ffffff"}
        />
      ))}
    </group>
  );
}

function SelectionBeacon() {
  const kind = useSelectionStore((state) => state.kind);
  const selectedId = useSelectionStore((state) => state.selectedId);
  const meshRef = useRef<Mesh>(null);
  const position = useMemo(() => {
    if (kind === "room" && selectedId) return roomCenter(selectedId);
    if (kind === "device" && selectedId) return deviceCenter(selectedId);
    return null;
  }, [kind, selectedId]);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.18;
    mesh.scale.setScalar(pulse);
  });

  if (!position) return null;

  return (
    <group
      name={`ai-visual-context-${kind}-${selectedId}`}
      position={new Vector3(...position)}
      userData={{
        smartHiveAiAssistant: true,
        visualAi: true,
        voiceReady: true,
        selectedKind: kind,
        selectedId,
      }}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.16, 18, 12]} />
        <meshBasicMaterial color={kind === "room" ? "#f8d88a" : "#72d8ff"} transparent opacity={0.74} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.012, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.58} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function AiAssistantRenderer() {
  return (
    <group name="SmartHive AI Assistant Renderer">
      <AiKnowledgeHalo />
      <SelectionBeacon />
    </group>
  );
}
