"use client";

import dynamic from "next/dynamic";
import { ExperienceLoading } from "@/components/experience/loading/experience-loading";

const ExperienceShell = dynamic(() => import("./experience-shell"), {
  ssr: false,
  loading: () => <ExperienceLoading />,
});

export function ExperienceEntry() {
  return <ExperienceShell />;
}
