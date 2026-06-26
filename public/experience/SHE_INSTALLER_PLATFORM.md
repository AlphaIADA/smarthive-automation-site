# SmartHive Experience Engine

## Milestone 23: Installer Platform

The Installer Platform adds a complete installer ecosystem inside the Experience Engine. It connects the SmartHive Signature Villa, device registries, lighting/electrical plans, customer configuration payloads, estate property records, and SmartHive Cloud readiness into one operational installation layer.

This milestone is payload-only for CRM and backend systems. It does not modify authentication, API routes, database schema, quotation engine, PDF export, landing pages, or external CRM integrations.

## Deliverables

- Installer dashboard
- Project lifecycle workflow
- Room installation mode
- Wiring planner
- Material planner
- Technician app readiness payloads
- Installation reports
- CRM update payload

## Installer Dashboard

The dashboard tracks:

- Projects
- Schedules
- Tasks
- Assigned jobs
- Progress
- Photo metadata
- Completion percentage

The implementation lives in:

- `types/experience/installer.ts`
- `lib/experience/installer/installer-platform.ts`
- `lib/experience/stores/installer-store.ts`
- `components/experience/installer/installer-dashboard-panel.tsx`

## Project Lifecycle

Every installer project follows the required lifecycle:

1. Lead
2. Quotation
3. Approval
4. Planning
5. Installation
6. Testing
7. Handover
8. Maintenance

Lifecycle state is represented as structured Experience Engine data and can be inspected in the right panel. CRM updates are represented as future-ready payloads only.

## Installation Mode

Every room receives an installer checklist with:

- Required devices
- Required materials
- Cable runs
- Labour hours
- Installation notes
- Required checklist items

Room data is derived from the existing Interior Architecture room registry and device registry.

## Wiring Planner

The wiring planner generates:

- Conduit layout
- Cable paths
- Switch locations
- Rack layout
- Power requirements

Wiring data references room locations, lighting loads, switch counts, rack requirements, cable types, conduit sizes, and future-ready metadata.

## Materials

The material planner creates:

- Bill of materials
- Purchase list
- Warehouse status
- Supplier cost
- Retail cost
- Profit margin

Material categories include devices, cable, conduit, rack, switchgear, mounting, consumables, and labour.

## Technician App Ready

The technician payloads support:

- QR codes
- Device registration
- Photo upload metadata
- GPS check-in readiness
- Completion sign-off readiness

No native app, physical device binding, file upload, or GPS service is implemented in this milestone.

## Reports

The installer report layer produces:

- Installation progress report
- Material plan
- Wiring plan
- Handover pack
- Maintenance plan

Reports are structured Experience Engine payloads, not PDF exports.

## Constraints

- External CRM: payload-only
- API routes: untouched
- Database: untouched
- Authentication: untouched
- Existing website functionality: untouched
- Existing quotation/PDF systems: untouched
