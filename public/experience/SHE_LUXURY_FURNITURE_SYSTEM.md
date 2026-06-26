# SmartHive Experience Engine

## Milestone 6 - Luxury Furniture System

Milestone 6 populates the SmartHive Signature Villa with premium reusable furniture and passive equipment models.

Everything is procedural. No GLB files, downloaded models, smart device logic, AI, CCTV, automation, or lighting logic were added.

## Scope

- Experience Engine only.
- Exterior architecture remains preserved.
- Interior architecture remains preserved.
- Luxury interior finish system remains preserved.
- No authentication, database, API, quotation, PDF export, or landing page changes.

## Deliverables

- Luxury Furniture Library
- Scene Population System
- Furniture Registry
- Performance Report
- Asset Statistics

## Furniture Library

Reusable furniture templates are implemented in `lib/experience/furniture/furniture-assets.ts`.

The library includes:

- Luxury sofas
- Accent chairs
- Coffee tables
- Side tables
- TV consoles
- Passive 85-inch TV panels
- Passive soundbars and speaker towers
- Area rugs
- Designer lamp objects without lighting logic
- Plants and decor
- Eight-seat dining table
- Dining chairs
- Passive pendant objects
- Buffet console
- Kitchen cabinets
- Bar chairs
- Refrigerator
- Wine cooler
- Microwave
- Oven
- Dishwasher
- Coffee machine
- Sink
- Extractor hood
- King and queen beds
- Headboards
- Night stands
- Passive reading lamp objects
- Wardrobes
- Dressing table
- End-of-bed bench
- Executive desk
- Study desks
- Office chairs
- Bookshelves
- Meeting table
- Cinema recliners
- Projector
- Large cinema screen
- Fitness equipment
- Outdoor loungers
- Outdoor dining
- Fire pit object
- Outdoor kitchen
- Garden benches
- Bathroom stools
- Laundry and utility furniture
- Prayer rug
- Circulation benches

## Scene Population System

Furniture placement is implemented in `lib/experience/furniture/furniture-registry.ts`.

Placements are generated from the existing room registry and preserve room IDs, room names, floor level positions, and future interaction metadata.

Every placement includes:

- Stable placement ID
- Reusable asset ID
- Room ID
- Room name
- Category
- Position
- Rotation
- Scale
- Future drag readiness
- Future configuration readiness
- Future quote readiness
- Explicit constraints excluding smart devices, AI, automation, CCTV, and lighting logic

## Room Coverage

The furniture registry populates every interior room object from Milestone 3, including:

- Living rooms
- Dining
- Kitchens
- Pantry
- Wine cellar
- Laundry
- Bedrooms
- Bathrooms
- Prayer room
- Cinema
- Gym
- Office
- Storage
- Utility room
- Staircase
- Elevator shaft
- Garage connection
- Patio
- Balconies
- Terraces
- Library
- Study area
- Upper circulation bridge

## PBR System

Furniture materials are implemented in `lib/experience/furniture/furniture-materials.ts`.

Every furniture material defines:

- Color
- Roughness
- Metalness
- Normal strength
- AO intensity
- Reflection intensity
- Clearcoat where applicable
- Transmission where applicable

The renderer creates cached procedural texture maps at runtime:

- Normal maps
- Roughness maps
- Ambient occlusion maps

## Renderer

The renderer is implemented in:

- `components/experience/furniture/luxury-furniture-system.tsx`
- `components/experience/furniture/generators/furniture-renderer.tsx`

Supported reusable geometry primitives:

- Box
- Cylinder
- Sphere

Furniture renders through instanced mesh batches grouped by primitive shape and material. This keeps the detailed furniture registry available for future interaction while reducing runtime draw calls.

All furniture batches are shadow-enabled and use shared PBR materials.

## Passive Equipment Rule

The following items are modeled only as passive furniture or equipment:

- TVs
- Sound system
- Projector
- Speakers
- Appliances
- Lamp objects
- Pendant objects

They do not contain smart-device behavior, automation state, AI logic, CCTV logic, or lighting control logic.

## Asset Statistics

Live asset statistics are exported from `FURNITURE_ASSET_STATISTICS`:

- Material count
- Reusable asset template count
- Placement count
- Populated room count
- Reusable asset count
- Approximate triangle count
- Categories

## Performance Report

The furniture system is performance-oriented:

- No external assets.
- Reusable template library.
- Instanced mesh batching by shape and material.
- Shared material registry.
- Cached procedural PBR maps.
- Low-poly primitive geometry.
- LOD metadata on every asset.
- Future interaction metadata without runtime interaction systems.
- No physics.
- No automation.

## Stop Point

Milestone 6 stops after furniture population.

Not implemented:

- Smart devices
- AI
- Automation
- CCTV
- Lighting logic
