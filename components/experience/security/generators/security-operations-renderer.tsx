"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { Color, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import {
  SOC_ASSET_COLORS,
  SOC_CAMERA_WALL_TILES,
  SOC_COMMAND_CENTER_STATUS,
  SOC_EVENT_TIMELINE,
  SOC_LIVE_MAP_ASSETS,
  SOC_STATUS_COLORS,
} from "@/lib/experience/security/security-operations-center";
import { useSecurityOperationsStore, useSecurityStore } from "@/lib/experience/stores";
import type { SocLiveMapAsset, SocMapAssetType, SocMapLayer, SocSubsystemStatus } from "@/types/experience";

interface SocMapAssetBatch {
  readonly key: string;
  readonly type: SocMapAssetType;
  readonly layer: SocMapLayer;
  readonly assets: readonly SocLiveMapAsset[];
}

function createAssetBatches(assets: readonly SocLiveMapAsset[]): readonly SocMapAssetBatch[] {
  const batches = new Map<string, { type: SocMapAssetType; layer: SocMapLayer; assets: SocLiveMapAsset[] }>();

  assets.forEach((asset) => {
    const key = `${asset.type}:${asset.layer}`;
    const batch = batches.get(key) ?? { type: asset.type, layer: asset.layer, assets: [] };
    batch.assets.push(asset);
    batches.set(key, batch);
  });

  return Array.from(batches.entries()).map(([key, batch]) => ({ key, ...batch }));
}

function composeAssetMatrix(asset: SocLiveMapAsset) {
  const [x, y, z] = asset.render.position;
  const [sx, sy, sz] = asset.render.size;

  return new Matrix4().compose(new Vector3(x, y + 0.05, z), new Quaternion(), new Vector3(sx, sy, sz));
}

function SocAssetGeometry({ type }: { readonly type: SocMapAssetType }) {
  if (type === "camera") return <boxGeometry args={[1, 0.7, 1]} />;
  if (type === "lock") return <boxGeometry args={[1, 1, 0.7]} />;
  if (type === "alarm") return <cylinderGeometry args={[1, 1, 1, 18]} />;
  return <sphereGeometry args={[1, 14, 10]} />;
}

function SocMapBatchMesh({ batch }: { readonly batch: SocMapAssetBatch }) {
  const meshRef = useRef<InstancedMesh>(null);
  const visibleLayers = useSecurityOperationsStore((state) => state.visibleLayers);
  const selectedMapAssetId = useSecurityOperationsStore((state) => state.selectedMapAssetId);
  const selectMapAsset = useSecurityOperationsStore((state) => state.selectMapAsset);
  const selectCamera = useSecurityOperationsStore((state) => state.selectCamera);
  const selectSecurityDevice = useSecurityStore((state) => state.selectSecurityDevice);
  const visible = visibleLayers[batch.layer];
  const selectedInBatch = selectedMapAssetId ? batch.assets.some((asset) => asset.id === selectedMapAssetId) : false;

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.assets.forEach((asset, index) => {
      mesh.setMatrixAt(index, composeAssetMatrix(asset));
      mesh.setColorAt(index, new Color(asset.render.color));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [batch]);

  return (
    <instancedMesh
      ref={meshRef}
      name={`soc-live-map-${batch.key}`}
      args={[undefined, undefined, batch.assets.length]}
      visible={visible}
      castShadow={false}
      receiveShadow={false}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const asset = typeof event.instanceId === "number" ? batch.assets[event.instanceId] : null;
        if (!asset) return;
        selectMapAsset(asset.id);
        selectSecurityDevice(asset.sourceDeviceId);
        if (asset.type === "camera") selectCamera(asset.sourceDeviceId);
      }}
      userData={{
        securityOperationsCenter: true,
        layer: batch.layer,
        type: batch.type,
        assetIds: batch.assets.map((asset) => asset.id),
      }}
    >
      <SocAssetGeometry type={batch.type} />
      <meshStandardMaterial
        vertexColors
        color="#ffffff"
        roughness={0.26}
        metalness={batch.type === "lock" ? 0.48 : 0.2}
        emissive={SOC_ASSET_COLORS[batch.type]}
        emissiveIntensity={selectedInBatch ? 0.45 : 0.18}
      />
    </instancedMesh>
  );
}

