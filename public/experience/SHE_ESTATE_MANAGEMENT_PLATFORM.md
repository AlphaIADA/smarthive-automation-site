# SmartHive Experience Engine

## Milestone 20: Estate Management Platform

The SmartHive Experience Engine now includes an Estate Management Platform that expands SmartHive from one villa to a portfolio model for unlimited properties.

This milestone is Experience Engine only. It does not modify authentication, API routes, the database, CRM backend, quotation engine, PDF generator, landing pages, or existing website functionality.

## Property Types

The estate registry supports:

- Villa
- Apartment
- Duplex
- Penthouse
- Estate
- Office
- Hotel
- School
- Hospital
- Shopping Mall
- Warehouse
- Factory

Each property type is represented by a generated property record with location, customer ownership, status, health score, connectivity, hierarchy, CRM link payloads, and reports.

## Customers

Each customer can own multiple properties.

The current generated customer portfolio includes:

- Ultra Luxury Residential Client
- Palm Estate Owner
- SmartHive Commercial Holdings
- Civic Healthcare and Education Group

Every customer includes:

- CRM profile ID
- Linked property IDs
- Property count
- Active project count
- Open service count
- Warranty asset value
- Maintenance contract value

These are internal Experience Engine CRM link payloads. The external CRM system is untouched.

## Estate Hierarchy

The generated hierarchy follows the requested model:

```text
Estate
-> Blocks
-> Buildings
-> Floors
-> Rooms
-> Devices
```

Every property includes:

- Blocks
- Buildings
- Floors
- Rooms
- Device references
- Building health scores
- Security scores
- Energy scores
- Automation scores

Device references are generated from the existing Universal Smart Device Communication Layer. No real device connections are created.

## Global Dashboard

The global dashboard aggregates:

- Power
- Security
- Automation
- Alerts
- Energy
- Maintenance
- Asset value
- Online properties
- Warning properties
- Critical properties

The dashboard is generated from existing Experience Engine reports and the estate registry.

## Map View

Every property has a map point containing:

- Property ID
- Property type
- Location label
- Latitude
- Longitude
- Status
- Health score
- Connectivity percentage

Scene markers are lightweight Three.js objects with capped visible geometry.

## Role Management

Supported roles:

- Owner
- Installer
- Technician
- Facility Manager
- Security
- Guest
- Tenant

Each role includes:

- Label
- Property scope
- Permission list
- Assigned property IDs

This is an internal Experience Engine policy model. It does not modify authentication.

## CRM Links

Every property contains internal CRM linkage data:

- Customer profile ID
- Project history
- Service history
- Warranty
- Maintenance contract

External CRM modified: `false`

## Reports

Generated report cards:

- Building Health
- Security Score
- Energy Score
- Automation Score
- Maintenance Cost
- Asset Value

Reports can be selected per property from the inspector panel.

## Implementation Files

- `types/experience/estate-management.ts`
- `lib/experience/estate-management/estate-management.ts`
- `lib/experience/estate-management/index.ts`
- `lib/experience/stores/estate-management-store.ts`
- `components/experience/estate-management/estate-management-platform.tsx`
- `components/experience/estate-management/generators/estate-management-renderer.tsx`
- `components/experience/estate-management/estate-management-panel.tsx`

## Constraints Preserved

- Existing website functionality untouched
- Authentication untouched
- API routes untouched
- Database untouched
- External CRM untouched
- Existing quote engine untouched
- PDF generator untouched
- Landing pages untouched
- Real device connections not created
