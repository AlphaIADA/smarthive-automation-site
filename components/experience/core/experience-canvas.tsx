"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { EventBus } from "@/lib/experience/event-bus";
import { useSettingsStore } from "@/lib/experience/stores";
import { FoundationScene } from "@/components/experience/scene/foundation-scene";
import styles from "@/styles/experience/experience.module.css";

export function ExperienceCanvas({ eventBus }: { eventBus: EventBus }) {
  const pixelRatio = useSettingsStore((state) => state.pixelRatio);

  return (
    <div className={styles.canvas} aria-label="SmartHive 3D experience canvas">
      <Canvas
        shadows
        dpr={[1, pixelRatio]}
        camera={{ position: [9, 7, 11], fov: 42, near: 0.1, far: 120 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        fallback={<div className="grid h-full place-items-center bg-slate-950 text-white">WebGL is unavailable.</div>}
      >
        <Suspense fallback={null}>
          <FoundationScene eventBus={eventBus} />
        </Suspense>
      </Canvas>
    </div>
  );
}
