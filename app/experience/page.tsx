import type { Metadata } from "next";
import { ExperienceEntry } from "@/components/experience/core/experience-entry";

export const metadata: Metadata = {
  title: "SmartHive OS Version 1.0 | Experience Engine",
  description: "SmartHive OS Version 1.0 commercial launch package with the Signature Villa Digital Twin, quotation readiness, portals, installer workflows, admin payloads, AI, documentation, deployment readiness, SmartHive Cloud sync, and enterprise production hardening.",
};

export default function ExperiencePage() {
  return <ExperienceEntry />;
}
