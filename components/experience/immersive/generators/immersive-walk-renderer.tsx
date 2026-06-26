"use client";

import { GUIDED_TOUR_STOPS, IMMERSIVE_COLLISION_VOLUMES, IMMERSIVE_INTERACTION_TARGETS } from "@/lib/experience/immersive";
import { useImmersiveWalkStore } from "@/lib/experience/stores";
import type { ImmersiveCollisionKind } from "@/types/experience";

const COLLISION_COLORS: Record<ImmersiveCollisionKind, string> = {
  wall: "#ffffff",
  door: "#ffd36e",
  furniture: "#d8b35f",
  glass: "#72d8ff",
  pool: "#62d9ff",
  stairs: "#cdd5df",
  elevator: "#b48cff",
};

function TourStopMarker({ index, active }: { readonly index: number; readonly active: boolean }) {
  const stop = GUIDED_TOUR_STOPS[index];
  const { position } = stop.pose;

  return (
    <group
      name={`immersive-tour-stop-${stop.id}`}
      position={[position.x, position.y + 0.08, position.z]}
      userData={{
        guidedTour: true,
        stopId: stop.id,
        label: stop.label,
        aiNarrationReady: stop.aiNarrationReady,
      }}
    >
      <mesh>
        <sphereGeometry args={[active ? 0.2 : 0.13, 16, 12]} />
        <meshBasicMaterial color={active ? "#ffffff" : "#8ff0c7"} transparent opacity={active ? 0.92 : 0.62} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[active ? 0.56 : 0.36, 0.012, 8, 48]} />
        <meshBasicMaterial color={active ? "#ffffff" : "#8ff0c7"} transparent opacity={active ? 0.52 : 0.28} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CollisionPreview() {
  const mode = useImmersiveWalkStore((state) => state.mode);
  const collisionEnabled = useImmersiveWalkStore((state) => state.collisionEnabled);

  if (!collisionEnabled || mode === "orbit") return null;

  return (
    <group name="immersive-collision-preview">
      {IMMERSIVE_COLLISION_VOLUMES.filter((volume) => volume.kind !== "wall").slice(0, 80).map((volume) => (
        <mesh
          key={volume.id}
          position={volume.position}
          name={volume.id}
          userData={{
            immersiveCollision: true,
            kind: volume.kind,
            label: volume.label,
            roomId: volume.roomId,
            blocksWalk: volume.blocksWalk,
            blocksFly: volume.blocksFly,
          }}
        >
          <boxGeometry args={volume.size} />
          <meshBasicMaterial color={COLLISION_COLORS[volume.kind]} transparent opacity={volume.kind === "pool" ? 0.11 : 0.045} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function InteractionTargets() {
  const lastInteraction = useImmersiveWalkStore((state) => state.lastInteraction);

  return (
    <group name="immersive-interaction-targets">
      {IMMERSIVE_INTERACTION_TARGETS.slice(0, 22).map((target) => (
        <mesh
          key={target.id}
          position={target.position}
          name={target.id}
          userData={{
            immersiveInteraction: true,
            kind: target.kind,
            label: target.label,
            radiusMeters: target.radiusMeters,
            animationReady: target.animationReady,
          }}
        >
          <sphereGeometry args={[target.kind === "elevator" ? 0.16 : 0.08, 12, 8]} />
          <meshBasicMaterial color={lastInteraction?.includes(target.label) ? "#ffffff" : target.kind === "elevator" ? "#b48cff" : "#ffd36e"} transparent opacity={0.42} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function ImmersiveWalkRenderer() {
  const tourIndex = useImmersiveWalkStore((state) => state.tourIndex);
  const mode = useImmersiveWalkStore((state) => state.mode);

  return (
    <group
      name="SmartHive Immersive Walk Renderer"
      userData={{
        milestone: 17,
        mode,
        guidedTourStops: GUIDED_TOUR_STOPS.length,
        collisionVolumes: IMMERSIVE_COLLISION_VOLUMES.length,
        interactionsReady: true,
      }}
    >
      {GUIDED_TOUR_STOPS.map((stop, index) => (
        <TourStopMarker key={stop.id} index={index} active={index === tourIndex && mode === "guided-tour"} />
      ))}
      <CollisionPreview />
      <InteractionTargets />
    </group>
  );
}
