"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";

function Room({ x, y, active }: { x: number; y: number; active: boolean }) {
  const color = active ? new THREE.Color(1, 1, 0.8) : new THREE.Color(0.9, 0.9, 0.95);
  return (
    <mesh position={[x, 0, y]}>
      <boxGeometry args={[4, 2.5, 3]} />
      <meshStandardMaterial color={color} />
      <pointLight position={[x, 1.5, y]} intensity={active ? 1.2 : 0.2} />
    </mesh>
  );
}

export default function DemoPage() {
  const [lights, setLights] = useState([true, false, true, false]);

  return (
    <section className="container py-10">
      <h1 className="text-3xl font-semibold mb-2">Interactive 3D Smart Home Demo</h1>
      <p className="text-gray-600 mb-4">Toggle each room's smart lighting to see real‑time effects.</p>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 card">
          <div className="h-[480px] rounded-xl overflow-hidden">
            <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 10, 3]} intensity={0.7} />
              <Room x={-3} y={-2} active={lights[0]} />
              <Room x={3} y={-2} active={lights[1]} />
              <Room x={-3} y={2} active={lights[2]} />
              <Room x={3} y={2} active={lights[3]} />
              <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.25, 0]}>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#e5e7eb" />
              </mesh>
              <OrbitControls />
              <Html position={[0,2.2,0]} center>
                <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs shadow">4‑Bedroom Apartment (schematic)</div>
              </Html>
            </Canvas>
          </div>
        </div>
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-3">Controls</h3>
          <div className="space-y-3">
            {["Master Bedroom", "Bedroom 2", "Living Room", "Study"].map((label, i) => (
              <div key={i} className="flex items-center justify-between">
                <span>{label}</span>
                <button
                  onClick={() => setLights(ls => ls.map((v, idx) => idx===i ? !v : v))}
                  className={`px-3 py-1 rounded-full border ${lights[i] ? "bg-gray-900 text-white" : "bg-white"}`}
                >
                  {lights[i] ? "ON" : "OFF"}
                </button>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">This is a lightweight demo. You can replace the schematic with a GLTF/GLB architectural model later.</p>
        </div>
      </div>
    </section>
  );
}
