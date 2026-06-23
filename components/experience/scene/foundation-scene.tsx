"use client";

import { Environment, Lightformer, Sky, SoftShadows } from "@react-three/drei";
import type { EventBus } from "@/lib/experience/event-bus";
import { useSettingsStore } from "@/lib/experience/stores";
import { CameraRig } from "./camera-rig";
import { PerformanceProbe } from "./performance-probe";

export function FoundationScene({ eventBus }: { eventBus: EventBus }) {
  const shadows = useSettingsStore((state) => state.shadows);

  return (
    <>
      <color attach="background" args={["#a8c3d6"]} />
      <fog attach="fog" args={["#a8c3d6", 24, 54]} />
      <Sky distance={450000} sunPosition={[8, 6, 4]} turbidity={7} rayleigh={1.6} />
      <Environment resolution={128} background={false}>
        <Lightformer intensity={1.8} position={[0, 8, -4]} scale={[12, 4, 1]} />
        <Lightformer intensity={0.9} position={[-8, 3, 2]} scale={[5, 5, 1]} />
        <Lightformer intensity={0.7} position={[8, 2, 1]} scale={[4, 6, 1]} />
      </Environment>
      <ambientLight intensity={0.48} />
      <directionalLight
        castShadow={shadows}
        color="#fff5df"
        intensity={2.2}
        position={[8, 12, 6]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      {shadows ? <SoftShadows size={18} samples={12} focus={0.45} /> : null}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#8f969c" roughness={0.92} metalness={0.02} />
      </mesh>
      <CameraRig />
      <PerformanceProbe eventBus={eventBus} />
    </>
  );
}
