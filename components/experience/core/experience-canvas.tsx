"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import type { EventBus } from "@/lib/experience/event-bus";
import { useSettingsStore } from "@/lib/experience/stores";
import { SignatureVillaScene } from "@/components/experience/scene/signature-villa-scene";
import styles from "@/styles/experience/experience.module.css";

export function ExperienceCanvas({ eventBus }: { eventBus: EventBus }) {
  const pixelRatio = useSettingsStore((state) => state.pixelRatio);

  return (
    <div className={styles.canvas} aria-label="SmartHive 3D experience canvas">
      <Canvas
        shadows
        dpr={[1, pixelRatio]}
        camera={{ position: [-6, 6.8, 32], fov: 38, near: 0.1, far: 160 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
          gl.shadowMap.enabled = true;
        }}
        fallback={<div className="grid h-full place-items-center bg-slate-950 text-white">WebGL is unavailable.</div>}
      >
        <Suspense fallback={null}>
          <SignatureVillaScene eventBus={eventBus} />
        </Suspense>
      </Canvas>
    </div>
  );
}
