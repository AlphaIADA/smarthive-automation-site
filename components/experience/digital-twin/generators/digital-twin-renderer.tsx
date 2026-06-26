"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, InstancedMesh, Matrix4, Mesh, Quaternion, Vector3 } from "three";
import { TWIN_OBJECT_GRAPH } from "@/lib/experience/digital-twin/twin-registry";
import { useDigitalTwinStore } from "@/lib/experience/stores";
import type { TwinEntity, TwinEntityKind } from "@/types/experience";

const TWIN_KIND_COLORS: Record<TwinEntityKind, string> = {
  building: "#ffffff",
  floor: "#d8e5f1",
  room: "#f8d88a",
  zone: "#d4c1ff",
  device: "#72d8ff",
  furniture: "#d8b35f",
  "power-source": "#8ff0c7",
  sensor: "#8fe388",
  "hvac-unit": "#70c2ff",
  "lighting-group": "#fff2cf",
  "security-system": "#ff6378",
  "automation-rule": "#b48cff",
  scene: "#f4d4ff",
  quote: "#ffd36e",
  project: "#cdd5df",
  customer: "#ffc778",
};

interface TwinBatch {
  readonly key: string;
  readonly kind: TwinEntityKind;
  readonly entities: readonly TwinEntity[];
}

function createTwinBatches(entities: readonly TwinEntity[]): readonly TwinBatch[] {
  const batches = new Map<TwinEntityKind, TwinEntity[]>();

  entities.forEach((entity) => {
    const batch = batches.get(entity.kind) ?? [];
    batch.push(entity);
    batches.set(entity.kind, batch);
  });

  return Array.from(batches.entries()).map(([kind, batchEntities]) => ({ key: `dtie-${kind}`, kind, entities: batchEntities }));
}

function displayPosition(entity: TwinEntity): [number, number, number] {
  const [x, y, z] = entity.transform.position;
  if (entity.kind === "quote" || entity.kind === "project" || entity.kind === "customer" || entity.kind === "automation-rule" || entity.kind === "scene" || entity.kind === "lighting-group" || entity.kind === "zone") {
    return [x, y, z];
  }

  return [x, y + 0.16, z];
}

function entityScale(entity: TwinEntity): [number, number, number] {
  if (entity.kind === "building") return [0.42, 0.42, 0.42];
  if (entity.kind === "floor") return [0.24, 0.24, 0.24];
  if (entity.kind === "room") return [0.12, 0.12, 0.12];
  if (entity.kind === "furniture") return [0.07, 0.07, 0.07];
  return [0.1, 0.1, 0.1];
}

function composeEntityMatrix(entity: TwinEntity) {
  const [x, y, z] = displayPosition(entity);
  const [sx, sy, sz] = entityScale(entity);

  return new Matrix4().compose(new Vector3(x, y, z), new Quaternion(), new Vector3(sx, sy, sz));
}

function TwinBatchMesh({ batch }: { readonly batch: TwinBatch }) {
  const meshRef = useRef<InstancedMesh>(null);
  const selectedTwinUuid = useDigitalTwinStore((state) => state.selectedTwinUuid);
  const selectTwinEntity = useDigitalTwinStore((state) => state.selectTwinEntity);
  const selectedInBatch = batch.entities.some((entity) => entity.uuid === selectedTwinUuid);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.entities.forEach((entity, index) => {
      mesh.setMatrixAt(index, composeEntityMatrix(entity));
      mesh.setColorAt(index, new Color(TWIN_KIND_COLORS[entity.kind]));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [batch]);

  return (
    <instancedMesh
      ref={meshRef}
      name={`dtie-entity-batch-${batch.kind}`}
      args={[undefined, undefined, batch.entities.length]}
      castShadow={false}
      receiveShadow={false}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const entity = typeof event.instanceId === "number" ? batch.entities[event.instanceId] : null;
        if (entity) selectTwinEntity(entity.uuid);
      }}
      userData={{
        dtie: true,
        kind: batch.kind,
        entityCount: batch.entities.length,
        entityUuids: batch.entities.map((entity) => entity.uuid),
      }}
    >
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial
        vertexColors
        color={TWIN_KIND_COLORS[batch.kind]}
        roughness={0.28}
        metalness={0.18}
        emissive={TWIN_KIND_COLORS[batch.kind]}
        emissiveIntensity={selectedInBatch ? 0.5 : 0.16}
      />
    </instancedMesh>
  );
}

function SelectedTwinMarker() {
  const meshRef = useRef<Mesh>(null);
  const selectedTwinUuid = useDigitalTwinStore((state) => state.selectedTwinUuid);
  const entity = TWIN_OBJECT_GRAPH.entities.find((candidate) => candidate.uuid === selectedTwinUuid);

  if (!entity) return null;

  const [x, y, z] = displayPosition(entity);
  const color = TWIN_KIND_COLORS[entity.kind];

  return (
    <group
      name={`dtie-selected-${entity.stableId}`}
      position={[x, y + 0.22, z]}
      userData={{
        twinUuid: entity.uuid,
        stableId: entity.stableId,
        state: entity.state,
        health: entity.health,
      }}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.16, 18, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.82} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.012, 8, 48]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.62} toneMapped={false} />
      </mesh>
    </group>
  );
}

function TwinGraphRootHalo() {
  return (
    <group name="dtie-root-graph-halo" position={[0, 8.25, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.1, 0.012, 8, 120]} />
        <meshBasicMaterial color="#8ff0c7" transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.35, 0.008, 8, 96]} />
        <meshBasicMaterial color="#72d8ff" transparent opacity={0.22} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function DigitalTwinRenderer() {
  const batches = useMemo(() => createTwinBatches(TWIN_OBJECT_GRAPH.entities), []);

  return (
    <group name="SmartHive Digital Twin Intelligence Renderer">
      <TwinGraphRootHalo />
      {batches.map((batch) => (
        <TwinBatchMesh key={batch.key} batch={batch} />
      ))}
      <SelectedTwinMarker />
    </group>
  );
}
