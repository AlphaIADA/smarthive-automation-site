"use client";

import dynamic from "next/dynamic";

const SmartHomeDemo = dynamic(() => import("@/components/SmartHomeDemo"), {
  ssr: false,
  loading: () => <div className="container py-10 text-sm text-gray-500">Loading 3D demo...</div>,
});

export default function DemoPage() {
  return <SmartHomeDemo />;
}
