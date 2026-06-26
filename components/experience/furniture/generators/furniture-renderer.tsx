"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { CanvasTexture, Euler, InstancedMesh, Matrix4, Quaternion, RepeatWrapping, Vector2, Vector3, type Texture } from "three";
import { FURNITURE_ASSET_BY_ID } from "@/lib/experience/furniture/furniture-assets";
import { FURNITURE_MATERIALS } from "@/lib/experience/furniture/furniture-materials";
import type { FurniturePartShape, FurniturePartSpec, FurniturePbrMaterial, FurniturePlacementSpec } from "@/types/experience";

interface TextureSet {
  readonly normalMap?: Texture;
  readonly roughnessMap?: Texture;
  readonly aoMap?: Texture;
  readonly normalScale: Vector2;
}

const textureCache = new Map<string, TextureSet>();

function materialSeed(material: FurniturePbrMaterial) {
  return material.id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function configureTexture(texture: CanvasTexture) {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  texture.needsUpdate = true;
  return texture;
}

function drawTextureNoise(context: CanvasRenderingContext2D, material: FurniturePbrMaterial, channel: "normal" | "roughness" | "ao") {
  const seed = materialSeed(material);
  const lineCount = material.category === "wood" || material.category === "soft" ? 26 : 14;

  for (let index = 0; index < lineCount; index += 1) {
    const offset = (index * 17 + seed) % 128;
    const wave = Math.sin((index + seed) * 0.47);

    if (channel === "normal") {
      const red = Math.round(128 + wave * 18 * material.normalStrength);
      const green = Math.round(128 - wave * 14 * material.normalStrength);
      context.strokeStyle = `rgba(${red}, ${green}, 255, 0.2)`;
    } else if (channel === "roughness") {
      const shade = Math.round(255 * Math.min(0.96, material.roughness + wave * 0.06));
      context.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, 0.18)`;
    } else {
      const shade = Math.round(226 - material.aoIntensity * 55 + wave * 10);
      context.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, 0.18)`;
    }

    context.lineWidth = material.category === "soft" ? 1 : 2;
    context.beginPath();

    if (material.category === "wood" || material.category === "metal") {
      context.moveTo(0, offset);
      context.lineTo(128, offset + wave * 5);
    } else if (material.category === "soft") {
      context.moveTo(offset, 0);
      context.lineTo(offset + wave * 4, 128);
      context.moveTo(0, offset);
      context.lineTo(128, offset);
    } else {
      context.moveTo(-8, offset);
      context.bezierCurveTo(34, offset + wave * 16, 86, offset - wave * 12, 136, offset + wave * 10);
    }

    context.stroke();
  }
}

function createTexture(material: FurniturePbrMaterial, channel: "normal" | "roughness" | "ao") {
  if (typeof document === "undefined") return undefined;

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;

  const context = canvas.getContext("2d");
  if (!context) return undefined;

  if (channel === "normal") {
    context.fillStyle = "#8080ff";
  } else if (channel === "roughness") {
    const shade = Math.round(255 * material.roughness);
    context.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
  } else {
    const shade = Math.round(236 - material.aoIntensity * 34);
    context.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
  }

  context.fillRect(0, 0, 128, 128);
  drawTextureNoise(context, material, channel);

  return configureTexture(new CanvasTexture(canvas));
}

function getTextureSet(material: FurniturePbrMaterial): TextureSet {
  const cached = textureCache.get(material.id);

  if (cached) return cached;

  const textureSet: TextureSet = {
    normalMap: createTexture(material, "normal"),
    roughnessMap: createTexture(material, "roughness"),
    aoMap: createTexture(material, "ao"),
    normalScale: new Vector2(material.normalStrength, material.normalStrength),
  };

  textureCache.set(material.id, textureSet);
  return textureSet;
}

function FurnitureMaterial({ materialId }: { readonly materialId: FurniturePartSpec["material"] }) {
  const material = FURNITURE_MATERIALS[materialId];
  const textures = useMemo(() => getTextureSet(material), [material]);

  if (material.category === "glass" || material.category === "display" || material.clearcoat || material.transmission) {
    return (
      <meshPhysicalMaterial
        color={material.color}
        roughness={material.roughness}
        metalness={material.metalness}
        normalMap={textures.normalMap}
        normalScale={textures.normalScale}
        roughnessMap={textures.roughnessMap}
        aoMap={textures.aoMap}
        aoMapIntensity={material.aoIntensity}
        envMapIntensity={material.reflectionIntensity}
        clearcoat={material.clearcoat ?? 0.24}
        clearcoatRoughness={material.clearcoatRoughness ?? 0.16}
        transparent={material.transparent ?? false}
        opacity={material.opacity ?? 1}
        transmission={material.transmission ?? 0}
        thickness={material.thickness ?? 0.04}
        emissive={material.emissive ?? "#000000"}
        emissiveIntensity={material.emissiveIntensity ?? 0}
        depthWrite={!(material.transparent ?? false)}
      />
    );
  }

  return (
    <meshStandardMaterial
      color={material.color}
      roughness={material.roughness}
      metalness={material.metalness}
      normalMap={textures.normalMap}
      normalScale={textures.normalScale}
      roughnessMap={textures.roughnessMap}
      aoMap={textures.aoMap}
      aoMapIntensity={material.aoIntensity}
      envMapIntensity={material.reflectionIntensity}
      emissive={material.emissive ?? "#000000"}
      emissiveIntensity={material.emissiveIntensity ?? 0}
    />
  );
}

