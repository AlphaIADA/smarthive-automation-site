"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, MeshPhysicalMaterial } from "three";
import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";

export interface PoolSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly size: Vector3Tuple;
}

interface PoolGeneratorProps {
  readonly pools: readonly PoolSpec[];
}

function AnimatedWater({ size }: { readonly size: Vector3Tuple }) {
  const water = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!water.current) return;
    const time = clock.getElapsedTime();
    water.current.position.y = Math.sin(time * 1.4) * 0.018;
    water.current.rotation.z = Math.sin(time * 0.42) * 0.006;
    const material = water.current.material as MeshPhysicalMaterial;
    material.roughness = 0.07 + Math.sin(time * 0.8) * 0.012;
  });

  return (
    <mesh ref={water} position={[0, 0.09, 0]} receiveShadow>
      <boxGeometry args={[size[0] - 0.7, 0.08, size[2] - 0.7]} />
      <meshPhysicalMaterial {...VILLA_MATERIALS.water} />
    </mesh>
  );
}

export function PoolGenerator({ pools }: PoolGeneratorProps) {
  return (
    <group name="Pool Generator">
      {pools.map(({ id, position, size }) => (
        <group key={id} position={position} name={`pool-${id}`}>
          <mesh receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial {...VILLA_MATERIALS.charcoalStone} />
          </mesh>
          <mesh position={[0, 0.13, 0]} receiveShadow>
            <boxGeometry args={[size[0] + 1.6, 0.16, size[2] + 1.6]} />
            <meshStandardMaterial {...VILLA_MATERIALS.travertine} />
          </mesh>
          <AnimatedWater size={size} />
          <mesh position={[0, 0.18, -size[2] / 2 - 0.55]} castShadow receiveShadow>
            <boxGeometry args={[size[0] * 0.72, 0.55, 0.18]} />
            <meshStandardMaterial {...VILLA_MATERIALS.naturalStone} />
          </mesh>
          {[-1, 1].map((side) => (
            <pointLight key={`${id}-reflection-${side}`} position={[side * size[0] * 0.34, 0.45, 0]} color="#91e8ff" intensity={0.48} distance={7} />
          ))}
        </group>
      ))}
    </group>
  );
}
