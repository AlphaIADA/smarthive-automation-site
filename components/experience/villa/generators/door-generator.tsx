"use client";

import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";

export interface DoorSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
}

interface DoorGeneratorProps {
  readonly doors: readonly DoorSpec[];
}

export function DoorGenerator({ doors }: DoorGeneratorProps) {
  return (
    <group name="Door Generator">
      {doors.map(({ id, position, size, rotation }) => {
        const [width, height, depth] = size;

        return (
          <group key={id} position={position} rotation={rotation} name={`pivot-door-${id}`}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial {...VILLA_MATERIALS.warmWood} />
            </mesh>
            <mesh position={[-width / 2 + 0.12, 0, depth / 2 + 0.025]} castShadow>
              <boxGeometry args={[0.08, height * 0.92, 0.05]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[width / 2 - 0.22, 0.1, depth / 2 + 0.07]} castShadow>
              <boxGeometry args={[0.08, height * 0.45, 0.08]} />
              <meshStandardMaterial {...VILLA_MATERIALS.brushedAluminium} />
            </mesh>
            <mesh position={[0, height / 2 + 0.09, depth / 2 + 0.02]} castShadow>
              <boxGeometry args={[width + 0.4, 0.18, 0.18]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
