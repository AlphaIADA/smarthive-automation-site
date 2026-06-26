"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { IMMERSIVE_COLLISION_VOLUMES, getMovementProfile } from "@/lib/experience/immersive";
import { useImmersiveWalkStore } from "@/lib/experience/stores";
import type { ImmersiveMode, ImmersivePose } from "@/types/experience";

const MOVE_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyQ", "KeyE", "ShiftLeft", "ShiftRight"]);

function targetFromPosition(position: Vector3, yaw: number, pitch: number) {
  const direction = new Vector3(Math.sin(yaw), Math.sin(pitch), -Math.cos(yaw)).normalize();
  return position.clone().add(direction.multiplyScalar(3));
}

function collides(position: Vector3, mode: ImmersiveMode) {
  if (mode === "fly" || mode === "vr-ready") {
    return IMMERSIVE_COLLISION_VOLUMES.some((volume) => {
      if (!volume.active || !volume.blocksFly) return false;
      const [x, y, z] = volume.position;
      const [sx, sy, sz] = volume.size;
      return Math.abs(position.x - x) <= sx / 2 + 0.22 && Math.abs(position.y - y) <= sy / 2 + 0.35 && Math.abs(position.z - z) <= sz / 2 + 0.22;
    });
  }

  return IMMERSIVE_COLLISION_VOLUMES.some((volume) => {
    if (!volume.active || !volume.blocksWalk) return false;
    const [x, y, z] = volume.position;
    const [sx, sy, sz] = volume.size;
    return Math.abs(position.x - x) <= sx / 2 + 0.28 && Math.abs(position.y - y) <= sy / 2 + 0.45 && Math.abs(position.z - z) <= sz / 2 + 0.28;
  });
}

function vectorFromPose(pose: ImmersivePose) {
  return new Vector3(pose.position.x, pose.position.y, pose.position.z);
}

export function ImmersiveCameraController() {
  const camera = useThree((state) => state.camera);
  const keys = useRef(new Set<string>());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const lastMode = useRef<ImmersiveMode>("orbit");
  const frameCount = useRef(0);
  const mode = useImmersiveWalkStore((state) => state.mode);
  const pose = useImmersiveWalkStore((state) => state.pose);
  const updatePose = useImmersiveWalkStore((state) => state.updatePose);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!MOVE_KEYS.has(event.code)) return;
      keys.current.add(event.code);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      keys.current.delete(event.code);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    yaw.current = pose.yaw;
    pitch.current = pose.pitch;
  }, [pose.pitch, pose.yaw]);

  useFrame(({ clock }, delta) => {
    if (mode === "orbit") {
      lastMode.current = mode;
      return;
    }

    const profile = getMovementProfile(mode);
    const targetPose = vectorFromPose(pose);
    const current = camera.position.clone();

    if (lastMode.current !== mode || mode === "guided-tour") {
      current.lerp(targetPose, Math.min(1, delta * 2.4));
      camera.position.copy(current);
      camera.lookAt(pose.target.x, pose.target.y, pose.target.z);
      lastMode.current = mode;
      return;
    }

    if (keys.current.has("ArrowLeft")) yaw.current += delta * 1.5;
    if (keys.current.has("ArrowRight")) yaw.current -= delta * 1.5;
    if (keys.current.has("ArrowUp")) pitch.current = Math.min(0.85, pitch.current + delta * 0.9);
    if (keys.current.has("ArrowDown")) pitch.current = Math.max(-0.55, pitch.current - delta * 0.9);

    const forward = new Vector3(Math.sin(yaw.current), 0, -Math.cos(yaw.current)).normalize();
    const right = new Vector3(forward.z, 0, -forward.x).normalize();
    const movement = new Vector3();
    const speed = profile.speedMetersPerSecond * (keys.current.has("ShiftLeft") || keys.current.has("ShiftRight") ? 1.8 : 1);

    if (keys.current.has("KeyW")) movement.add(forward);
    if (keys.current.has("KeyS")) movement.sub(forward);
    if (keys.current.has("KeyD")) movement.add(right);
    if (keys.current.has("KeyA")) movement.sub(right);
    if ((mode === "fly" || mode === "vr-ready") && keys.current.has("KeyE")) movement.y += profile.verticalSpeedMetersPerSecond / Math.max(speed, 0.1);
    if ((mode === "fly" || mode === "vr-ready") && keys.current.has("KeyQ")) movement.y -= profile.verticalSpeedMetersPerSecond / Math.max(speed, 0.1);

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(speed * delta);
      const nextPosition = camera.position.clone().add(movement);
      if (!profile.collision || !collides(nextPosition, mode)) camera.position.copy(nextPosition);
    } else {
      camera.position.lerp(targetPose, Math.min(1, delta * 0.7));
    }

    const headBob = profile.headBob && movement.lengthSq() > 0 ? Math.sin(clock.elapsedTime * 9) * 0.035 : 0;
    const lookTarget = targetFromPosition(camera.position.clone().setY(camera.position.y + headBob), yaw.current, pitch.current);
    camera.lookAt(lookTarget);

    frameCount.current += 1;
    if (frameCount.current % 18 === 0) {
      updatePose({
        position: { x: Number(camera.position.x.toFixed(2)), y: Number(camera.position.y.toFixed(2)), z: Number(camera.position.z.toFixed(2)) },
        target: { x: Number(lookTarget.x.toFixed(2)), y: Number(lookTarget.y.toFixed(2)), z: Number(lookTarget.z.toFixed(2)) },
        yaw: Number(yaw.current.toFixed(3)),
        pitch: Number(pitch.current.toFixed(3)),
      });
    }
  });

  return null;
}
