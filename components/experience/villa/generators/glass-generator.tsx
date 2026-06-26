"use client";

import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";

export interface GlassPanelSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
}

interface GlassGeneratorProps {
  readonly panels: readonly GlassPanelSpec[];
}

export function GlassGenerator({ panels }: GlassGeneratorProps) {
  return (
    <group name="Glass Generator">
      {panels.map(({ id, position, size, rotation }) => (
        <group key={id} position={position} rotation={rotation} name={`glass-panel-${id}`}>
          <mesh receiveShadow>
            <boxGeometry args={size} />
            <meshPhysicalMaterial {...VILLA_MATERIALS.temperedGlass} opacity={0.42} />
          </mesh>
          <mesh position={[0, -size[1] / 2 - 0.04, 0]}>
            <boxGeometry args={[size[0] + 0.08, 0.08, size[2] + 0.04]} />
            <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
