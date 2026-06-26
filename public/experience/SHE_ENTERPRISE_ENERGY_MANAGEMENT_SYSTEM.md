# SmartHive Experience Engine - Milestone 11

## Enterprise Energy Management System

Milestone 11 adds the Enterprise Energy Management System (EEMS), a real-time energy platform for the SmartHive Signature Villa Digital Twin. The implementation remains inside the Experience Engine and does not modify authentication, database, API routes, PDF export, landing pages, or the existing quotation engine.

## Monitoring Scope

- 415 smart-device monitors
- 38 circuit monitors
- 35 room monitors
- 3 floor monitors
- 1 entire-villa monitor
- 5 power sources
- 35 heatmap rooms
- 169 BAS energy endpoints

The platform monitors every generated Smart Device, every generated circuit, every room, every floor, and the entire villa.

## Calculations

The villa-level energy model calculates:

- Instant consumption: 69,173.09W
- Daily usage: 456.11kWh
- Monthly usage: 13,683.3kWh
- Yearly usage: 166,480.15kWh
- Monthly cost: $2,462.99
- Projected yearly cost: $29,966.43
- Peak demand: 143.57kW
- Power factor: 0.915

All metrics are generated from current Experience Engine smart devices, lighting, security, room baseline energy, circuits, and infrastructure loads.

## Solar and Source System

The source model includes:

- Solar Panels
- Battery Storage
- Grid
- Generator
- UPS
- Automatic Source Switching

Source priority is modeled as Solar -> Battery -> Grid -> Generator -> UPS. The source selector is available in the Experience inspector.

## Power Flow

Animated power-flow paths are rendered for:

- Solar to Battery
- Solar to Grid
- Solar to Devices
- Battery to Devices
- Grid to Devices
- Generator to UPS
- UPS to Devices

Power-flow animation is local Three.js visualization only. It does not call external services.

## Energy Heatmap

Every room is color-coded by energy intensity:

- Low
- Medium
- High
- Critical

The heatmap is rendered as transparent room overlays and can be toggled from the inspector.

## Recommendations

The smart recommendation model recommends:

- Solar Size: 32kW premium monocrystalline array
- Battery Size: 60kWh lithium battery storage
- UPS: 15kVA online UPS for BAS and critical loads
- Circuit Upgrade: high-load kitchen, HVAC, cinema, and utility circuits
- Energy Products: smart meters, CT clamps, source transfer controller, and panel-level monitoring

## Internal Quote Recommendations

The internal Experience Engine energy quote recommends energy products automatically:

- Equipment: $130,700
- Installation: $38,200
- Labour: $20,200
- Total: $189,100

The existing quotation engine is untouched. This milestone exposes local energy quote data under `lib/experience/energy` for future integration.

## Deliverables

- `types/experience/energy.ts`
- `lib/experience/energy/energy-calculations.ts`
- `lib/experience/energy/energy-catalog.ts`
- `lib/experience/stores/energy-store.ts`
- `components/experience/energy/enterprise-energy-management-system.tsx`
- `components/experience/energy/generators/energy-renderer.tsx`
- `components/experience/energy/energy-dashboard-panel.tsx`

## Explicit Exclusions

- No existing quotation engine changes
- No API changes
- No database changes
- No authentication changes
- No external service calls
