"use client"

import { useTexture } from "@react-three/drei"

type Image3DProps = {
  url: string
  scale?: number
  position?: [number, number, number]
}

export default function Image3D({ url, scale = 1, position = [0, 0, 0] }: Image3DProps) {
  const texture = useTexture(url)

  return (
    <mesh position={position} scale={[scale, scale, scale]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial map={texture} transparent opacity={0.98} />
    </mesh>
  )
}