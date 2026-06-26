"use client";

import { useLayoutEffect, useRef } from "react";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { InstancedMesh } from "three";
import { VILLA_MATERIALS, type Vector3Tuple, type VillaMaterialName } from "../villa-materials";

export interface BoxInstanceSpec {
  readonly id: string;
  readonly position: Vector3Tuple;
  readonly scale?: Vector3Tuple;
  readonly rotation?: Vector3Tuple;
}

interface InstancedBoxGeneratorProps {
  readonly name: string;
  readonly instances: readonly BoxInstanceSpec[];
  readonly size: Vector3Tuple;
  readonly material: VillaMaterialName;
  readonly castShadow?: boolean;
  readonly receiveShadow?: boolean;
}

export function InstancedBoxGenerator({
  name,
  instances,
  size,
  material,
  castShadow = true,
  receiveShadow = true,
}: InstancedBoxGeneratorProps) {
  const mesh = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    if (!mesh.current) return;

    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const rotation = new Quaternion();

    instances.forEach((instance, index) => {
      position.set(...instance.position);
      scale.set(...(instance.scale ?? [1, 1, 1]));
      rotation.setFromEuler(new Euler(...(instance.rotation ?? [0, 0, 0])));
      matrix.compose(position, rotation, scale);
      mesh.current?.setMatrixAt(index, matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  }, [instances]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, instances.length]} castShadow={castShadow} receiveShadow={receiveShadow} name={name}>
      <boxGeometry args={size} />
      <meshStandardMaterial {...VILLA_MATERIALS[material]} />
    </instancedMesh>
  );
}
