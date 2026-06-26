# SmartHive Experience Engine

## Milestone 16: AI Vision Engine

SmartHive Vision AI adds a deterministic visual-intelligence layer on top of the Digital Twin Intelligence Engine. It does not call external AI services and does not modify website functionality, API routes, database tables, authentication, PDF export, landing pages, or the existing quotation engine.

## Core Capabilities

- Object recognition
- Room recognition
- Furniture recognition
- Lighting recognition
- Security recognition
- Device recognition
- Power recognition

## Room Click Workflow

When a room is selected, Vision AI scans the room and produces:

- Installed device inventory
- Missing device recommendations
- Possible improvements
- Estimated cost
- Installation time
- Energy rating
- Security rating
- Internal quote draft

## Camera Mode

Camera mode is represented by generated detection points for:

- Doors
- Windows
- Furniture
- Electrical points
- Lighting
- Potential camera locations
- Potential sensor locations

The overlay is procedural and uses only lightweight geometry markers.

## Photo Import

Photo import is future ready. The current milestone defines the contract for future room-photo uploads and the planned detection categories. No upload API, database storage, or external vision provider was added.

## Quote Generation

Vision AI can generate a quotation draft directly from room analysis. This is an internal Experience Engine quote payload only.

Existing quote engine modified: `false`

## Implementation Files

- `types/experience/vision-ai.ts`
- `lib/experience/vision-ai/vision-analysis-engine.ts`
- `lib/experience/stores/vision-ai-store.ts`
- `components/experience/vision-ai/smarthive-vision-ai.tsx`
- `components/experience/vision-ai/generators/vision-ai-renderer.tsx`
- `components/experience/vision-ai/vision-ai-panel.tsx`

## Constraints Preserved

- Existing website functionality untouched
- API routes untouched
- Database untouched
- Authentication untouched
- Existing quote engine untouched
- External AI or vision provider not required
