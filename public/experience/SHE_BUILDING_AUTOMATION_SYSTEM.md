# SmartHive Experience Engine - Milestone 10

## Building Automation System

Milestone 10 adds the SmartHive Building Automation System (BAS), the rule-based brain of the SmartHive Signature Villa Digital Twin. The implementation remains inside the Experience Engine and does not modify authentication, database, API routes, PDF export, landing pages, or external services.

## System Scope

- 957 BAS-connected endpoints
- 415 smart-device framework endpoints
- 318 lighting/electrical endpoints
- 151 security platform endpoints
- 73 room, energy, weather, internet, and virtual endpoints
- 13 automation domains covered
- 4 starter automation rules
- 4 automation graphs
- 9 scene presets
- 7 scheduler definitions
- 100% fail-safe coverage for starter rules

## Connected Domains

BAS connects:

- Lighting: 296 endpoints
- Curtains: 20 endpoints
- HVAC: 100 endpoints
- Audio: 20 endpoints
- Security: 268 endpoints
- Energy: 169 endpoints
- Pool: 2 endpoints
- Garden: 3 endpoints
- Garage: 2 endpoints
- Gate: 3 endpoints
- Water: 19 endpoints
- Appliances: 5 endpoints
- Future Devices: 50 endpoints

Every generated smart device from the Smart Device Framework is adapted into a BAS endpoint.

## Automation Engine

The automation engine supports:

- IF
- ELSE
- AND
- OR
- NOT
- Delay
- Timer
- Schedule
- Sunrise
- Sunset
- Presence
- Absence
- Device State
- Sensor State
- Weather
- Temperature
- Humidity
- Power Consumption
- Battery Level
- Internet Status

The current implementation is a deterministic rules engine with explicit fail-safe results. It does not use AI.

## Rule Engine

The rule engine is designed for unlimited future rules. Starter rules include:

- Evening Arrival Welcome
- Away Mode Security
- Energy Peak Protection
- Water Leak Fail Safe

Each rule contains:

- Trigger
- Condition expression
- Actions
- Else branch support
- Fail-safe strategy
- Automation graph mapping

## Automation Graph

Every automation rule is converted into a graph:

Trigger -> Condition -> Logic -> Action -> Fail Safe

The graph model is visual-editor ready and represented in the BAS inspector panel. The 3D scene includes a lightweight BAS brain hub with connected domain nodes.

## Scene Engine

Scenes include:

- Movie
- Party
- Dinner
- Morning
- Night
- Away
- Vacation
- Emergency
- Custom Scene

Scenes are graph-ready and expose grouped BAS actions. Custom scene support is modeled for future editing.

## Scheduler

Scheduler support includes:

- Cron
- Calendar
- Weekly
- Monthly
- Yearly
- Holiday
- Randomized

Schedules target rules or scenes and include holiday-calendar and randomized-window metadata where applicable.

## Fail Safe

Every starter automation has a fail-safe strategy:

- Skip Action
- Fallback State
- Notify Only
- Retry Once
- Disable Rule ready

The rule engine returns `success`, `skipped`, or `failed-gracefully` without throwing into the UI when an endpoint is missing or a condition does not match.

## Deliverables

- `types/experience/automation.ts`
- `lib/experience/automation/bas-registry.ts`
- `lib/experience/automation/bas-rule-engine.ts`
- `lib/experience/automation/bas-scene-engine.ts`
- `lib/experience/automation/bas-scheduler.ts`
- `lib/experience/automation/bas-system.ts`
- `lib/experience/stores/automation-store.ts`
- `components/experience/automation/building-automation-system.tsx`
- `components/experience/automation/generators/bas-network-renderer.tsx`
- `components/experience/automation/bas-dashboard-panel.tsx`

## Explicit Exclusions

- No AI
- No database writes
- No API changes
- No authentication changes
- No external device control
- No cloud service calls
