# SmartHive Experience Engine

## Milestone 12: Security Operations Center

The SmartHive Signature Villa security layer now includes a browser-native Security Operations Center (SOC). The SOC is built inside the Experience Engine and derives from the existing Milestone 9 security registry, Milestone 10 automation-ready device state, and Milestone 11 power-source model.

No authentication, database, API, PDF export, landing page, or external quotation engine files were modified for this milestone.

## Command Center

The SOC command center tracks:

- Camera Wall
- Alarm Status
- Door Status
- Sensor Status
- Network Status
- Power Status

Generated status model:

- Camera wall channels: 23
- Live map assets: 151
- Event timeline items: 43
- Incidents: 43
- Video bookmarks: 23
- Security levels: Normal, Armed, Partial, Away, Vacation, Emergency

Every event timeline item is converted into an incident record.

## Live Map

The SOC live map displays every registered:

- Camera
- Sensor
- Lock
- Alarm

Each map asset includes:

- Source device ID
- Room ID
- Room name
- Operational status
- Layer assignment
- Render position
- Coverage radius
- LOD readiness

Map layers can be toggled independently for cameras, sensors, locks, and alarms.

## Event Timeline

Timeline event types:

- Motion
- Door
- Window
- Smoke
- Gas
- Water
- Power Failure

Each timeline event includes severity, source device, room, timestamp label, acknowledgement state, and linked incident ID.

## Video Operations

Camera-wall channels support:

- Live view
- Playback
- Snapshot
- Timeline
- Bookmarks

The current implementation creates a reusable video operations model without streaming external video or changing backend APIs.

## Incident Management

Every SOC event becomes an incident with:

- Incident ID
- Event ID
- Title
- Severity
- Status
- Room
- Source device
- Assigned queue
- Response playbook

Assigned queues include SOC, Security, Facilities, and Electrical.

## Internal Quote Recommendations

The SOC uses an internal Experience Engine quote model only. The existing quotation engine remains untouched.

Recommended missing security hardware:

- Command Center Workstation
- Video Wall Display
- Failover NVR
- Access Control Controller
- Environmental Sensor Pack
- Network Health Appliance
- Incident Response Keypad

Generated SOC hardware estimate:

- Equipment: USD 22,950
- Installation: USD 4,680
- Labour: USD 3,230
- Total: USD 30,860

## Files

- `types/experience/security-operations.ts`
- `lib/experience/security/security-operations-center.ts`
- `lib/experience/stores/security-operations-store.ts`
- `components/experience/security/security-operations-center.tsx`
- `components/experience/security/generators/security-operations-renderer.tsx`
- `components/experience/security/security-operations-center-panel.tsx`

## Constraints

- No AI analysis
- No backend API changes
- No database changes
- No authentication changes
- No landing page changes
- No PDF export changes
- No external quotation engine changes
