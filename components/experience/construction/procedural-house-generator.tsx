"use client";

import { useMemo } from "react";
import { buildSignatureVillaConstructionSystem } from "@/lib/experience/construction";
import { ConstructionComponentRenderer } from "./construction-component-renderer";

export function ProceduralHouseGenerator() {
  const building = useMemo(() => buildSignatureVillaConstructionSystem(), []);

  return (
    <group name="Procedural House Generator">
      {building.components.map((component) => (
        <ConstructionComponentRenderer key={component.id} node={component} />
      ))}
    </group>
  );
}
