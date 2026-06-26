"use client";

import { VILLA_MATERIALS } from "../villa-materials";
import { InstancedBoxGenerator, type BoxInstanceSpec } from "./instanced-box-generator";

export interface FenceSpec {
  readonly id: string;
  readonly width: number;
  readonly depth: number;
  readonly height: number;
}

interface FenceGeneratorProps {
  readonly fences: readonly FenceSpec[];
}

function buildFencePosts(width: number, depth: number, height: number): BoxInstanceSpec[] {
  const posts: BoxInstanceSpec[] = [];
  const spacing = 3.2;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  for (let x = -halfWidth; x <= halfWidth; x += spacing) {
    if (Math.abs(x) < 5) continue;
    posts.push({ id: `front-${x}`, position: [x, height / 2, halfDepth], scale: [1, 1, 1] });
    posts.push({ id: `rear-${x}`, position: [x, height / 2, -halfDepth], scale: [1, 1, 1] });
  }
  for (let z = -halfDepth + spacing; z <= halfDepth - spacing; z += spacing) {
    posts.push({ id: `left-${z}`, position: [-halfWidth, height / 2, z], scale: [1, 1, 1] });
    posts.push({ id: `right-${z}`, position: [halfWidth, height / 2, z], scale: [1, 1, 1] });
  }

  return posts;
}

export function FenceGenerator({ fences }: FenceGeneratorProps) {
  return (
    <group name="Fence Generator">
      {fences.map(({ id, width, depth, height }) => {
        const halfWidth = width / 2;
        const halfDepth = depth / 2;
        const posts = buildFencePosts(width, depth, height);
        const railHeight = height * 0.52;

        return (
          <group key={id} name={`perimeter-${id}`}>
            <InstancedBoxGenerator name={`${id}-black-steel-posts`} instances={posts} size={[0.12, height, 0.12]} material="blackSteel" />
            <mesh position={[-halfWidth, railHeight, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.16, depth]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[halfWidth, railHeight, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.16, depth]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[0, railHeight, -halfDepth]} castShadow receiveShadow>
              <boxGeometry args={[width, 0.16, 0.12]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[-13.8, railHeight, halfDepth]} castShadow receiveShadow>
              <boxGeometry args={[width / 2 - 10, 0.16, 0.12]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <mesh position={[13.8, railHeight, halfDepth]} castShadow receiveShadow>
              <boxGeometry args={[width / 2 - 10, 0.16, 0.12]} />
              <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
            </mesh>
            <group position={[0, height * 0.48, halfDepth + 0.06]} name={`${id}-automatic-sliding-gate`}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[7.6, height * 0.82, 0.16]} />
                <meshStandardMaterial {...VILLA_MATERIALS.blackSteel} />
              </mesh>
              <mesh position={[0, height * 0.03, 0.09]} castShadow receiveShadow>
                <boxGeometry args={[7.2, height * 0.5, 0.05]} />
                <meshPhysicalMaterial {...VILLA_MATERIALS.temperedGlass} opacity={0.3} />
              </mesh>
              <mesh position={[-4.15, -height * 0.4, 0.08]} castShadow receiveShadow>
                <boxGeometry args={[8.8, 0.12, 0.26]} />
                <meshStandardMaterial {...VILLA_MATERIALS.brushedAluminium} />
              </mesh>
            </group>
          </group>
        );
      })}
    </group>
  );
}
