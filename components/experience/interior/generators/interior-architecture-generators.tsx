"use client";

import type { EventBus } from "@/lib/experience/event-bus";
import { INTERIOR_DOORS, INTERIOR_WINDOWS } from "@/lib/experience/interior/architectural-specs";
import type { InteriorDoorSpec, InteriorFloorMaterial, InteriorRoom, InteriorWindowSpec } from "@/types/experience";
import { INTERIOR_MATERIALS } from "../interior-materials";

function floorMaterialName(material: InteriorFloorMaterial): keyof typeof INTERIOR_MATERIALS {
  if (material === "engineered-wood") return "engineeredWood";
  if (material === "polished-concrete") return "polishedConcrete";
  if (material === "bathroom-tile") return "bathroomTile";
  if (material === "outdoor-decking") return "outdoorDecking";
  if (material === "acoustic-floor") return "acousticFloor";
  return "marbleFloor";
}

function roomCenter(room: InteriorRoom): [number, number, number] {
  const { min, max } = room.boundingBox;
  return [(min.x + max.x) / 2, min.y + 0.04, (min.z + max.z) / 2];
}

function roomSize(room: InteriorRoom): [number, number, number] {
  const { min, max } = room.boundingBox;
  return [Math.abs(max.x - min.x), Math.abs(max.y - min.y), Math.abs(max.z - min.z)];
}

export function RoomFloorSystem({ rooms }: { readonly rooms: readonly InteriorRoom[] }) {
  return (
    <group name="Interior floor generator">
      {rooms.map((room) => {
        const [width, , depth] = roomSize(room);
        const [x, y, z] = roomCenter(room);

        return (
          <mesh key={room.id} position={[x, y, z]} receiveShadow name={`interior-floor-${room.id}`}>
            <boxGeometry args={[width, 0.08, depth]} />
            <meshStandardMaterial {...INTERIOR_MATERIALS[floorMaterialName(room.floorMaterial)]} />
          </mesh>
        );
      })}
    </group>
  );
}

