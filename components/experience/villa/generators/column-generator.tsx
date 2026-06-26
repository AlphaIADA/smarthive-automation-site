"use client";

import { VILLA_MATERIALS, type Vector3Tuple, type VillaMaterialName } from "../villa-materials";

export interface ColumnSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly height: number;
  readonly radius?: number;
  readonly square?: boolean;
  readonly material?: VillaMaterialName;
}

interface ColumnGeneratorProps {
  readonly columns: readonly ColumnSpec[];
}

export function ColumnGenerator({ columns }: ColumnGeneratorProps) {
  return (
    <group name="Column Generator">
      {columns.map(({ id, position, height, radius = 0.18, square = false, material = "blackSteel" }) => (
        <mesh key={id} position={position} castShadow receiveShadow name={`column-${id}`}>
          {square ? <boxGeometry args={[radius * 2, height, radius * 2]} /> : <cylinderGeometry args={[radius, radius, height, 20]} />}
          <meshStandardMaterial {...VILLA_MATERIALS[material]} />
        </mesh>
      ))}
    </group>
  );
}
