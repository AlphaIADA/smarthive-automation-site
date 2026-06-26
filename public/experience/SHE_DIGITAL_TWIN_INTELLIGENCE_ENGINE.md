# SmartHive Experience Engine

## Milestone 15: Digital Twin Intelligence Engine

The SmartHive Experience Engine now includes the SmartHive Digital Twin Intelligence Engine (DTIE).

DTIE synchronizes rooms, devices, sensors, HVAC units, lighting groups, security systems, automation rules, scenes, quotes, projects, customers, furniture, power sources, zones, floors, and the building into one hierarchical virtual environment.

No existing website functionality, API route, database, authentication, external quotation engine, CRM, PDF generator, or landing page was modified.

## Centralized Twin Registry

Generated registry totals:

- Entities: 1,736
- Graph edges: 1,735
- Buildings: 1
- Floors: 3
- Rooms: 35
- Zones: 6
- Devices: 671
- Furniture objects: 197
- Power sources: 26
- Sensors: 307
- HVAC units: 136
- Lighting groups: 9
- Security systems: 320
- Automation rules: 4
- Scenes: 9
- Quotes: 6
- Projects: 5
- Customers: 1
- History entries: 5,208

Every generated entity has:

- UUID
- Stable ID
- Parent UUID
- Child UUIDs
- Transform
- Metadata
- Health
- State
- History

## Object Graph

The DTIE graph follows the requested hierarchy:

```text
Building
├── Floor
│   ├── Room
│   │   ├── Device
│   │   ├── Sensor
│   │   └── Furniture
├── Zones
├── Power Sources
├── Lighting Groups
├── Security Systems
├── Automation Rules
├── Scenes
├── Quotes
├── Projects
└── Customers
```

Graph edges are typed as:

- Contains
- Controls
- Monitors
- Quotes
- Owns
- Configures

## Live State Engine

Supported object states:

- Online
- Offline
- Enabled
- Disabled
- Fault
- Maintenance
- Installation Pending
- Replacement Required

Current generated live-state totals:

- Online: 516
- Fault: 61
- Maintenance: 66
- Replacement required: 17
- Installation pending: 841

## Time Machine

Every entity includes state history for:

- Yesterday
- Today
- Predictive simulation

Time machine features:

- Replay state
- Scrub timeline
- Compare yesterday vs today
- Future predictive simulation ready

Generated comparison:

- Changed entities from yesterday to today: 945
- Fault delta: +61
- Maintenance delta: -78
- Online delta: -26

## Digital Twin API

Internal DTIE API surface:

- `RegisterEntity()`
- `RemoveEntity()`
- `UpdateState()`
- `ReplayState()`
- `CloneScene()`
- `ExportTwin()`
- `ImportTwin()`

These are internal Experience Engine functions. No external route handlers were created.

## Quote Synchronization

DTIE registers selected configurator items and quote entities inside the twin.

- Selected configurator items registered: 889
- Quote entities registered: 6
- Existing quote engine modified: false

## Export

DTIE export payload:

- Format: JSON
- Payload version: `dtie-v1`
- Entity count: 1,736
- Edge count: 1,735
- History entries: 5,208

## Files

- `types/experience/digital-twin.ts`
- `lib/experience/digital-twin/twin-registry.ts`
- `lib/experience/digital-twin/index.ts`
- `lib/experience/stores/digital-twin-store.ts`
- `components/experience/digital-twin/digital-twin-intelligence-engine.tsx`
- `components/experience/digital-twin/generators/digital-twin-renderer.tsx`
- `components/experience/digital-twin/digital-twin-panel.tsx`

## Constraints

- Existing website functionality untouched
- API routes untouched
- Database untouched
- Authentication untouched
- Existing quote engine untouched
- CRM untouched
- PDF generator untouched
- Landing pages untouched
