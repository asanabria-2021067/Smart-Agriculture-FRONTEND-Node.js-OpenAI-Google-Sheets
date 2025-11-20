// components/plant-scene.tsx
"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"

// Importamos SOLO los dos modelos reales que ya tienes y usas en Plants.tsx
import { GasteriaPlant, JadePlant } from "@/components/plant-3d"

export default function PlantScene() {
  return (
    <Canvas className="w-full h-full">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[0, 1.5, 6]} fov={50} />
        
        {/* Luces suaves y naturales */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 8, -5]} intensity={0.4} color="#c0d6ff" />

        {/* Fondo bonito */}
        <Environment preset="sunset" background blur={0.8} />

        {/* Planta principal grande en el centro */}
        <GasteriaPlant position={[0, -0.8, 0]} scale={1.8} />

        {/* Plantas decorativas más pequeñas alrededor */}
        <JadePlant position={[-2.8, -1.2, -1]} scale={0.9} />
        <GasteriaPlant position={[3.2, -1.1, -0.5]} scale={0.75} />
        <JadePlant position={[-1.5, -1.3, -2.5]} scale={0.7} />
        <GasteriaPlant position={[2, -1.2, -2.8]} scale={0.65} />

        {/* Rotación lenta y suave */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          rotateSpeed={0.5}
        />
      </Suspense>
    </Canvas>
  )
}