"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei"
import { Suspense } from "react"
import Image3D from "./Image3D"

type Plant3DViewerProps = {
  url: string
  scale?: number
  position?: [number, number, number]
}

export default function Plant3DViewer({ 
  url, 
  scale = 3, 
  position = [0, -0.5, 0] 
}: Plant3DViewerProps) {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 50 }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.4} castShadow />
        <Environment preset="sunset" />

        <Image3D url={url} scale={scale * 1.3} position={position} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.5}
        />
      </Suspense>
    </Canvas>
  )
}