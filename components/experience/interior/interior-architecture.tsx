"use client";

import type { EventBus } from "@/lib/experience/event-bus";
import { INTERIOR_ROOMS } from "@/lib/experience/interior/room-registry";
import {
  CeilingSystem,
  ElevatorShaft,
  FloatingStaircase,
  InteriorDoorSystem,
  InteriorWindowSystem,
  RoomDetectionLayer,
  RoomFloorSystem,
  RoomWallSystem,
  StructuralSystem,
} from "./generators/interior-architecture-generators";

export function InteriorArchitecture({ eventBus }: { readonly eventBus: EventBus }) {
  return (
    <group name="SmartHive Signature Villa Interior Architecture">
      <RoomFloorSystem rooms={INTERIOR_ROOMS} />
      <RoomWallSystem rooms={INTERIOR_ROOMS} />
      <CeilingSystem rooms={INTERIOR_ROOMS} />
      <StructuralSystem />
      <InteriorDoorSystem />
      <InteriorWindowSystem />
      <FloatingStaircase />
      <ElevatorShaft />
      <RoomDetectionLayer rooms={INTERIOR_ROOMS} eventBus={eventBus} />
    </group>
  );
}
