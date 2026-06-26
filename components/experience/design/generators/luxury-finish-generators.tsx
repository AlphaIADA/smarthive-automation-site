"use client";

import { useMemo } from "react";
import { CanvasTexture, RepeatWrapping, Vector2, type Texture } from "three";
import { LUXURY_INTERIOR_MATERIALS } from "@/lib/experience/design/luxury-materials";
import type { LuxuryInteriorFinishSpec, LuxuryInteriorPbrMaterial } from "@/types/experience";

interface ProceduralTextureSet {
  readonly normalMap?: Texture;
  readonly roughnessMap?: Texture;
  readonly aoMap?: Texture;
  readonly normalScale: Vector2;
}

const textureCache = new Map<string, ProceduralTextureSet>();

function patternSeed(material: LuxuryInteriorPbrMaterial) {
  return material.id.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function configureTexture(texture: CanvasTexture, material: LuxuryInteriorPbrMaterial) {
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(material.texturePattern === "wood-grain" || material.texturePattern === "brushed-metal" ? 2 : 1, material.texturePattern === "marble-vein" ? 2 : 1);
  texture.needsUpdate = true;
  return texture;
}

function drawLinearPattern(context: CanvasRenderingContext2D, material: LuxuryInteriorPbrMaterial, channel: "normal" | "roughness" | "ao") {
  const seed = patternSeed(material);
  const count = material.texturePattern === "smooth" ? 10 : 28;

  for (let index = 0; index < count; index += 1) {
    const offset = (index * 19 + seed) % 128;
    const wave = Math.sin((index + seed) * 0.55);
    const alpha = material.texturePattern === "woven" ? 0.24 : 0.16;

    if (channel === "normal") {
      const red = Math.round(128 + wave * 18 * material.normalStrength);
      const green = Math.round(128 - wave * 14 * material.normalStrength);
      context.strokeStyle = `rgba(${red}, ${green}, 255, ${alpha})`;
    } else if (channel === "roughness") {
      const shade = Math.round(255 * Math.min(0.95, material.roughness + wave * 0.08));
      context.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
    } else {
      const shade = Math.round(220 - material.aoIntensity * 65 + wave * 14);
      context.strokeStyle = `rgba(${shade}, ${shade}, ${shade}, ${alpha})`;
    }

    context.lineWidth = material.texturePattern === "marble-vein" || material.texturePattern === "stone-grain" ? 2 : 1;
    context.beginPath();

    if (material.texturePattern === "wood-grain" || material.texturePattern === "brushed-metal") {
      context.moveTo(0, offset);
      context.lineTo(128, offset + wave * 6);
    } else if (material.texturePattern === "woven") {
      context.moveTo(offset, 0);
      context.lineTo(offset + wave * 5, 128);
      context.moveTo(0, offset);
      context.lineTo(128, offset);
    } else {
      context.moveTo(-8, offset);
      context.bezierCurveTo(32, offset + wave * 18, 82, offset - wave * 14, 136, offset + wave * 12);
    }

    context.stroke();
  }
}

function createProceduralTexture(material: LuxuryInteriorPbrMaterial, channel: "normal" | "roughness" | "ao") {
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
    context.fillStyle = `rgb(${Math.round(236 - material.aoIntensity * 38)}, ${Math.round(236 - material.aoIntensity * 38)}, ${Math.round(236 - material.aoIntensity * 38)})`;
  }

  context.fillRect(0, 0, 128, 128);
  drawLinearPattern(context, material, channel);

  if (channel === "ao") {
    const gradient = context.createRadialGradient(64, 64, 12, 64, 64, 86);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.34)");
    gradient.addColorStop(1, `rgba(24, 24, 24, ${Math.min(0.38, material.aoIntensity * 0.22)})`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
  }

  return configureTexture(new CanvasTexture(canvas), material);
}

function getProceduralTextureSet(material: LuxuryInteriorPbrMaterial): ProceduralTextureSet {
  const cached = textureCache.get(material.id);

  if (cached) return cached;

  const textures: ProceduralTextureSet = {
    normalMap: createProceduralTexture(material, "normal"),
    roughnessMap: createProceduralTexture(material, "roughness"),
    aoMap: createProceduralTexture(material, "ao"),
    normalScale: new Vector2(material.normalStrength, material.normalStrength),
  };

  textureCache.set(material.id, textures);
  return textures;
}

function LuxuryMeshMaterial({ finish }: { readonly finish: LuxuryInteriorFinishSpec }) {
  const material = LUXURY_INTERIOR_MATERIALS[finish.material];
  const textures = useMemo(() => getProceduralTextureSet(material), [material]);
  const isLuminous = finish.lighting.hiddenLight;
  const emissive = isLuminous ? "#ffe3b2" : (material.emissive ?? "#000000");
  const emissiveIntensity = isLuminous ? 1.18 : (material.emissiveIntensity ?? 0);
  const finishRequiresTransparency = finish.kind === "glass-railing" || finish.kind === "glass-shower" || finish.kind === "mirror-wall" || finish.kind === "mirror-lighting";
  const transparent = material.transparent ?? finishRequiresTransparency;
  const opacity = finish.kind === "mirror-wall" || finish.kind === "mirror-lighting" ? 0.48 : (material.opacity ?? 1);

  if (material.category === "glass" || material.transmission || material.clearcoat) {
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
        clearcoat={material.clearcoat ?? 0.35}
        clearcoatRoughness={material.clearcoatRoughness ?? 0.12}
        envMapIntensity={material.reflectionIntensity}
        transparent={transparent}
        opacity={opacity}
        transmission={material.transmission ?? 0}
        thickness={material.thickness ?? 0.04}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        depthWrite={!transparent}
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
      transparent={transparent}
      opacity={opacity}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      depthWrite={!transparent}
    />
  );
}

export function LuxuryFinishMesh({ finish }: { readonly finish: LuxuryInteriorFinishSpec }) {
  return (
    <mesh
      name={`luxury-finish-${finish.id}`}
      position={finish.position}
      rotation={finish.rotation}
      castShadow={finish.castShadow}
      receiveShadow={finish.receiveShadow}
      renderOrder={finish.material === "glass" ? 2 : 0}
      userData={{
        finishKind: finish.kind,
        roomId: finish.roomId,
        roomName: finish.roomName,
        label: finish.label,
        pbr: finish.pbr,
        lighting: finish.lighting,
        lod: finish.lod,
        furniture: "excluded",
        smartDevices: "excluded",
        automation: "excluded",
      }}
    >
      <boxGeometry args={finish.size} />
      <LuxuryMeshMaterial finish={finish} />
    </mesh>
  );
}
