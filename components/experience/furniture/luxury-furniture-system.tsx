"use client";

import { FURNITURE_PLACEMENTS } from "@/lib/experience/furniture/furniture-registry";
import { FurniturePopulation } from "./generators/furniture-renderer";

export function LuxuryFurnitureSystem() {
  return (
    <group name="SmartHive Signature Villa Luxury Furniture System">
      <FurniturePopulation placements={FURNITURE_PLACEMENTS} />
    </group>
  );
}
