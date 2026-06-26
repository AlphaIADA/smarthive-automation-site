# SmartHive Experience GLB Asset Pipeline

## Asset Location

Place production 3D assets in:

```text
public/experience/models/
```

Browser URLs resolve without the `public` prefix:

```text
/experience/models/villa.glb
/experience/models/exterior.glb
/experience/models/living-room.glb
/experience/models/kitchen.glb
/experience/models/master-bedroom.glb
/experience/models/cinema.glb
/experience/models/gym.glb
/experience/models/bathroom.glb
/experience/models/pool-area.glb
```

`villa.glb` is the primary production model. Room chunks are optional and lazy-loaded when their camera preset is active.

## Naming Convention

Use lowercase kebab-case file names:

```text
villa.glb
living-room.glb
master-bedroom.glb
pool-area.glb
```

Keep object names inside Blender/Maya/3ds Max readable and stable:

```text
Room_Living_Walls
Room_Living_Glass
DeviceAnchor_Living_MainSwitch
HotspotAnchor_Kitchen_GasDetector
```

Stable names make future anchor extraction, material overrides, and hotspot validation easier.

## Optimization Guide

Recommended export rules:

- Real-world scale in meters.
- Origin centered near the villa footprint.
- Apply transforms before export.
- Merge static meshes by material where practical.
- Keep glass, emissive lighting, water, vegetation, and interactive anchors as separate named objects.
- Use Draco or Meshopt compression for large assets.
- Use KTX2 or compressed textures where supported by the art pipeline.
- Prefer 2K textures for broad surfaces and 4K only for hero materials.
- Remove hidden construction geometry before export.
- Keep total initial `villa.glb` under 80 MB when possible.
- Move heavy room-specific details to room chunks.

## Hotspot Coordinate Guide

Hotspots are defined in:

```text
lib/experience/assets/hotspots.ts
```

Each hotspot position uses the same world-space meter coordinate system as the GLB:

```ts
position: { x: -5.2, y: 3.22, z: 2.4 }
```

Coordinate workflow:

1. Place an empty/helper object in the DCC scene at the device location.
2. Copy its world position.
3. Add or update the corresponding hotspot entry.
4. Load `/experience`.
5. Click the hotspot and confirm camera focus, room label, and quote mapping.

## Adding New Rooms

1. Export the room as a separate GLB chunk.
2. Place it in `public/experience/models`.
3. Add the file to `ROOM_MODEL_CHUNKS` in `lib/experience/assets/model-manifest.ts`.
4. Map the chunk to one or more camera presets.
5. Add camera presets in `lib/experience/camera-presets.ts` and `types/experience/camera.ts` if needed.
6. Add hotspots for that room in `lib/experience/assets/hotspots.ts`.

## Mapping Hotspots To Quote Items

Each hotspot has a `quoteMapping` block:

```ts
quoteMapping: {
  quoteItemId: "experience-smart-bulb",
  catalogSlug: "smart-bulb",
  configurationItemId: "config-smart-she-gf-formal-living-lighting-1-lighting",
  equipmentPrice: 180,
  installationCost: 120,
  labourCost: 45,
}
```

`catalogSlug` maps to the existing `/api/devices` quote catalog. If it is present, the `/quote` page can prefill that item from the Experience cart. If it is `null`, the item remains quote-ready inside the Experience cart until the catalog receives a matching database row.

`configurationItemId` maps to the internal customer configuration store. If the ID exists, clicking **Add to Quote** also selects that configuration item. Missing IDs are ignored safely.

## Missing Model Behavior

The production loader checks `/experience/models/villa.glb` before parsing it. If the file is missing, `/experience` shows:

```text
Production 3D villa model not installed yet. Upload villa.glb to public/experience/models.
```

The loader does not call the GLTF parser for missing files. The old procedural villa remains available through **Dev Fallback** in the inspector.