export function RoomWallSystem({ rooms }: { readonly rooms: readonly InteriorRoom[] }) {
  const thickness = 0.14;
  const enclosedRooms = rooms.filter((room) => room.futureEnergyConsumption.zone !== "outdoor");

  return (
    <group name="Interior wall generator">
      {enclosedRooms.map((room) => {
        const { min, max } = room.boundingBox;
        const width = Math.abs(max.x - min.x);
        const depth = Math.abs(max.z - min.z);
        const height = Math.min(room.ceilingHeight, room.id === "gf-foyer" || room.id === "gf-staircase" ? room.ceilingHeight : 2.85);
        const centerY = min.y + height / 2;
        const northSouthSize: [number, number, number] = [width, height, thickness];
        const eastWestSize: [number, number, number] = [thickness, height, depth];

        return (
          <group key={room.id} name={`room-object-${room.id}`}>
            <mesh position={[(min.x + max.x) / 2, centerY, min.z]} castShadow receiveShadow>
              <boxGeometry args={northSouthSize} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.partitionWall} />
            </mesh>
            <mesh position={[(min.x + max.x) / 2, centerY, max.z]} castShadow receiveShadow>
              <boxGeometry args={northSouthSize} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.partitionWall} />
            </mesh>
            <mesh position={[min.x, centerY, (min.z + max.z) / 2]} castShadow receiveShadow>
              <boxGeometry args={eastWestSize} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.partitionWall} />
            </mesh>
            <mesh position={[max.x, centerY, (min.z + max.z) / 2]} castShadow receiveShadow>
              <boxGeometry args={eastWestSize} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.partitionWall} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function CeilingSystem({ rooms }: { readonly rooms: readonly InteriorRoom[] }) {
  const enclosedRooms = rooms.filter((room) => room.futureEnergyConsumption.zone !== "outdoor");

  return (
    <group name="Interior ceiling generator">
      {enclosedRooms.map((room) => {
        const { min, max } = room.boundingBox;
        const width = Math.abs(max.x - min.x);
        const depth = Math.abs(max.z - min.z);
        const ceilingY = max.y - 0.035;
        const material = room.floorMaterial === "acoustic-floor" ? INTERIOR_MATERIALS.acousticCeiling : INTERIOR_MATERIALS.ceiling;
        const recessDrop = room.id.includes("kitchen") ? 0.18 : room.id.includes("living") || room.id.includes("lounge") ? 0.12 : 0.08;

        return (
          <group key={`ceiling-${room.id}`} name={`ceiling-${room.id}`}>
            <mesh position={[(min.x + max.x) / 2, ceilingY, (min.z + max.z) / 2]} receiveShadow>
              <boxGeometry args={[width, 0.07, depth]} />
              <meshStandardMaterial {...material} />
            </mesh>
            <mesh position={[(min.x + max.x) / 2, ceilingY - recessDrop, min.z + 0.16]} castShadow>
              <boxGeometry args={[width, 0.12, 0.18]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.ceiling} />
            </mesh>
            <mesh position={[(min.x + max.x) / 2, ceilingY - recessDrop, max.z - 0.16]} castShadow>
              <boxGeometry args={[width, 0.12, 0.18]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.ceiling} />
            </mesh>
            <mesh position={[min.x + 0.16, ceilingY - recessDrop, (min.z + max.z) / 2]} castShadow>
              <boxGeometry args={[0.18, 0.12, depth]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.ceiling} />
            </mesh>
            <mesh position={[max.x - 0.16, ceilingY - recessDrop, (min.z + max.z) / 2]} castShadow>
              <boxGeometry args={[0.18, 0.12, depth]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.ceiling} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function DoorLeaf({ door }: { readonly door: InteriorDoorSpec }) {
  const isGlass = door.type === "sliding-glass";
  const isMetal = door.type === "garage";
  const isHidden = door.type === "hidden";

  if (isGlass) {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={door.size} />
        <meshPhysicalMaterial {...INTERIOR_MATERIALS.glass} opacity={0.42} />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={door.size} />
      <meshStandardMaterial {...(isMetal ? INTERIOR_MATERIALS.brushedMetal : isHidden ? INTERIOR_MATERIALS.partitionWall : INTERIOR_MATERIALS.doorWood)} />
    </mesh>
  );
}

export function InteriorDoorSystem() {
  return (
    <group name="Interior door generator">
      {INTERIOR_DOORS.map((door) => {
        const [width, height, depth] = door.size;

        return (
          <group key={door.id} position={door.position} rotation={door.rotation} name={`door-${door.id}`}>
            <DoorLeaf door={door} />
            <mesh position={[0, height / 2 + 0.05, depth / 2 + 0.02]} castShadow>
              <boxGeometry args={[width + 0.22, 0.1, 0.1]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
            </mesh>
            <mesh position={[-width / 2 - 0.06, 0, depth / 2 + 0.02]} castShadow>
              <boxGeometry args={[0.1, height + 0.12, 0.1]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
            </mesh>
            <mesh position={[width / 2 + 0.06, 0, depth / 2 + 0.02]} castShadow>
              <boxGeometry args={[0.1, height + 0.12, 0.1]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
            </mesh>
            {door.type === "pocket" || door.type === "sliding-glass" ? (
              <mesh position={[0, -height / 2 - 0.04, depth / 2 + 0.06]} castShadow>
                <boxGeometry args={[width + 0.42, 0.08, 0.14]} />
                <meshStandardMaterial {...INTERIOR_MATERIALS.brushedMetal} />
              </mesh>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function WindowPanel({ windowSpec }: { readonly windowSpec: InteriorWindowSpec }) {
  if (windowSpec.type === "skylight") {
    return (
      <mesh receiveShadow>
        <boxGeometry args={windowSpec.size} />
        <meshPhysicalMaterial {...INTERIOR_MATERIALS.glass} opacity={0.48} />
      </mesh>
    );
  }

  return (
    <mesh receiveShadow>
      <boxGeometry args={windowSpec.size} />
      <meshPhysicalMaterial {...INTERIOR_MATERIALS.glass} />
    </mesh>
  );
}

export function InteriorWindowSystem() {
  return (
    <group name="Interior window opening generator">
      {INTERIOR_WINDOWS.map((windowSpec) => {
        const [width, height, depth] = windowSpec.size;
        const horizontal = width >= depth;

        return (
          <group key={windowSpec.id} position={windowSpec.position} rotation={windowSpec.rotation} name={`window-opening-${windowSpec.id}`}>
            <WindowPanel windowSpec={windowSpec} />
            <mesh position={[0, horizontal ? height / 2 + 0.04 : 0, horizontal ? depth / 2 + 0.02 : height / 2 + 0.04]} castShadow>
              <boxGeometry args={horizontal ? [width + 0.16, 0.08, 0.08] : [0.08, 0.08, depth + 0.16]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
            </mesh>
            <mesh position={[0, horizontal ? -height / 2 - 0.04 : 0, horizontal ? depth / 2 + 0.02 : -height / 2 - 0.04]} castShadow>
              <boxGeometry args={horizontal ? [width + 0.16, 0.08, 0.08] : [0.08, 0.08, depth + 0.16]} />
              <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function StructuralSystem() {
  const columns: readonly [number, number, number, number][] = [
    [-3.2, 2.2, 1.85, 4.1],
    [1.0, 2.2, 1.85, 4.1],
    [-8.65, 1.6, 0.35, 3.0],
    [8.65, 1.6, -0.85, 3.0],
    [-3.95, 5.9, -1.2, 3.0],
    [2.5, 5.9, -1.2, 3.0],
  ];

  const beams: readonly [number, number, number, number, number, number][] = [
    [-3.2, 3.72, 1.85, 8.5, 0.18, 0.24],
    [2.2, 3.52, -1.2, 7.2, 0.18, 0.24],
    [-5.8, 7.28, 0.8, 5.4, 0.18, 0.22],
    [2.6, 7.12, -1.2, 7.0, 0.18, 0.22],
  ];

  return (
    <group name="Interior structural realism">
      {columns.map(([x, y, z, height], index) => (
        <mesh key={`interior-column-${index}`} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[0.22, height, 0.22]} />
          <meshStandardMaterial {...INTERIOR_MATERIALS.brushedMetal} />
        </mesh>
      ))}
      {beams.map(([x, y, z, width, height, depth], index) => (
        <mesh key={`interior-beam-${index}`} position={[x, y, z]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial {...INTERIOR_MATERIALS.partitionWall} />
        </mesh>
      ))}
    </group>
  );
}

export function FloatingStaircase() {
  return (
    <group name="Luxury floating staircase" position={[-2.78, 0.58, -1.15]}>
      {Array.from({ length: 17 }, (_, index) => (
        <mesh key={`floating-step-${index}`} position={[0.12 * index, index * 0.23, index * 0.18]} castShadow receiveShadow>
          <boxGeometry args={[1.72, 0.09, 0.42]} />
          <meshStandardMaterial {...INTERIOR_MATERIALS.marbleFloor} />
        </mesh>
      ))}
      <mesh position={[1.25, 2.0, 1.45]} rotation={[0.32, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 4.2, 0.12]} />
        <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
      </mesh>
      <mesh position={[-0.82, 2.35, 1.1]} rotation={[0.32, 0, 0]} receiveShadow>
        <boxGeometry args={[0.08, 3.9, 0.08]} />
        <meshPhysicalMaterial {...INTERIOR_MATERIALS.glass} opacity={0.3} />
      </mesh>
      <mesh position={[1.05, 2.35, 1.1]} rotation={[0.32, 0, 0]} receiveShadow>
        <boxGeometry args={[0.08, 3.9, 0.08]} />
        <meshPhysicalMaterial {...INTERIOR_MATERIALS.glass} opacity={0.3} />
      </mesh>
    </group>
  );
}

export function ElevatorShaft() {
  return (
    <group name="Luxury residential elevator shaft">
      <mesh position={[-0.2, 3.9, -0.75]} castShadow receiveShadow>
        <boxGeometry args={[1.42, 7.45, 1.82]} />
        <meshPhysicalMaterial {...INTERIOR_MATERIALS.glass} opacity={0.22} />
      </mesh>
      <mesh position={[-0.2, 0.22, -0.75]} receiveShadow>
        <boxGeometry args={[1.62, 0.2, 2.02]} />
        <meshStandardMaterial {...INTERIOR_MATERIALS.polishedConcrete} />
      </mesh>
      <mesh position={[-0.2, 7.86, -0.75]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 0.34, 2.22]} />
        <meshStandardMaterial {...INTERIOR_MATERIALS.brushedMetal} />
      </mesh>
      <mesh position={[-0.2, 8.2, -0.75]} castShadow receiveShadow name="machine-room-ready-cap">
        <boxGeometry args={[2.1, 0.42, 2.5]} />
        <meshStandardMaterial {...INTERIOR_MATERIALS.blackMetal} />
      </mesh>
    </group>
  );
}

export function RoomDetectionLayer({ rooms, eventBus }: { readonly rooms: readonly InteriorRoom[]; readonly eventBus: EventBus }) {
  return (
    <group name="Automatic room detection volumes">
      {rooms.map((room) => {
        const [width, height, depth] = roomSize(room);
        const { min, max } = room.boundingBox;

        return (
          <mesh
            key={`detector-${room.id}`}
            position={[(min.x + max.x) / 2, min.y + height / 2, (min.z + max.z) / 2]}
            name={`room-detector-${room.id}`}
            onPointerMove={(event) => {
              event.stopPropagation();
              eventBus.emit("ROOM_SELECTED", { roomId: room.id });
              eventBus.emit("SELECTION_CHANGED", { kind: "room", id: room.id });
            }}
            onClick={(event) => {
              event.stopPropagation();
              eventBus.emit("ROOM_SELECTED", { roomId: room.id });
              eventBus.emit("SELECTION_CHANGED", { kind: "room", id: room.id });
              eventBus.emit("CAMERA_FOCUS_REQUESTED", { roomId: room.id, ...room.cameraFocus });
            }}
          >
            <boxGeometry args={[width, height, depth]} />
            <meshBasicMaterial {...INTERIOR_MATERIALS.roomDetection} />
          </mesh>
        );
      })}
    </group>
  );
}
