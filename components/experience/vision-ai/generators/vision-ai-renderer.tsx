"use client";

import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh } from "three";
import { useRef } from "react";
import { useVisionAiStore } from "@/lib/experience/stores";
import type { VisionCameraDetection, VisionDetectionKind } from "@/types/experience";

const DETECTION_COLORS: Record<VisionDetectionKind, string> = {
  door: "#ffd36e",
  window: "#72d8ff",
  furniture: "#d8b35f",
  "electrical-point": "#8ff0c7",
  lighting: "#fff2cf",
  "camera-location": "#ff6378",
  "sensor-location": "#8fe388",
};

function DetectionMarker({ detection }: { readonly detection: VisionCameraDetection }) {
  const meshRef = useRef<Mesh>(null);
  const [x, y, z] = detection.position;
  const color = DETECTION_COLORS[detection.kind];
  const scale = detection.kind === "camera-location" || detection.kind === "sensor-location" ? 0.18 : 0.11;

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.y = y + Math.sin(clock.elapsedTime * 1.6 + x) * 0.035;
  });

  return (
    <group
      name={`vision-ai-detection-${detection.id}`}
      position={[x, y + 0.12, z]}
      userData={{
        visionAi: true,
        kind: detection.kind,
        label: detection.label,
        confidence: detection.confidence,
        futureModelReady: detection.futureModelReady,
      }}
    >
      <mesh ref={meshRef} castShadow={false} receiveShadow={false}>
        <sphereGeometry args={[scale, 14, 10]} />
        <meshBasicMaterial color={color} transparent opacity={0.82} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[scale * 2.6, 0.01, 8, 36]} />
        <meshBasicMaterial color={color} transparent opacity={0.42} toneMapped={false} />
      </mesh>
    </group>
  );
}

function ScanVolume() {
  const activeAnalysis = useVisionAiStore((state) => state.activeAnalysis);
  const roomDetection = activeAnalysis.cameraDetections.find((detection) => detection.kind === "sensor-location");
  const position = roomDetection?.position ?? ([0, 3.2, 0] as const);

  return (
    <group name={`vision-ai-scan-volume-${activeAnalysis.roomId}`} position={[position[0], position[1] + 0.08, position[2]]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.012, 8, 72]} />
        <meshBasicMaterial color="#72d8ff" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.24, 0.008, 8, 88]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.16} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function VisionAiRenderer() {
  const activeAnalysis = useVisionAiStore((state) => state.activeAnalysis);
  const detections = useMemo(() => activeAnalysis.cameraDetections.slice(0, 48), [activeAnalysis]);

  return (
    <group
      name="SmartHive Vision AI Renderer"
      userData={{
        milestone: 16,
        roomId: activeAnalysis.roomId,
        roomName: activeAnalysis.roomName,
        scanMode: activeAnalysis.scanMode,
        detectionCount: activeAnalysis.cameraDetections.length,
      }}
    >
      <ScanVolume />
      {detections.map((detection) => (
        <DetectionMarker key={detection.id} detection={detection} />
      ))}
    </group>
  );
}