function FurniturePartGeometry({ shape }: { readonly shape: FurniturePartShape }) {
  if (shape === "box") return <boxGeometry args={[1, 1, 1]} />;
  if (shape === "cylinder") return <cylinderGeometry args={[1, 1, 1, 16]} />;
  return <sphereGeometry args={[1, 12, 8]} />;
}

interface FurnitureInstance {
  readonly matrix: Matrix4;
  readonly placementId: string;
  readonly assetId: string;
  readonly roomId: string;
  readonly label: string;
}

interface FurnitureBatch {
  readonly key: string;
  readonly shape: FurniturePartShape;
  readonly material: FurniturePartSpec["material"];
  readonly instances: readonly FurnitureInstance[];
}

function composeMatrix(position: [number, number, number], rotation: [number, number, number] | undefined, scale: [number, number, number]) {
  return new Matrix4().compose(
    new Vector3(position[0], position[1], position[2]),
    new Quaternion().setFromEuler(new Euler(rotation?.[0] ?? 0, rotation?.[1] ?? 0, rotation?.[2] ?? 0)),
    new Vector3(scale[0], scale[1], scale[2]),
  );
}

function partScale(part: FurniturePartSpec): [number, number, number] {
  if (part.shape === "cylinder") return [part.size[0], part.size[1], part.size[0]];
  return part.size;
}

function createFurnitureBatches(placements: readonly FurniturePlacementSpec[]): readonly FurnitureBatch[] {
  const batches = new Map<string, { shape: FurniturePartShape; material: FurniturePartSpec["material"]; instances: FurnitureInstance[] }>();

  placements.forEach((placement) => {
    const asset = FURNITURE_ASSET_BY_ID.get(placement.assetId);
    if (!asset) return;

    const placementMatrix = composeMatrix(placement.position, placement.rotation, placement.scale ?? [1, 1, 1]);

    asset.parts.forEach((part) => {
      const batchKey = `${part.shape}:${part.material}`;
      const batch = batches.get(batchKey) ?? { shape: part.shape, material: part.material, instances: [] };
      const partMatrix = composeMatrix(part.position, part.rotation, partScale(part));
      const worldMatrix = placementMatrix.clone().multiply(partMatrix);

      batch.instances.push({
        matrix: worldMatrix,
        placementId: placement.id,
        assetId: placement.assetId,
        roomId: placement.roomId,
        label: placement.label,
      });

      batches.set(batchKey, batch);
    });
  });

  return Array.from(batches.entries()).map(([key, batch]) => ({ key, ...batch }));
}

function FurnitureInstancedBatch({ batch }: { readonly batch: FurnitureBatch }) {
  const meshRef = useRef<InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    batch.instances.forEach((instance, index) => {
      mesh.setMatrixAt(index, instance.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [batch]);

  return (
    <instancedMesh
      ref={meshRef}
      name={`furniture-batch-${batch.key}`}
      args={[undefined, undefined, batch.instances.length]}
      castShadow
      receiveShadow
      userData={{
        batchKey: batch.key,
        shape: batch.shape,
        material: batch.material,
        instanceCount: batch.instances.length,
        placementIds: batch.instances.map((instance) => instance.placementId),
        roomIds: Array.from(new Set(batch.instances.map((instance) => instance.roomId))),
        reusable: true,
        pbr: true,
        shadowEnabled: true,
        futureInteractionReady: true,
        smartDevice: false,
        automation: false,
        ai: false,
        cctv: false,
        lightingLogic: false,
      }}
    >
      <FurniturePartGeometry shape={batch.shape} />
      <FurnitureMaterial materialId={batch.material} />
    </instancedMesh>
  );
}

export function FurniturePopulation({ placements }: { readonly placements: readonly FurniturePlacementSpec[] }) {
  const batches = useMemo(() => createFurnitureBatches(placements), [placements]);

  return (
    <>
      {batches.map((batch) => (
        <FurnitureInstancedBatch key={batch.key} batch={batch} />
      ))}
    </>
  );
}