function SocCoverageRings() {
  const visibleLayers = useSecurityOperationsStore((state) => state.visibleLayers);

  return (
    <group name="soc-live-map-coverage">
      {SOC_LIVE_MAP_ASSETS.map((asset) => {
        if (!visibleLayers[asset.layer]) return null;
        const [x, , z] = asset.render.position;
        const radius = Math.min(9.5, Math.max(0.7, asset.coverageMeters));

        return (
          <mesh
            key={asset.id}
            name={`soc-coverage-${asset.id}`}
            position={[x, 0.2, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            userData={{
              assetId: asset.id,
              sourceDeviceId: asset.sourceDeviceId,
              status: asset.status,
              layer: asset.layer,
            }}
          >
            <circleGeometry args={[radius, 24]} />
            <meshBasicMaterial color={asset.render.color} transparent opacity={asset.type === "camera" ? 0.08 : 0.045} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}

function CameraWall() {
  const selectedCameraId = useSecurityOperationsStore((state) => state.selectedCameraId);
  const selectCamera = useSecurityOperationsStore((state) => state.selectCamera);
  const selectSecurityDevice = useSecurityStore((state) => state.selectSecurityDevice);
  const tiles = SOC_CAMERA_WALL_TILES.slice(0, 16);
  const columns = 4;

  return (
    <group name="soc-camera-wall" position={[-8.6, 5.4, 9.6]} rotation={[0, 0.34, 0]}>
      <mesh position={[1.12, -0.62, -0.04]}>
        <boxGeometry args={[3.1, 2.1, 0.04]} />
        <meshStandardMaterial color="#05070b" roughness={0.42} metalness={0.36} emissive="#0f2434" emissiveIntensity={0.28} />
      </mesh>
      {tiles.map((tile, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const selected = tile.cameraId === selectedCameraId;
        const statusColor = SOC_STATUS_COLORS[tile.status];

        return (
          <group key={tile.id} position={[column * 0.74, -row * 0.44, 0]}>
            <mesh
              name={`soc-camera-wall-tile-${tile.cameraId}`}
              onClick={(event: ThreeEvent<MouseEvent>) => {
                event.stopPropagation();
                selectCamera(tile.cameraId);
                selectSecurityDevice(tile.cameraId);
              }}
              userData={{
                cameraId: tile.cameraId,
                playback: tile.playbackAvailable,
                snapshot: tile.snapshotAvailable,
                timeline: tile.timelineAvailable,
                bookmarks: tile.bookmarkIds.length,
              }}
            >
              <boxGeometry args={[0.62, 0.34, 0.035]} />
              <meshStandardMaterial color={selected ? "#eaf8ff" : "#102434"} roughness={0.32} metalness={0.22} emissive={statusColor} emissiveIntensity={selected ? 0.42 : 0.18} />
            </mesh>
            <mesh position={[-0.25, -0.12, 0.03]}>
              <sphereGeometry args={[0.025, 8, 6]} />
              <meshBasicMaterial color={statusColor} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function StatusBoard() {
  const statuses = Object.values(SOC_COMMAND_CENTER_STATUS) as readonly SocSubsystemStatus[];

  return (
    <group name="soc-status-board" position={[6.4, 3.8, 8.4]} rotation={[0, -0.42, 0]}>
      {statuses.map((status, index) => (
        <group key={status.id} position={[0, -index * 0.28, 0]}>
          <mesh>
            <boxGeometry args={[1.28, 0.18, 0.035]} />
            <meshStandardMaterial color="#061018" roughness={0.34} metalness={0.28} emissive={SOC_STATUS_COLORS[status.status]} emissiveIntensity={0.16} />
          </mesh>
          <mesh position={[-0.52, 0, 0.035]}>
            <sphereGeometry args={[0.045, 12, 8]} />
            <meshBasicMaterial color={SOC_STATUS_COLORS[status.status]} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function IncidentPulse({ position, severity, offset }: { readonly position: readonly [number, number, number]; readonly severity: "info" | "warning" | "critical"; readonly offset: number }) {
  const meshRef = useRef<Mesh>(null);
  const color = severity === "critical" ? "#ff6378" : severity === "warning" ? "#ffd36e" : "#72d8ff";

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.2 + offset) * 0.28;
    mesh.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef} position={[position[0], position[1] + 0.32, position[2]]}>
      <sphereGeometry args={[0.105, 14, 10]} />
      <meshBasicMaterial color={color} transparent opacity={0.84} toneMapped={false} />
    </mesh>
  );
}

function IncidentTimelinePulses() {
  const assetByDeviceId = useMemo(() => new Map(SOC_LIVE_MAP_ASSETS.map((asset) => [asset.sourceDeviceId, asset])), []);

  return (
    <group name="soc-incident-pulses">
      {SOC_EVENT_TIMELINE.slice(0, 22).map((event, index) => {
        const asset = assetByDeviceId.get(event.sourceDeviceId);
        const position = asset?.render.position ?? ([4.15, 1.65, -3.1] as const);

        return (
          <group
            key={event.id}
            userData={{
              eventId: event.id,
              incidentId: event.incidentId,
              severity: event.severity,
              type: event.type,
              everyEventBecomesIncident: true,
            }}
          >
            <IncidentPulse position={position} severity={event.severity} offset={index * 0.37} />
          </group>
        );
      })}
    </group>
  );
}

export function SecurityOperationsRenderer() {
  const batches = useMemo(() => createAssetBatches(SOC_LIVE_MAP_ASSETS), []);

  return (
    <group name="SmartHive Security Operations Center Renderer">
      <SocCoverageRings />
      {batches.map((batch) => (
        <SocMapBatchMesh key={batch.key} batch={batch} />
      ))}
      <CameraWall />
      <StatusBoard />
      <IncidentTimelinePulses />
    </group>
  );
}
