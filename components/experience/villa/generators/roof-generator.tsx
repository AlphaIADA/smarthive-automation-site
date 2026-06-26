"use client";

import { VILLA_MATERIALS, type Vector3Tuple, type VillaMaterialName } from "../villa-materials";

export interface RoofSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly material?: VillaMaterialName;
}

interface RoofGeneratorProps {
  readonly roofs: readonly RoofSpec[];
}

export function RoofGenerator({ roofs }: RoofGeneratorProps) {
  return (
    <group name="Roof Generator">
      {roofs.map(({ id, position, size, material = "blackSteel" }) => (
        <mesh key={id} position={position} castShadow receiveShadow name={`flat-roof-${id}`}>
          <boxGeometry args={size} />
          <meshStandardMaterial {...VILLA_MATERIALS[material]} />
        </mesh>
      ))}
    </group>
  );
}
