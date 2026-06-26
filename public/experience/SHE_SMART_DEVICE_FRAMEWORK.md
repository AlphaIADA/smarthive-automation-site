# SmartHive Experience Engine

## Milestone 7 - Smart Device Framework

Milestone 7 transforms the SmartHive Signature Villa into a Digital Twin by introducing a complete smart device framework.

This milestone does not implement automation logic, AI, animation, device control behavior, database writes, or HTTP API routes.

## Scope

- Experience Engine only.
- Authentication remains untouched.
- Quotation Engine remains untouched.
- PDF Generator remains untouched.
- Landing website remains untouched.
- Existing API routes remain untouched.
- Database remains untouched.
- Exterior, interior, finishes, and furniture remain preserved.

## Device Framework

The framework is implemented in `lib/experience/devices`.

Core files:

- `smart-device.ts`
- `device-registry.ts`
- `device-catalog.ts`
- `device-api.ts`
- `device-search.ts`

Every concrete device is a `RegisteredSmartDevice`, which inherits from the common `SmartDevice` base class.

Every device exposes:

- Unique ID
- Name
- Category
- Manufacturer
- Model
- Firmware version
- Room ID and room name
- Power state
- Health status
- Battery status where applicable
- Signal strength
- Online status
- Installation price
- Equipment price
- Warranty
- Power consumption
- Future automation hooks
- 3D placeholder metadata
- SVG icon placeholder metadata

## Device Categories

The framework includes all requested categories:

- Lighting
- Switches
- Sockets
- Curtains
- Blinds
- Thermostats
- HVAC
- CCTV
- Doorbells
- Smart Locks
- Motion Sensors
- Door Sensors
- Window Sensors
- Smoke Detector
- Gas Detector
- Water Leak Sensor
- Temperature Sensor
- Humidity Sensor
- IR Blaster
- Smart Hub
- Voice Assistant
- Garage Controller
- Gate Controller
- Pool Controller
- Garden Irrigation
- Solar Inverter
- Battery Storage
- UPS
- EV Charger
- Smart TV
- Audio System
- Coffee Machine
- Dishwasher
- Refrigerator
- Water Heater
- Smart Mirror

## Room Registry Integration

Each existing room from the Milestone 3 room registry receives a room-level device registry.

The original room registry is not modified. Device mapping is stored separately in:

- `ROOM_DEVICE_REGISTRIES`
- `ROOM_DEVICE_REGISTRY_BY_ID`
- `getRoomDeviceRegistry(roomId)`

Each room registry contains:

- Room ID
- Room name
- Device list
- Category counts

## Central Device Registry

The central registry is implemented by `SmartDeviceRegistry`.

All framework devices auto-register into:

- `CENTRAL_DEVICE_REGISTRY`

The registry supports:

- Register
- Remove
- Get device
- List all devices
- List by room
- List by category
- Build room registries

## Internal Device API

The internal TypeScript API is implemented in `device-api.ts`.

Available internal methods:

- `register(device)`
- `remove(deviceId)`
- `enable(deviceId)`
- `disable(deviceId)`
- `rename(deviceId, name)`
- `moveRoom(deviceId, roomId, roomName)`
- `futureAutomation(deviceId)`

These methods are not HTTP endpoints and are not connected to user-facing device control.

## 3D Placeholders

The scene layer is implemented in:

- `components/experience/devices/smart-device-framework.tsx`
- `components/experience/devices/generators/device-placeholder-renderer.tsx`

Placeholders are:

- Procedural
- Instanced by category and shape
- Colored by device category
- Shadow-enabled
- Clickable for inspection only
- Ready for future 3D model replacement

No animation or device behavior is implemented.

## SVG Icons

Professional SVG device icons are implemented in:

- `components/experience/devices/device-icons.tsx`

Icons are used by:

- Device search results
- Device inspector
- Image placeholder state

## Device Inspector

The inspector is implemented in:

- `components/experience/devices/device-inspector-panel.tsx`

Clicking a 3D device placeholder or search result selects the device and shows:

- Device name
- SVG image placeholder
- Specifications
- Manufacturer
- Model
- Firmware
- Warranty
- Power state
- Power consumption
- Connectivity
- Online status
- Health
- Signal strength
- Equipment price
- Installation cost
- Future automation hook counts

## Device Search And Filtering

Global search and filtering are implemented in:

- `device-search.ts`
- `DeviceInspectorPanel`

Filters:

- Query
- Category
- Manufacturer
- Room
- Online
- Offline

## Explicit Exclusions

Not implemented in Milestone 7:

- Automation logic
- AI
- Animation
- Device control interaction
- CCTV feeds
- Lighting logic
- Database persistence
- HTTP API routes
- Quotation updates
- PDF updates

## Stop Point

Milestone 7 stops after the smart device framework, room registry integration, inspector, search, filtering, and 3D placeholders.
