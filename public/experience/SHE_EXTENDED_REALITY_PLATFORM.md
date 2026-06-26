# SmartHive Experience Engine

## Milestone 21: Extended Reality Platform

The SmartHive Experience Engine now includes an Extended Reality Platform that prepares the digital twin for desktop, mobile, tablet, virtual reality, augmented reality, mixed reality, future Apple Vision Pro, future Meta Quest, and future Android XR experiences.

This milestone is Experience Engine only. It does not start native XR sessions, create browser permission flows, add API routes, modify the database, modify authentication, or change the existing quotation engine.

## Supported Device Classes

- Desktop
- Mobile
- Tablet
- Virtual Reality
- Augmented Reality
- Mixed Reality
- Future Apple Vision Pro
- Future Meta Quest
- Future Android XR

Each device class has:

- Supported modes
- Input source mapping
- Target FPS
- WebXR requirement flag
- Future hardware readiness flag

## XR Modes

Supported modes:

- Desktop Mode
- Touch Mode
- Walk Mode
- VR Mode
- AR Placement Mode
- Presentation Mode
- Client Demo Mode

Each mode includes:

- Supported device classes
- Default quality profile
- Villa scene usage
- Camera tour usage
- Touch UI readiness
- Controller UI readiness
- Voice command readiness

## AR Placement Framework

AR placement anchors are generated from the Customer Configuration Platform device catalog.

Supported AR placement categories:

- Smart Switches
- Curtains
- Sensors
- Cameras
- Door Locks
- Lighting
- Panels
- Thermostats
- Network Rack
- Audio

Every anchor includes:

- Configuration item ID
- Room mapping
- Estimated installation position
- Estimated surface normal
- Placement height
- Install zone radius
- Pricing payload
- Quotation update readiness

No camera session, ARKit, ARCore, WebXR AR session, or native mobile bridge is started in this milestone.

## VR Features

The VR layer builds on the existing Immersive Walk Experience.

Prepared VR features:

- Entire SmartHive Villa explorable
- Teleport
- Walk
- Laser pointer
- Interactive UI
- Voice commands ready
- Left and right controller profiles
- Haptics ready

No physical controller or headset session is started in this milestone.

## Client Presentation Mode

Presentation mode includes:

- Guided demo
- Automatic camera tour
- Interactive hotspots
- Device explanations
- Installation recommendations
- Quotation updates

Presentation steps are linked to guided tour stops and configuration item payloads.

## Performance

Performance profile:

- Desktop target: 60 FPS
- Mobile target: 60 FPS
- VR target: 90 FPS
- Dynamic quality scaling ready
- Foveated rendering ready
- Occlusion ready
- Controller meshes capped
- AR anchors capped

## Quote Update Payload

XR selections produce an internal quotation update payload:

- Selected placement count
- Equipment cost
- Installation cost
- Labour cost
- Total cost

Internal source: `experience-xr-placement-internal-model`

Existing quotation engine modified: `false`

## Implementation Files

- `types/experience/xr.ts`
- `lib/experience/xr/xr-framework.ts`
- `lib/experience/xr/index.ts`
- `lib/experience/stores/xr-store.ts`
- `components/experience/xr/extended-reality-platform.tsx`
- `components/experience/xr/generators/xr-renderer.tsx`
- `components/experience/xr/xr-platform-panel.tsx`

## Constraints Preserved

- Existing website functionality untouched
- Authentication untouched
- API routes untouched
- Database untouched
- Existing quotation engine untouched
- CRM untouched
- PDF generator untouched
- Landing pages untouched
- Native XR session not started
