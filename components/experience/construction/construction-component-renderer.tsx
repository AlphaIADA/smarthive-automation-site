"use client";

import type { ConstructionComponentNode, ConstructionMaterial } from "@/types/experience";

const materialColors: Record<ConstructionMaterial, string> = {
  concrete: "#b7b7ae",
  travertine: "#c9b896",
  marble: "#eee7da",
  wood: "#9a6f45",
  "tempered-glass": "#c5ecff",
  "brushed-aluminium": "#bfc6c9",
  "black-steel": "#111820",
  "natural-stone": "#6f756c",
  water: "#7ac8df",
  landscape: "#31533c",
};

function ConstructionMaterialView({ material, reflection }: { readonly material: ConstructionMaterial; readonly reflection: number }) {
  const color = materialColors[material];

  if (material === "tempered-glass" || material === "water") {
    return <meshPhysicalMaterial color={color} roughness={0.05} metalness={0} transparent opacity={material === "water" ? 0.62 : 0.36} clearcoat={1} clearcoatRoughness={0.04} envMapIntensity={reflection} />;
  }

  return <meshStandardMaterial color={color} roughness={material === "black-steel" || material === "brushed-aluminium" ? 0.32 : 0.68} metalness={material === "black-steel" || material === "brushed-aluminium" ? 0.68 : 0.02} />;
}

export function ConstructionComponentRenderer({ node }: { readonly node: ConstructionComponentNode }) {
  if (!node.parameters.visible) return null;

  return (
    <group name={`construction-node-${node.id}`}>
      <mesh
        position={[node.position[0], node.position[1] + node.parameters.elevation, node.position[2]]}
        rotation={[node.parameters.rotation[0], node.parameters.rotation[1], node.parameters.rotation[2]]}
        castShadow={node.parameters.shadow.cast}
        receiveShadow={node.parameters.shadow.receive}
        name={node.id}
      >
        <boxGeometry args={[node.parameters.width, node.parameters.height, node.parameters.depth]} />
        <ConstructionMaterialView material={node.parameters.material} reflection={node.parameters.reflection.intensity} />
      </mesh>
      {node.children.map((child) => (
        <ConstructionComponentRenderer key={child.id} node={child} />
      ))}
    </group>
  );
}
