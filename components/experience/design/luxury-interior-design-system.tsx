"use client";

import { LUXURY_INTERIOR_FINISHES } from "@/lib/experience/design/finish-specs";
import { LuxuryFinishMesh } from "./generators/luxury-finish-generators";

export function LuxuryInteriorDesignSystem() {
  return (
    <group name="SmartHive Signature Villa Luxury Interior Design System">
      {LUXURY_INTERIOR_FINISHES.map((finish) => (
        <LuxuryFinishMesh key={finish.id} finish={finish} />
      ))}
    </group>
  );
}
