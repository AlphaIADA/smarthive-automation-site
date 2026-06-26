"use client";

import type { SVGProps } from "react";
import type { SmartDeviceCategory } from "@/types/experience";

type IconShape = "bulb" | "switch" | "outlet" | "shade" | "climate" | "camera" | "lock" | "sensor" | "alert" | "water" | "hub" | "controller" | "energy" | "media" | "appliance" | "mirror";

const CATEGORY_ICON_SHAPES: Record<SmartDeviceCategory, IconShape> = {
  lighting: "bulb",
  switches: "switch",
  sockets: "outlet",
  curtains: "shade",
  blinds: "shade",
  thermostats: "climate",
  hvac: "climate",
  cctv: "camera",
  doorbells: "camera",
  "smart-locks": "lock",
  "motion-sensors": "sensor",
  "door-sensors": "sensor",
  "window-sensors": "sensor",
  "smoke-detector": "alert",
  "gas-detector": "alert",
  "water-leak-sensor": "water",
  "temperature-sensor": "climate",
  "humidity-sensor": "water",
  "ir-blaster": "controller",
  "smart-hub": "hub",
  "voice-assistant": "hub",
  "garage-controller": "controller",
  "gate-controller": "controller",
  "pool-controller": "water",
  "garden-irrigation": "water",
  "solar-inverter": "energy",
  "battery-storage": "energy",
  ups: "energy",
  "ev-charger": "energy",
  "smart-tv": "media",
  "audio-system": "media",
  "coffee-machine": "appliance",
  dishwasher: "appliance",
  refrigerator: "appliance",
  "water-heater": "appliance",
  "smart-mirror": "mirror",
};

function iconPath(shape: IconShape) {
  if (shape === "bulb") return <path d="M12 3.5a5 5 0 0 0-3 9v1.3h6v-1.3a5 5 0 0 0-3-9Zm-2.2 12.4h4.4M10.3 19h3.4" />;
  if (shape === "switch") return <path d="M8 4h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm4 3.5v5m0 0 2.2-2.2M12 12.5 9.8 10.3" />;
  if (shape === "outlet") return <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm3 5v3m4-3v3m-5 4h6" />;
  if (shape === "shade") return <path d="M5 5h14l-1.2 8H6.2L5 5Zm3 11h8m-4-3v6" />;
  if (shape === "climate") return <path d="M12 3v10.2a3 3 0 1 0 2 2.8V5a2 2 0 1 0-4 0v11m7-7h3m-3 4h2M4 9h3m-2 4h2" />;
  if (shape === "camera") return <path d="M5 8h9.5a3 3 0 0 1 0 6H5V8Zm11 1.5 3-1.7v6.4l-3-1.7M8.5 11h.1" />;
  if (shape === "lock") return <path d="M7 10h10v9H7v-9Zm2 0V7a3 3 0 0 1 6 0v3m-3 3v3" />;
  if (shape === "sensor") return <path d="M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 3.2v1.6" />;
  if (shape === "alert") return <path d="m12 4 8 15H4L12 4Zm0 5v4m0 3h.1" />;
  if (shape === "water") return <path d="M12 3s5 5.3 5 9a5 5 0 0 1-10 0c0-3.7 5-9 5-9Zm-2 10.2a2 2 0 0 0 2 2" />;
  if (shape === "hub") return <path d="M8 8h8v8H8V8Zm4-5v5m0 8v5M3 12h5m8 0h5m-2.8-7.2-3.5 3.5m-5.4 5.4-3.5 3.5m0-12.4 3.5 3.5m5.4 5.4 3.5 3.5" />;
  if (shape === "controller") return <path d="M7 7h10v10H7V7Zm2.5 5h5M12 9.5v5M4 12h3m10 0h3" />;
  if (shape === "energy") return <path d="M13 3 5.5 13H12l-1 8 7.5-10H12l1-8Z" />;
  if (shape === "media") return <path d="M4 6h16v10H4V6Zm6 13h4m-2-3v3M7 9h10" />;
  if (shape === "appliance") return <path d="M7 3h10v18H7V3Zm2 3h6m-6 4h6m-3 8h.1" />;
  return <path d="M6 4h12v16H6V4Zm2 2h8v12H8V6Zm2 9h4" />;
}

export function DeviceCategoryIcon({ category, className, ...props }: SVGProps<SVGSVGElement> & { readonly category: SmartDeviceCategory }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {iconPath(CATEGORY_ICON_SHAPES[category])}
    </svg>
  );
}
