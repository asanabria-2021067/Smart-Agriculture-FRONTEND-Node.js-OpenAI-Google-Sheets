"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Cylinder, Sphere, Box } from "@react-three/drei"
import * as THREE from "three"

// Maceta común para ambas plantas
function Pot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder args={[0.35, 0.32, 0.4, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#f5e6d3" roughness={0.9} />
      </Cylinder>
      <Cylinder args={[0.37, 0.35, 0.06, 32]} position={[0, 0.17, 0]}>
        <meshStandardMaterial color="#87CEEB" roughness={0.8} />
      </Cylinder>
      <Cylinder args={[0.33, 0.33, 0.06, 32]} position={[0, 0.19, 0]}>
        <meshStandardMaterial color="#2c1810" roughness={1} />
      </Cylinder>
    </group>
  )
}

// Planta 1: Gasteria / Aloe variegata - exactamente como tu primera foto
export function GasteriaPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Pot position={[0, 0, 0]} />

      {/* Hojas principales - largas, puntiagudas, con manchas blancas */}
      {[
        [0, 0.4, 0, 0, 0],
        [0.1, 0.35, 0, 0, -0.3],
        [-0.1, 0.35, 0, 0, 0.3],
        [0.08, 0.45, 0, 0, -0.2],
        [-0.08, 0.45, 0, 0, 0.2],
        [0, 0.5, 0, 0, 0],
      ].map(([x, y, z, rx, rz], i) => (
        <Box
          key={i}
          args={[0.22, 0.9, 0.06]}
          position={[x as number, y as number, z as number]}
          rotation={[rx as number, 0, rz as number]}
        >
          <meshStandardMaterial 
            color="#2d6b3a" 
            roughness={0.8}
            side={THREE.DoubleSide}
          />
          {/* Manchas blancas */}
          {i < 4 && (
            <mesh position={[0, 0, 0.031]}>
              <planeGeometry args={[0.18, 0.7]} />
              <meshStandardMaterial color="#e8f5e8" opacity={0.7} transparent />
            </mesh>
          )}
        </Box>
      ))}

      {/* Hoja seca caída (como en tu foto) */}
      <Box args={[0.05, 0.8, 0.03]} position={[-0.25, 0.1, 0]} rotation={[0, 0, 0.8]}>
        <meshStandardMaterial color="#8b5a2b" roughness={1} />
      </Box>
    </group>
  )
}

// Planta 2: Crassula ovata (árbol de jade) - exactamente como tu segunda foto
export function JadePlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.05
    }
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Pot position={[0, 0, 0]} />

      {/* Troncos principales */}
      {[
        [0, 0.3, 0, 0.05],
        [0.1, 0.25, 0.05, 0.06],
        [-0.08, 0.28, -0.03, 0.05],
        [0.15, 0.2, 0, 0.04],
      ].map(([x, y, z, radius], i) => (
        <Cylinder key={i} args={[radius as number, radius as number * 1.3, 0.6, 8]} position={[x as number, y as number, z as number]}>
          <meshStandardMaterial color="#8b6f47" roughness={0.9} />
        </Cylinder>
      ))}

      {/* Hojas en las puntas */}
      {[
        [0, 0.7, 0],
        [0.15, 0.6, 0.08],
        [-0.1, 0.65, -0.05],
        [0.18, 0.5, 0],
        [0.05, 0.55, -0.1],
        [-0.05, 0.58, 0.1],
      ].map(([x, y, z], i) => (
        <group key={i} position={[x as number, y as number, z as number]}>
          <Sphere args={[0.12, 12, 8]}>
            <meshStandardMaterial color="#4c9a2a" roughness={0.7} />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

// Exporta solo estas dos
export default function Plant3D() {
  return null // No se usa más
}