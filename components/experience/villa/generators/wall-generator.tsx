"use client";

import { VILLA_MATERIALS, type Vector3Tuple, type VillaMaterialName } from "../villa-materials";

export interface WallSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly material?: VillaMaterialName;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
}

interface WallGeneratorProps {
  readonly walls: readonly WallSpec[];
}

export function WallGenerator({ walls }: WallGeneratorProps) {
  return (
    <group name="Wall Generator">
      {walls.map(({ id, position, size, rotation, material = "architecturalConcrete", castShadow = true, receiveShadow = true }) => (
        <mesh key={id} position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow} name={`wall-${id}`}>
          <boxGeometry args={size} />
          <meshStandardMaterial {...VILLA_MATERIALS[material]} />
        </mesh>
      ))}
    </group>
  );
}
