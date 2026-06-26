"use client";

import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";

export interface WindowSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
  readonly mullions?: number;
}

interface WindowGeneratorProps {
  readonly windows: readonly WindowSpec[];
}

const FRAME = 0.09;
const GLASS_THICKNESS = 0.14;

export function WindowGenerator({ windows }: WindowGeneratorProps) {
  return (
    <group name="Window Generator">
      {windows.map(({ id, position, size, rotation, mullions = 1 }) => {
        const [width, height] = size;
        const mullionOffset = width / (mullions + 1);

        return (
          <group key={id} position={position} rotation={rotation} name={`window-${id}`}>
            <mesh receiveShadow>
              <boxGeometry args={[width, height, GLASS_THICKNESS]} />
              <meshPhysicalMaterial {...VILLA_MATERIALS.temperedGlass} />
            </mesh>
            <mesh position={[0, height / 2 + FRAME / 2, 0.01]}>
              <boxGeometry args={[width + FRAME * 2, FRAME, FRAME]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[0, -height / 2 - FRAME / 2, 0.01]}>
              <boxGeometry args={[width + FRAME * 2, FRAME, FRAME]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[-width / 2 - FRAME / 2, 0, 0.01]}>
              <boxGeometry args={[FRAME, height + FRAME * 2, FRAME]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[width / 2 + FRAME / 2, 0, 0.01]}>
              <boxGeometry args={[FRAME, height + FRAME * 2, FRAME]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            {Array.from({ length: mullions }, (_, index) => (
              <mesh key={`${id}-mullion-${index}`} position={[-width / 2 + mullionOffset * (index + 1), 0, 0.025]}>
                <boxGeometry args={[FRAME * 0.72, height, FRAME]} />
                <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
