"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import Plant3D, { CactusPlant, LeafyPlant, SucculentPlant } from "@/components/plant-3d"

export default function PlantScene() {
  return (
    <Canvas className="w-full h-full">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 1, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="sunset" />

        {/* Main central plant */}
        <Plant3D />

        {/* Three smaller minimalist plants */}
        <CactusPlant position={[-2.5, -1, 0]} scale={0.6} />
        <LeafyPlant position={[2.5, -1, -0.5]} scale={0.7} />
        <SucculentPlant position={[0, -1, -2]} scale={0.65} />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Suspense>
    </Canvas>
  )
}
