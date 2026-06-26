"use client";

import { VILLA_MATERIALS, type Vector3Tuple, type VillaMaterialName } from "../villa-materials";

export interface FloorSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly material?: VillaMaterialName;
}

interface FloorGeneratorProps {
  readonly floors: readonly FloorSpec[];
}

export function FloorGenerator({ floors }: FloorGeneratorProps) {
  return (
    <group name="Floor Generator">
      {floors.map(({ id, position, size, rotation, material = "travertine" }) => (
        <mesh key={id} position={position} rotation={rotation} receiveShadow name={`floor-${id}`}>
          <boxGeometry args={size} />
          <meshStandardMaterial {...VILLA_MATERIALS[material]} />
        </mesh>
      ))}
    </group>
  );
}
