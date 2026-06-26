"use client";

import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { getCameraPreset } from "@/lib/experience/camera-presets";
import { useCameraStore, useImmersiveWalkStore, useSettingsStore } from "@/lib/experience/stores";

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const animating = useRef(false);
  const presetId = useCameraStore((state) => state.preset);
  const focus = useCameraStore((state) => state.focus);
  const immersiveMode = useImmersiveWalkStore((state) => state.mode);
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
    if (!focus && !preset.enabled) return;
    const position = focus?.position ?? preset.position;
    const target = focus?.target ?? preset.target;
    animating.current = true;
    void api.start({
      px: position.x,
      py: position.y,
      pz: position.z,
      tx: target.x,
      ty: target.y,
      tz: target.z,
      immediate: reducedMotion,
      config: { mass: 1, tension: 170, friction: 28 },
      onRest: () => {
        animating.current = false;
      },
    });
  }, [api, focus, presetId, reducedMotion]);

  useFrame(() => {
    if (immersiveMode !== "orbit" || !animating.current || !controls.current) return;
    camera.position.set(spring.px.get(), spring.py.get(), spring.pz.get());
    controls.current.target.set(spring.tx.get(), spring.ty.get(), spring.tz.get());
    controls.current.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={immersiveMode === "orbit"}
      enableDamping
      dampingFactor={0.08}
      minDistance={3.5}
      maxDistance={72}
      maxPolarAngle={Math.PI / 2.04}
    />
  );
}
