"use client";

import { ImmersiveCameraController } from "./immersive-camera-controller";
import { ImmersiveWalkRenderer } from "./generators/immersive-walk-renderer";

export function ImmersiveWalkExperience() {
  return (
    <group
      name="SmartHive Immersive Walk Experience"
      userData={{
        milestone: 17,
        system: "immersive-walk-experience",
        orbitMode: true,
        walkMode: true,
        flyMode: true,
        firstPersonMode: true,
        guidedTour: true,
        vrReady: true,
        collision: ["walls", "doors", "furniture", "glass", "pool", "stairs"],
        doorInteraction: true,
        elevatorInteraction: true,
        aiNarrationReady: true,
      }}
    >
      <ImmersiveCameraController />
      <ImmersiveWalkRenderer />
    </group>
  );
}
