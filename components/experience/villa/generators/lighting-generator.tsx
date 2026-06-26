"use client";

import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";
import { InstancedBoxGenerator, type BoxInstanceSpec } from "./instanced-box-generator";

export interface ArchitecturalLightSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly target?: Vector3Tuple;
  readonly color?: string;
  readonly intensity?: number;
  readonly distance?: number;
}

interface LightingGeneratorProps {
  readonly facadeLights: readonly ArchitecturalLightSpec[];
  readonly pathLights: readonly BoxInstanceSpec[];
}

export function LightingGenerator({ facadeLights, pathLights }: LightingGeneratorProps) {
  const pathGlowLights = pathLights.filter((_, index) => index % 8 === 0);

  return (
    <group name="Premium Exterior Lighting">
      <InstancedBoxGenerator name="instanced-landscape-bollards" instances={pathLights} size={[0.16, 0.42, 0.16]} material="warmLight" castShadow={false} receiveShadow={false} />
      {pathGlowLights.map(({ id, position }) => (
        <pointLight key={`${id}-glow`} position={[position[0], position[1] + 0.38, position[2]]} color="#ffc984" intensity={0.18} distance={4.5} />
      ))}
      {facadeLights.map(({ id, position, color = "#ffd7a2", intensity = 1.6, distance = 12 }) => (
        <group key={id} position={position} name={`architectural-light-${id}`}>
          <mesh castShadow>
            <boxGeometry args={[0.28, 0.09, 0.18]} />
            <meshStandardMaterial {...VILLA_MATERIALS.warmLight} />
          </mesh>
          <pointLight color={color} intensity={intensity} distance={distance} />
        </group>
      ))}
    </group>
  );
}
