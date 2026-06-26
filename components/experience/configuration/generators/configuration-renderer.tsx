"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Color, InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import {
  CONFIGURATION_CATEGORY_COLORS,
  CONFIGURATION_ITEMS,
} from "@/lib/experience/configuration/configuration-catalog";
import type { EventBus } from "@/lib/experience/event-bus";
import { useConfigurationStore } from "@/lib/experience/stores";
import type { ConfigurationCategory, ConfigurationItem } from "@/types/experience";

interface ConfigurationBatch {
  readonly key: string;
  readonly category: ConfigurationCategory;
  readonly items: readonly ConfigurationItem[];
}

function createBatches(items: readonly ConfigurationItem[]): readonly ConfigurationBatch[] {
  const batches = new Map<ConfigurationCategory, ConfigurationItem[]>();

  items.forEach((item) => {
    if (!item.render) return;
    const batch = batches.get(item.category) ?? [];
    batch.push(item);
    batches.set(item.category, batch);
  });

  return Array.from(batches.entries()).map(([category, batchItems]) => ({
    key: `configuration-${category}`,
    category,
    items: batchItems,
  }));
}

function composeMatrix(item: ConfigurationItem) {
  const render = item.render;
  if (!render) return new Matrix4();

  return new Matrix4().compose(
    new Vector3(render.position[0], render.position[1] + 0.08, render.position[2]),
    new Quaternion(),
    new Vector3(render.size[0], render.size[1], render.size[2]),
  );
}

function ConfigurationBatchMesh({ batch, eventBus }: { readonly batch: ConfigurationBatch; readonly eventBus: EventBus }) {
  const meshRef = useRef<InstancedMesh>(null);
  const selectedItemIds = useConfigurationStore((state) => state.selectedItemIds);
  const activeCategory = useConfigurationStore((state) => state.activeCategory);
  const selectedConfigurationItemId = useConfigurationStore((state) => state.selectedConfigurationItemId);
  const toggleItem = useConfigurationStore((state) => state.toggleItem);
  const selectItem = useConfigurationStore((state) => state.selectItem);
  const visible = activeCategory === "all" || activeCategory === batch.category;
  const selectedSet = useMemo(() => new Set(selectedItemIds), [selectedItemIds]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.items.forEach((item, index) => {
      mesh.setMatrixAt(index, composeMatrix(item));
      const selected = selectedSet.has(item.id);
      mesh.setColorAt(index, new Color(selected ? item.render?.color ?? CONFIGURATION_CATEGORY_COLORS[item.category] : "#ffffff"));
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [batch, selectedSet]);

  return (
    <instancedMesh
      ref={meshRef}
      name={`customer-configurator-hotspots-${batch.category}`}
      args={[undefined, undefined, batch.items.length]}
      visible={visible}
      castShadow={false}
      receiveShadow={false}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const item = typeof event.instanceId === "number" ? batch.items[event.instanceId] : null;
        if (!item) return;
        toggleItem(item.id);
        selectItem(item.id);
        if (item.source === "smart-device") {
          eventBus.emit("DEVICE_SELECTED", { deviceId: item.sourceId });
          eventBus.emit("SELECTION_CHANGED", { kind: "device", id: item.sourceId });
        }
      }}
      userData={{
        customerConfigurator: true,
        category: batch.category,
        itemIds: batch.items.map((item) => item.id),
      }}
    >
      <sphereGeometry args={[1, 14, 10]} />
      <meshStandardMaterial
        vertexColors
        color={CONFIGURATION_CATEGORY_COLORS[batch.category]}
        roughness={0.26}
        metalness={0.18}
        emissive={CONFIGURATION_CATEGORY_COLORS[batch.category]}
        emissiveIntensity={selectedConfigurationItemId && batch.items.some((item) => item.id === selectedConfigurationItemId) ? 0.42 : 0.18}
      />
    </instancedMesh>
  );
}

export function ConfigurationRenderer({ eventBus }: { readonly eventBus: EventBus }) {
  const batches = useMemo(() => createBatches(CONFIGURATION_ITEMS), []);

  return (
    <group name="SmartHive Customer Configuration Hotspots">
      {batches.map((batch) => (
        <ConfigurationBatchMesh key={batch.key} batch={batch} eventBus={eventBus} />
      ))}
    </group>
  );
}
