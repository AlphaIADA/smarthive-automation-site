"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { EventBus } from "@/lib/experience/event-bus";

interface BrowserPerformanceMemory {
  readonly usedJSHeapSize: number;
}

type PerformanceWithMemory = Performance & {
  readonly memory?: BrowserPerformanceMemory;
};

export function PerformanceProbe({ eventBus }: { eventBus: EventBus }) {
  const elapsed = useRef(0);
  const frames = useRef(0);

  useFrame(({ camera, gl, scene }, delta) => {
    elapsed.current += delta;
    frames.current += 1;
    if (elapsed.current < 0.5) return;

    let sceneObjects = 0;
    scene.traverse(() => {
      sceneObjects += 1;
    });
    const browserPerformance = performance as PerformanceWithMemory;
    const memoryMb = browserPerformance.memory
      ? browserPerformance.memory.usedJSHeapSize / 1024 / 1024
      : null;

    eventBus.emit("PERFORMANCE_UPDATED", {
      fps: Math.round(frames.current / elapsed.current),
      memoryMb,
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      sceneObjects,
      textures: gl.info.memory.textures,
      geometries: gl.info.memory.geometries,
      cameraPosition: {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      },
    });
    elapsed.current = 0;
    frames.current = 0;
  });

  return null;
}
