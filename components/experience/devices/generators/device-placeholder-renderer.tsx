"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { DEVICE_CATEGORY_COLORS, SMART_DEVICES } from "@/lib/experience/devices/device-catalog";
import type { EventBus } from "@/lib/experience/event-bus";
import { useSelectionStore } from "@/lib/experience/stores";
import type { SmartDeviceCategory, SmartDevicePlaceholder, SmartDeviceSnapshot } from "@/types/experience";

interface DeviceBatch {
  readonly key: string;
  readonly category: SmartDeviceCategory;
  readonly shape: SmartDevicePlaceholder["shape"];
  readonly devices: readonly SmartDeviceSnapshot[];
}

function composeMatrix(device: SmartDeviceSnapshot) {
  const { position, size } = device.placeholder;

  return new Matrix4().compose(
    new Vector3(position[0], position[1], position[2]),
    new Quaternion().setFromEuler(new Euler(0, 0, 0)),
    new Vector3(size[0], size[1], size[2]),
  );
}

function createBatches(devices: readonly SmartDeviceSnapshot[]) {
  const batches = new Map<string, { category: SmartDeviceCategory; shape: SmartDevicePlaceholder["shape"]; devices: SmartDeviceSnapshot[] }>();

  devices.forEach((device) => {
    const key = `${device.category}:${device.placeholder.shape}`;
    const batch = batches.get(key) ?? { category: device.category, shape: device.placeholder.shape, devices: [] };
    batch.devices.push(device);
    batches.set(key, batch);
  });

  return Array.from(batches.entries()).map(([key, batch]) => ({ key, ...batch }));
}

function DeviceGeometry({ shape }: { readonly shape: SmartDevicePlaceholder["shape"] }) {
  if (shape === "disc") return <cylinderGeometry args={[1, 1, 1, 18]} />;
  if (shape === "panel") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "tower") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "cube") return <boxGeometry args={[1, 1, 1]} />;
  return <sphereGeometry args={[1, 12, 8]} />;
}

function DeviceBatchMesh({ batch, eventBus }: { readonly batch: DeviceBatch; readonly eventBus: EventBus }) {
  const meshRef = useRef<InstancedMesh>(null);
  const selectedId = useSelectionStore((state) => (state.kind === "device" ? state.selectedId : null));

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.devices.forEach((device, index) => {
      mesh.setMatrixAt(index, composeMatrix(device));
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [batch]);

  const color = new Color(DEVICE_CATEGORY_COLORS[batch.category]);
  const selectedInBatch = selectedId ? batch.devices.some((device) => device.uniqueId === selectedId) : false;

  return (
    <instancedMesh
      ref={meshRef}
      name={`smart-device-batch-${batch.key}`}
      args={[undefined, undefined, batch.devices.length]}
      castShadow
      receiveShadow
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const device = typeof event.instanceId === "number" ? batch.devices[event.instanceId] : null;
        if (!device) return;
        eventBus.emit("DEVICE_SELECTED", { deviceId: device.uniqueId });
        eventBus.emit("SELECTION_CHANGED", { kind: "device", id: device.uniqueId });
      }}
      userData={{
        batchKey: batch.key,
        category: batch.category,
        shape: batch.shape,
        deviceIds: batch.devices.map((device) => device.uniqueId),
        digitalTwin: true,
        futureModelReady: true,
        automationLogic: "excluded",
        animation: "excluded",
        ai: "excluded",
      }}
    >
      <DeviceGeometry shape={batch.shape} />
      <meshStandardMaterial color={color} roughness={0.34} metalness={0.24} emissive={color} emissiveIntensity={selectedInBatch ? 0.2 : 0.05} />
    </instancedMesh>
  );
}

function SelectedDeviceMarker({ device }: { readonly device: SmartDeviceSnapshot }) {
  const [x, y, z] = device.placeholder.position;

  return (
    <group name={`selected-device-marker-${device.uniqueId}`} position={[x, y + 0.18, z]}>
      <mesh>
        <sphereGeometry args={[0.12, 16, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.72} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.018, 8, 28]} />
        <meshBasicMaterial color="#78d7ff" />
      </mesh>
    </group>
  );
}

export function DevicePlaceholderRenderer({ eventBus }: { readonly eventBus: EventBus }) {
  const selectedId = useSelectionStore((state) => (state.kind === "device" ? state.selectedId : null));
  const selectedDevice = selectedId ? SMART_DEVICES.find((device) => device.uniqueId === selectedId) : null;
  const batches = useMemo(() => createBatches(SMART_DEVICES), []);

  return (
    <group name="SmartHive smart device 3D placeholders">
      {batches.map((batch) => (
        <DeviceBatchMesh key={batch.key} batch={batch} eventBus={eventBus} />
      ))}
      {selectedDevice ? <SelectedDeviceMarker device={selectedDevice} /> : null}
    </group>
  );
}
