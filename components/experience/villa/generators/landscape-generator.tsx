"use client";

import { useRef } from "react";
import { Detailed } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { VILLA_MATERIALS, type Vector3Tuple } from "../villa-materials";

export interface PalmSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly scale?: number;
}

export interface PlantSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly scale?: number;
}

interface LandscapeGeneratorProps {
  readonly palms: readonly PalmSpec[];
  readonly plants: readonly PlantSpec[];
}

function PalmTree({ position, scale = 1 }: PalmSpec) {
  const crown = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!crown.current) return;
    const sway = Math.sin(clock.getElapsedTime() * 0.9 + position[0] * 0.18) * 0.055;
    crown.current.rotation.z = sway;
    crown.current.rotation.x = sway * 0.35;
  });

  return (
    <group position={position} scale={scale} name="automatic-lod-palm-tree">
      <Detailed distances={[0, 22, 42]}>
        <group>
          <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.17, 0.26, 3.3, 10]} />
            <meshStandardMaterial {...VILLA_MATERIALS.warmWood} />
          </mesh>
          <group ref={crown} position={[0, 3.45, 0]}>
            {Array.from({ length: 8 }, (_, index) => (
              <mesh key={`leaf-${index}`} rotation={[0.22, (Math.PI * 2 * index) / 8, 0.34]} position={[0, 0.08, 0]}>
                <boxGeometry args={[0.16, 0.045, 2.15]} />
                <meshStandardMaterial {...VILLA_MATERIALS.palmLeaf} />
              </mesh>
            ))}
          </group>
        </group>
        <group>
          <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.18, 0.25, 3.1, 8]} />
            <meshStandardMaterial {...VILLA_MATERIALS.warmWood} />
          </mesh>
          <mesh position={[0, 3.25, 0]}>
            <coneGeometry args={[1.25, 0.45, 8]} />
            <meshStandardMaterial {...VILLA_MATERIALS.palmLeaf} />
          </mesh>
        </group>
        <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.28, 3.2, 6]} />
          <meshStandardMaterial {...VILLA_MATERIALS.warmWood} />
        </mesh>
      </Detailed>
    </group>
  );
}

function DecorativePlant({ position, scale = 1 }: PlantSpec) {
  return (
    <group position={position} scale={scale} name="decorative-plant">
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <sphereGeometry args={[0.38, 10, 8]} />
        <meshStandardMaterial {...VILLA_MATERIALS.gardenGreen} />
      </mesh>
      <mesh position={[0.24, 0.18, -0.16]} receiveShadow>
        <sphereGeometry args={[0.25, 8, 6]} />
        <meshStandardMaterial {...VILLA_MATERIALS.palmLeaf} />
      </mesh>
      <mesh position={[-0.2, 0.16, 0.18]} receiveShadow>
        <sphereGeometry args={[0.23, 8, 6]} />
        <meshStandardMaterial {...VILLA_MATERIALS.gardenGreen} />
      </mesh>
    </group>
  );
}

function AnimatedClouds() {
  const clouds = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!clouds.current) return;
    clouds.current.position.x = Math.sin(clock.getElapsedTime() * 0.06) * 5;
    clouds.current.position.z = Math.cos(clock.getElapsedTime() * 0.04) * 1.5;
  });

  return (
    <group ref={clouds} position={[-8, 13.5, -16]} name="subtle-cloud-movement">
      {[
        [-2.2, 0, 0, 1.5],
        [0, 0.25, 0.2, 2.1],
        [2.2, 0.05, -0.1, 1.6],
      ].map(([x, y, z, radius], index) => (
        <mesh key={`cloud-${index}`} position={[x, y, z]} castShadow={false}>
          <sphereGeometry args={[radius, 12, 8]} />
          <meshStandardMaterial color="#f7fbff" roughness={0.96} transparent opacity={0.42} />
        </mesh>
      ))}
    </group>
  );
}

export function LandscapeGenerator({ palms, plants }: LandscapeGeneratorProps) {
  return (
    <group name="Landscape Generator">
      <AnimatedClouds />
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[78, 0.08, 74]} />
        <meshStandardMaterial {...VILLA_MATERIALS.gardenGreen} />
      </mesh>
      {palms.map((palm) => (
        <PalmTree key={palm.id} {...palm} />
      ))}
      {plants.map((plant) => (
        <DecorativePlant key={plant.id} {...plant} />
      ))}
    </group>
  );
}
