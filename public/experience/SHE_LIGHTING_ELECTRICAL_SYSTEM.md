# SmartHive Experience Engine - Milestone 8

## Lighting and Electrical System

Milestone 8 adds a browser-based smart lighting and electrical engine to the SmartHive Signature Villa. The work remains inside the Experience Engine and does not modify authentication, database, API routes, PDF export, landing pages, exterior architecture, interior architecture, smart devices, or the existing quotation engine.

## System Scope

- 185 procedural lighting fixtures
- 40 reusable switch controls
- 93 reusable socket outlets
- 9 room light groups
- 32 capped real Three.js light sources for performance
- 14 lighting types covered
- 8 switch types covered
- 6 socket types covered

## Lighting Types

The engine includes downlights, pendant lights, track lights, wall lights, garden lights, pool lights, LED strip lights, stair lights, ceiling lights, emergency lights, decorative lights, cabinet lights, mirror lights, and spotlights.

Each fixture exposes:

- Intensity
- Brightness
- Temperature
- Colour
- Power
- Consumption
- Beam angle
- Falloff
- Shadow quality
- PBR rendering metadata
- Future grouping and automation hooks without automation logic

## Electrical Hardware

Switches include 1 gang, 2 gang, 3 gang, 4 gang, dimmer, scene switch hardware, touch switch, and wireless switch.

Sockets include normal socket, USB socket, smart socket, outdoor socket, UPS socket, and solar socket.

Scene switch is treated as a physical keypad type only. No lighting scenes, automation rules, AI, or voice behavior has been implemented.

## Room Light Groups

The engine provides lighting groups for:

- Living Room
- Kitchen
- Dining
- Bedrooms
- Cinema
- Gym
- Garden
- Garage
- Pool

Group membership is editable per fixture in the Experience inspector. The grouping system is future-ready for automation, but automation remains excluded.

## Controls

The inspector supports:

- Toggle
- Brightness slider
- Colour picker
- Temperature slider
- Group reassignment
- Rename

Controls are stored in the Experience Engine lighting store and applied to the 3D fixture renderer and power model.

## Power System

The live power calculator reports:

- Current consumption: 6.293A
- Active lighting and standby load: 1,452.46W
- Estimated monthly usage: 269.73kWh
- Peak connected load: 157,384.57W

The peak load includes socket-rated connected capacity, while active wattage reflects lighting consumption plus switch/socket standby draw.

## Internal Quote Model

The lighting system includes an internal Experience Engine quote summary:

- Equipment: calculated from generated fixture, switch, and socket selections
- Installation: calculated per generated element
- Labour: calculated per generated element
- Total: $73,650

The existing quotation engine is untouched. This milestone only exposes lighting/electrical quote data inside `lib/experience/lighting` for future integration.

## Realistic Effects

The renderer supports:

- Soft shadow metadata
- Bounce light metadata
- Reflection metadata
- HDR-ready colors
- Bloom-ready emissive fixtures
- Volumetric-ready fixture definitions

For browser performance, all fixtures are rendered as instanced geometry, and real light sources are capped at 32. Only the first premium light sources can cast optimized 512px shadows.

## Performance Design

- Full fixture inventory uses instanced meshes.
- Real lights are capped to preserve the 60 FPS target.
- Fixture placeholders are grouped by reusable shape and lighting type.
- Light controls update instance matrices and colors without rebuilding the villa.
- Automatic LOD, occlusion readiness, shadow optimization, and geometry reuse are represented in engine metadata.

## Deliverables

- `types/experience/lighting.ts`
- `lib/experience/lighting/lighting-catalog.ts`
- `lib/experience/lighting/lighting-controls.ts`
- `lib/experience/lighting/lighting-power.ts`
- `lib/experience/stores/lighting-store.ts`
- `components/experience/lighting/smart-lighting-engine.tsx`
- `components/experience/lighting/generators/lighting-renderer.tsx`
- `components/experience/lighting/lighting-control-panel.tsx`

## Explicit Exclusions

- No AI
- No lighting scene logic
- No voice control
- No automation logic
- No existing quotation engine changes
- No API changes
- No database changes
