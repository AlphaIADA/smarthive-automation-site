import type { Metadata } from "next";
import { ExperienceEntry } from "@/components/experience/core/experience-entry";

export const metadata: Metadata = {
  title: "SmartHive Experience Engine",
  description: "The browser-based foundation for the SmartHive digital twin experience.",
};

export default function ExperiencePage() {
  return <ExperienceEntry />;
}
