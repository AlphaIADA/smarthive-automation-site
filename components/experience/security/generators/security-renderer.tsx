"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { SECURITY_CAMERAS, SECURITY_DEVICE_COLORS, SECURITY_DEVICES } from "@/lib/experience/security/security-catalog";
import { useSecurityStore } from "@/lib/experience/stores";
import type { SecurityDeviceCategory, SecurityDeviceSpec, SecurityPlaceholderShape } from "@/types/experience";

interface SecurityBatch {
  readonly key: string;
  readonly shape: SecurityPlaceholderShape;
  readonly type: SecurityDeviceSpec["type"];
  readonly category: SecurityDeviceCategory;
  readonly devices: readonly SecurityDeviceSpec[];
}

function composeDeviceMatrix(device: SecurityDeviceSpec) {
  const { position, rotation, size } = device.render;

  return new Matrix4().compose(
    new Vector3(position[0], position[1], position[2]),
    new Quaternion().setFromEuler(new Euler(rotation?.[0] ?? 0, rotation?.[1] ?? 0, rotation?.[2] ?? 0)),
    new Vector3(size[0], size[1], size[2]),
  );
}

function createSecurityBatches(devices: readonly SecurityDeviceSpec[]): readonly SecurityBatch[] {
  const batches = new Map<string, { shape: SecurityPlaceholderShape; type: SecurityDeviceSpec["type"]; category: SecurityDeviceCategory; devices: SecurityDeviceSpec[] }>();

  devices.forEach((device) => {
    const key = `${device.render.shape}:${device.type}:${device.category}`;
    const batch = batches.get(key) ?? { shape: device.render.shape, type: device.type, category: device.category, devices: [] };
    batch.devices.push(device);
    batches.set(key, batch);
  });

  return Array.from(batches.entries()).map(([key, batch]) => ({ key, ...batch }));
}

function SecurityGeometry({ shape }: { readonly shape: SecurityPlaceholderShape }) {
  if (shape === "camera") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "sensor") return <sphereGeometry args={[1, 14, 10]} />;
  if (shape === "lock") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "siren") return <cylinderGeometry args={[1, 1, 1, 16]} />;
  if (shape === "button") return <cylinderGeometry args={[1, 1, 1, 18]} />;
  return <boxGeometry args={[1, 1, 1]} />;
}

function shouldShowBatch(category: SecurityDeviceCategory, visibleLayers: Readonly<Record<"sensors" | "camera-coverage" | "locks", boolean>>) {
  if (category === "sensor" || category === "alarm") return visibleLayers.sensors;
  if (category === "access-control") return visibleLayers.locks;
  return true;
}

function SecurityBatchMesh({ batch }: { readonly batch: SecurityBatch }) {
  const meshRef = useRef<InstancedMesh>(null);
  const selectedSecurityDeviceId = useSecurityStore((state) => state.selectedSecurityDeviceId);
  const selectSecurityDevice = useSecurityStore((state) => state.selectSecurityDevice);
  const visibleLayers = useSecurityStore((state) => state.visibleLayers);
  const visible = shouldShowBatch(batch.category, visibleLayers);
  const selectedInBatch = selectedSecurityDeviceId ? batch.devices.some((device) => device.id === selectedSecurityDeviceId) : false;
  const color = new Color(SECURITY_DEVICE_COLORS[batch.type]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.devices.forEach((device, index) => {
      mesh.setMatrixAt(index, composeDeviceMatrix(device));
      mesh.setColorAt(index, new Color(device.render.color));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [batch]);

  return (
    <instancedMesh
      ref={meshRef}
      name={`security-device-batch-${batch.key}`}
      args={[undefined, undefined, batch.devices.length]}
      visible={visible}
      castShadow={batch.category !== "sensor"}
      receiveShadow
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const device = typeof event.instanceId === "number" ? batch.devices[event.instanceId] : null;
        if (device) selectSecurityDevice(device.id);
      }}
      userData={{
        batchKey: batch.key,
        securityPlatform: true,
        deviceType: batch.type,
        category: batch.category,
        deviceIds: batch.devices.map((device) => device.id),
        aiAnalysis: false,
        automationRules: false,
        voiceCommands: false,
      }}
    >
      <SecurityGeometry shape={batch.shape} />
      <meshStandardMaterial
        vertexColors
        color="#ffffff"
        roughness={0.3}
        metalness={batch.category === "access-control" ? 0.52 : 0.22}
        emissive={color}
        emissiveIntensity={selectedInBatch ? 0.42 : 0.16}
      />
    </instancedMesh>
  );
}

function CameraCoverageMap() {
  const visible = useSecurityStore((state) => state.visibleLayers["camera-coverage"]);
  if (!visible) return null;

  return (
    <group name="security-camera-coverage-map">
      {SECURITY_CAMERAS.slice(0, 36).map((camera) => {
        const origin = camera.coverage.origin;
        const target = camera.coverage.target;
        const yaw = Math.atan2(target[0] - origin[0], target[2] - origin[2]);
        const fovRadians = (camera.coverage.horizontalFovDegrees * Math.PI) / 180;
        const radius = Math.min(13, Math.max(2.5, camera.coverage.distanceMeters));

        return (
          <mesh
            key={camera.id}
            name={`camera-coverage-${camera.id}`}
            position={[origin[0], 0.16, origin[2]]}
            rotation={[-Math.PI / 2, 0, yaw - fovRadians / 2]}
            userData={{
              cameraId: camera.id,
              fieldOfView: camera.fovDegrees,
              zoom: camera.zoom,
              nightVision: camera.nightVision,
              recordingStatus: camera.recordingStatus,
            }}
          >
            <circleGeometry args={[radius, 28, 0, fovRadians]} />
            <meshBasicMaterial color={camera.type === "ptz-camera" ? "#9ef6ff" : "#5fb8ff"} transparent opacity={camera.type === "ptz-camera" ? 0.16 : 0.11} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function SelectedSecurityMarker() {
  const selectedSecurityDeviceId = useSecurityStore((state) => state.selectedSecurityDeviceId);
  const device = selectedSecurityDeviceId ? SECURITY_DEVICES.find((candidate) => candidate.id === selectedSecurityDeviceId) : null;
  if (!device) return null;

  const [x, y, z] = device.render.position;

  return (
    <group name={`selected-security-marker-${device.id}`} position={[x, y + 0.18, z]}>
      <mesh>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.82} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.25, 0.016, 8, 32]} />
        <meshBasicMaterial color="#ff6378" toneMapped={false} />
      </mesh>
    </group>
  );
}

export function SecurityRenderer() {
  const batches = useMemo(() => createSecurityBatches(SECURITY_DEVICES), []);

  return (
    <group name="SmartHive Security Map">
      <CameraCoverageMap />
      {batches.map((batch) => (
        <SecurityBatchMesh key={batch.key} batch={batch} />
      ))}
      <SelectedSecurityMarker />
    </group>
  );
}
