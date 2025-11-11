"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Cylinder, Sphere, Cone, Box } from "@react-three/drei"
import * as THREE from "three"

function Pot({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      {/* Terracotta pot */}
      <Cylinder args={[0.3 * scale, 0.25 * scale, 0.4 * scale, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#c2410c" roughness={0.8} metalness={0.1} />
      </Cylinder>
      {/* Pot rim */}
      <Cylinder args={[0.32 * scale, 0.3 * scale, 0.05 * scale, 32]} position={[0, 0.2 * scale, 0]}>
        <meshStandardMaterial color="#dc2626" roughness={0.7} />
      </Cylinder>
      {/* Soil */}
      <Cylinder args={[0.28 * scale, 0.28 * scale, 0.05 * scale, 32]} position={[0, 0.22 * scale, 0]}>
        <meshStandardMaterial color="#422006" roughness={0.95} />
      </Cylinder>
    </group>
  )
}

export function CactusPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group position={position} scale={scale}>
      <Pot position={[0, 0, 0]} scale={1} />

      {/* Main cactus body - adjusted position to sit in pot */}
      <Cylinder args={[0.15, 0.2, 1.2, 12]} position={[0, 0.85, 0]}>
        <meshStandardMaterial color="#3d8b4d" roughness={0.8} />
      </Cylinder>

      {/* Side arms */}
      <Cylinder args={[0.08, 0.1, 0.5, 10]} position={[-0.15, 0.95, 0]} rotation={[0, 0, Math.PI / 3]}>
        <meshStandardMaterial color="#3d8b4d" roughness={0.8} />
      </Cylinder>

      <Cylinder args={[0.08, 0.1, 0.5, 10]} position={[0.15, 1.05, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color="#3d8b4d" roughness={0.8} />
      </Cylinder>

      {/* Small flower on top */}
      <Sphere args={[0.08, 8, 8]} position={[0, 1.55, 0]}>
        <meshStandardMaterial color="#ff6b9d" emissive="#ff6b9d" emissiveIntensity={0.4} />
      </Sphere>
    </group>
  )
}

export function LeafyPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const leavesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, i) => {
        const time = state.clock.elapsedTime
        leaf.rotation.y = Math.sin(time * 0.5 + i) * 0.15
      })
    }
  })

  return (
    <group position={position} scale={scale}>
      <Pot position={[0, 0, 0]} scale={1.1} />

      {/* Multiple leaves from center - adjusted position */}
      <group ref={leavesRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const angle = (i * Math.PI * 2) / 6
          return (
            <group
              key={i}
              position={[Math.cos(angle) * 0.2, 0.75 + i * 0.08, Math.sin(angle) * 0.2]}
              rotation={[0, angle, Math.PI / 6]}
            >
              <Cone args={[0.25, 0.6, 8]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#52b788" side={THREE.DoubleSide} roughness={0.4} />
              </Cone>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export function SucculentPlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005
    }
  })

  return (
    <group position={position} scale={scale}>
      <Pot position={[0, 0, 0]} scale={0.9} />

      {/* Rosette pattern of leaves - adjusted position */}
      {[0, 1, 2].map((layer) => (
        <group key={layer} position={[0, 0.25 + layer * 0.15, 0]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const angle = (i * Math.PI * 2) / 8 + layer * 0.2
            const radius = 0.3 - layer * 0.08
            return (
              <Box
                key={`${layer}-${i}`}
                args={[0.15, 0.05, 0.3]}
                position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                rotation={[Math.PI / 8, angle, 0]}
              >
                <meshStandardMaterial color="#95d5b2" roughness={0.6} />
              </Box>
            )
          })}
        </group>
      ))}
    </group>
  )
}

export default function Plant3D() {
  const groupRef = useRef<THREE.Group>(null)
  const leavesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, i) => {
        const time = state.clock.elapsedTime
        leaf.rotation.z = Math.sin(time + i) * 0.1
      })
    }
  })

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <Pot position={[0, 0, 0]} scale={2.5} />

      {/* Stem - adjusted position */}
      <Cylinder args={[0.08, 0.08, 2, 16]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#2d5016" />
      </Cylinder>

      {/* Leaves */}
      <group ref={leavesRef}>
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * Math.PI * 2) / 5
          const height = 1.2 + i * 0.3
          return (
            <group
              key={i}
              position={[Math.cos(angle) * 0.3, height, Math.sin(angle) * 0.3]}
              rotation={[0, angle, Math.PI / 4]}
            >
              <Cone args={[0.4, 0.8, 8]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#4CAF50" side={THREE.DoubleSide} roughness={0.5} />
              </Cone>
            </group>
          )
        })}
      </group>

      {/* Flower */}
      <Sphere args={[0.3, 16, 16]} position={[0, 2.8, 0]}>
        <meshStandardMaterial color="#FF6B9D" emissive="#FF6B9D" emissiveIntensity={0.3} />
      </Sphere>

      {/* Flower petals */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * Math.PI * 2) / 6
        return (
          <Sphere
            key={`petal-${i}`}
            args={[0.2, 16, 16]}
            position={[Math.cos(angle) * 0.4, 2.8, Math.sin(angle) * 0.4]}
          >
            <meshStandardMaterial color="#FFB6C1" emissive="#FFB6C1" emissiveIntensity={0.2} />
          </Sphere>
        )
      })}
    </group>
  )
}
