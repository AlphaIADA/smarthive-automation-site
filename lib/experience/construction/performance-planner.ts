import type { ConstructionBuildingOutput, ConstructionComponentNode } from "@/types/experience";
import { flattenConstructionComponents } from "./component-registry";

export interface ConstructionInstanceBatch {
  readonly key: string;
  readonly componentIds: readonly string[];
  readonly count: number;
}

export interface ConstructionMergeBatch {
  readonly key: string;
  readonly componentIds: readonly string[];
  readonly count: number;
}

export interface ConstructionPerformancePlan {
  readonly instanceBatches: readonly ConstructionInstanceBatch[];
  readonly mergeBatches: readonly ConstructionMergeBatch[];
  readonly occlusionGroups: readonly {
    readonly key: string;
    readonly componentIds: readonly string[];
  }[];
  readonly lodReadyComponents: number;
  readonly collisionComponents: number;
}

function geometryKey(component: ConstructionComponentNode): string {
  const { parameters } = component;
  return [
    component.kind,
    parameters.material,
    parameters.width.toFixed(2),
    parameters.height.toFixed(2),
    parameters.depth.toFixed(2),
    parameters.thickness.toFixed(2),
  ].join(":");
}

function groupBy<T>(items: readonly T[], keyFor: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = keyFor(item);
    const current = map.get(key) ?? [];
    current.push(item);
    map.set(key, current);
  });
  return map;
}

export function createConstructionPerformancePlan(building: ConstructionBuildingOutput): ConstructionPerformancePlan {
  const components = flattenConstructionComponents(building.components).filter((component) => component.parameters.visible);
  const instancingGroups = Array.from(
    groupBy(
      components.filter((component) => component.parameters.lod.instanceEligible),
      geometryKey,
    ).entries(),
  );
  const mergeGroups = Array.from(
    groupBy(
      components.filter((component) => component.parameters.lod.mergeEligible),
      (component) => `${component.metadata.floorId ?? "site"}:${component.kind}:${component.parameters.material}`,
    ).entries(),
  );
  const occlusionGroups = Array.from(
    groupBy(
      components.filter((component) => component.metadata.occlusionReady),
      (component) => component.metadata.roomId ?? component.metadata.floorId ?? component.metadata.system,
    ).entries(),
  );

  return {
    instanceBatches: instancingGroups
      .filter(([, grouped]) => grouped.length > 1)
      .map(([key, grouped]) => ({ key, componentIds: grouped.map((component) => component.id), count: grouped.length })),
    mergeBatches: mergeGroups
      .filter(([, grouped]) => grouped.length > 1)
      .map(([key, grouped]) => ({ key, componentIds: grouped.map((component) => component.id), count: grouped.length })),
    occlusionGroups: occlusionGroups.map(([key, grouped]) => ({ key, componentIds: grouped.map((component) => component.id) })),
    lodReadyComponents: components.filter((component) => component.parameters.lod.enabled).length,
    collisionComponents: components.filter((component) => component.parameters.collision.enabled).length,
  };
}
