"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getCameraPreset } from "@/lib/experience/camera-presets";
import { useCameraStore, useSettingsStore } from "@/lib/experience/stores";

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const animating = useRef(false);
  const presetId = useCameraStore((state) => state.preset);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const camera = useThree((state) => state.camera);
  const [spring, api] = useSpring(() => ({
    px: camera.position.x,
    py: camera.position.y,
    pz: camera.position.z,
    tx: 0,
    ty: 0,
    tz: 0,
  }));

  useEffect(() => {
    const preset = getCameraPreset(presetId);
    if (!preset.enabled) return;
    animating.current = true;
    void api.start({
      px: preset.position.x,
      py: preset.position.y,
      pz: preset.position.z,
      tx: preset.target.x,
      ty: preset.target.y,
      tz: preset.target.z,
      immediate: reducedMotion,
      config: { mass: 1, tension: 170, friction: 28 },
      onRest: () => {
        animating.current = false;
      },
    });
  }, [api, presetId, reducedMotion]);

  useFrame(() => {
    if (!animating.current || !controls.current) return;
    camera.position.set(spring.px.get(), spring.py.get(), spring.pz.get());
    controls.current.target.set(spring.tx.get(), spring.ty.get(), spring.tz.get());
    controls.current.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={4}
      maxDistance={28}
      maxPolarAngle={Math.PI / 2.04}
    />
  );
}
