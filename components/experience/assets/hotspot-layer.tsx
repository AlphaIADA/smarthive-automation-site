"use client";

import { Html } from "@react-three/drei";
import type { EventBus } from "@/lib/experience/event-bus";
import { EXPERIENCE_HOTSPOTS, HOTSPOT_TYPE_COLORS } from "@/lib/experience/assets/hotspots";
import { useModelAssetStore } from "@/lib/experience/stores";
import type { ExperienceHotspot } from "@/types/experience";

function focusPosition(hotspot: ExperienceHotspot) {
  return {
    x: hotspot.position.x + 2.2,
    y: hotspot.position.y + 1.1,
    z: hotspot.position.z + 3.2,
  };
}

export function HotspotLayer({ eventBus }: { readonly eventBus: EventBus }) {
  const selectedHotspotId = useModelAssetStore((state) => state.selectedHotspotId);
  const selectHotspot = useModelAssetStore((state) => state.selectHotspot);

  return (
    <group name="SmartHive GLB smart-device hotspots">
      {EXPERIENCE_HOTSPOTS.map((hotspot) => {
        const selected = selectedHotspotId === hotspot.id;
        const color = HOTSPOT_TYPE_COLORS[hotspot.type];

        return (
          <Html
            key={hotspot.id}
            position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}
            center
            distanceFactor={9}
            zIndexRange={[30, 10]}
          >
            <button
              type="button"
              aria-label={`Inspect ${hotspot.label}`}
              onClick={(event) => {
                event.stopPropagation();
                selectHotspot(hotspot);
                eventBus.emit("DEVICE_SELECTED", { deviceId: hotspot.id });
                eventBus.emit("SELECTION_CHANGED", { kind: "device", id: hotspot.id });
                eventBus.emit("CAMERA_FOCUS_REQUESTED", {
                  roomId: hotspot.roomId,
                  position: focusPosition(hotspot),
                  target: hotspot.position,
                });
              }}
              className={`group relative grid size-10 place-items-center rounded-full border text-[9px] font-bold shadow-2xl transition ${
                selected ? "scale-110 border-white bg-white text-slate-950" : "border-white/35 bg-slate-950/75 text-white hover:scale-105 hover:border-white"
              }`}
              style={{ boxShadow: `0 0 28px ${color}66` }}
            >
              <span aria-hidden className="absolute inset-[-5px] rounded-full border border-white/10" style={{ background: `${color}18` }} />
              <span className="relative">{hotspot.icon}</span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}
