# SmartHive Experience Engine

## Milestone 13: SmartHive AI Assistant

The SmartHive Signature Villa now includes a local AI Assistant layer that understands the Digital Twin through structured Experience Engine registries.

No authentication, database, API, PDF export, landing page, or existing quotation engine files were modified.

The assistant is implemented without an external LLM provider. It uses deterministic digital-twin knowledge, intent classification, contextual explanation, recommendation detection, savings estimates, and an internal AI quotation draft. The architecture is ready for future model and voice integration.

## Capabilities

The assistant can answer:

- Explain this room
- Explain this device
- Recommend products
- Compare products
- Estimate installation
- Calculate savings
- Explain automation
- Find devices
- Build quotation drafts

## Knowledge Coverage

Generated knowledge totals:

- Rooms: 35
- Smart devices: 415
- Security devices: 151
- Lighting and electrical endpoints: 318
- BAS automation endpoints: 957
- BAS rules: 4
- BAS scenes: 9
- BAS schedules: 7
- Furniture placements: 197
- Knowledge packages: 8
- Quote-ready packages: 5

Knowledge domains:

- Rooms
- Devices
- Automation
- Lighting
- Security
- Energy
- Furniture
- Interior Design
- Quotes
- Packages

## Visual AI

The assistant reads the current Experience Engine selection.

Clicking a room or device updates the Visual AI context. The AI panel can then explain the selected room or device, including:

- Room area
- Room volume
- Floor level
- Room category
- Future device allowance
- Registered devices
- Security endpoints
- Energy profile
- Quote mapping
- Device manufacturer
- Device model
- Firmware
- Connectivity
- Power use
- Warranty
- Installation estimate
- Automation hooks

## AI Recommendations

The assistant detects missing or weak coverage for:

- Missing Devices
- Missing Sensors
- Missing Cameras
- Missing Automation

Current generated AI recommendations: 7.

## AI Quote Builder

The assistant creates an internal quotation draft from Experience Engine packages and AI recommendations.

Generated master AI quote:

- Line items: 12
- Equipment: USD 526,360
- Installation: USD 140,033
- Labour: USD 64,938
- Total: USD 731,331

The external quotation engine remains untouched.

## Savings

The assistant estimates energy savings from lighting schedules, HVAC and curtain automation, smart source switching, and high-load room optimization.

Generated savings model:

- Baseline monthly cost: USD 2,462.99
- Optimized monthly cost: USD 1,773.35
- Monthly savings: USD 689.64
- Yearly savings: USD 8,275.68
- Savings percent: 28%

## Voice Ready

Voice is not implemented yet.

The assistant exposes voice-ready metadata and UI status so a future voice layer can connect without changing the AI knowledge model.

## Files

- `types/experience/ai-assistant.ts`
- `lib/experience/ai/knowledge-base.ts`
- `lib/experience/ai/query-engine.ts`
- `lib/experience/ai/index.ts`
- `lib/experience/stores/ai-assistant-store.ts`
- `components/experience/ai/smarthive-ai-assistant.tsx`
- `components/experience/ai/generators/ai-assistant-renderer.tsx`
- `components/experience/ai/ai-assistant-panel.tsx`

## Constraints

- Existing quotation engine untouched
- API untouched
- Database untouched
- Authentication untouched
- Landing pages untouched
- PDF export untouched
- External LLM provider not required
