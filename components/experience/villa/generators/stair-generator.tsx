"use client";

import { VILLA_MATERIALS, type Vector3Tuple, type VillaMaterialName } from "../villa-materials";

export interface StairSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly steps: number;
  readonly stepSize: Vector3Tuple;
  readonly rise: number;
  readonly run: number;
  readonly axis: "x" | "z";
  readonly direction?: 1 | -1;
  readonly material?: VillaMaterialName;
}

interface StairGeneratorProps {
  readonly stairs: readonly StairSpec[];
}

export function StairGenerator({ stairs }: StairGeneratorProps) {
  return (
    <group name="Stair Generator">
      {stairs.map(({ id, position, steps, stepSize, rise, run, axis, direction = 1, material = "travertine" }) => (
        <group key={id} position={position} name={`stair-${id}`}>
          {Array.from({ length: steps }, (_, index) => {
            const offset = index * run * direction;
            const stepPosition: Vector3Tuple = axis === "x" ? [offset, index * rise, 0] : [0, index * rise, offset];

            return (
              <mesh key={`${id}-step-${index}`} position={stepPosition} castShadow receiveShadow>
                <boxGeometry args={[stepSize[0], stepSize[1] + index * rise, stepSize[2]]} />
                <meshStandardMaterial {...VILLA_MATERIALS[material]} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
