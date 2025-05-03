"use client"

import { useState, Suspense } from "react"
import { Text } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { OBJLoader , MTLLoader} from "three-stdlib"
import type { PlacedModule } from "@/types/datacenter"

interface ModuleObjectProps {
  placedModule: PlacedModule
  gridWidth: number
  gridHeight: number
  isPreview?: boolean
  isValidPlacement?: boolean
  onRemove?: () => void
}

// Always call useLoader, let Suspense handle loading/failure
function ModuleModel({ moduleId, width, depth, color }: { moduleId: string; width: number; depth: number; color: string }) {
  let obj: any = null
  try {
    const materials = useLoader(MTLLoader, `/models/${moduleId}.mtl`)
    obj = useLoader(OBJLoader, `/models/${moduleId}.obj`, loader => {
      loader.setMaterials(materials)
    })
  } catch {
    try {
      obj = useLoader(OBJLoader, `/models/${moduleId}.obj`)
    } catch {
      obj = null
    }
  }

  // If obj is null, render a fallback box
  if (!obj) {
    return (
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color={color} opacity={0.7} transparent />
      </mesh>
    )
  }

  // Force color on all meshes
  obj.traverse?.((child: any) => {
    if (child.isMesh) {
      child.material = child.material.clone()
      child.material.color.set(color)
      child.castShadow = true
      child.receiveShadow = true
    }
  })

  return (
    <primitive
      object={obj.clone()}
      position={[0, width / 3, 0]}
      scale={[
        width / 2,
        width / 2,
        depth / 2,
      ]}
      castShadow
      receiveShadow
    />
  )
}

export default function ModuleObject({
  placedModule,
  gridWidth,
  gridHeight,
  isPreview = false,
  isValidPlacement = true,
  onRemove,
}: ModuleObjectProps) {
  const [hovered, setHovered] = useState(false)

  const { module, position, rotation } = placedModule

  // Calculate dimensions based on rotation
  const width = rotation % 180 === 0 ? module.dim[0] : module.dim[1]
  const depth = rotation % 180 === 0 ? module.dim[1] : module.dim[0]

  // Calculate position in the scene
  const x = position.x - gridWidth / 2 + width / 2
  const z = position.y - gridHeight / 2 + depth / 2

  // Determine color based on module type and state
  let color = "#0e3e7b" // Default blue
  let opacity = 0.8

  if (isPreview) {
    opacity = 0.5
    color = isValidPlacement ? "#4CAF50" : "#F44336" // Green if valid, red if invalid
  } else if (hovered) {
    color = "#1a4d8c" // Lighter blue when hovered
  } else {
    // Color based on module type
    switch (module.type) {
      case "transformer":
        color = "#FFC107" // Yellow for power
        break
      case "water_supply":
      case "water_treatment":
      case "water_chiller":
        color = "#03A9F4" // Blue for water
        break
      case "network_rack":
        color = "#9C27B0" // Purple for network
        break
      case "storage_rack":
        color = "#FF5722" // Orange for storage
        break
      case "server_rack":
        color = "#4CAF50" // Green for servers
        break
      default:
        color = "#0e3e7b" // Default blue
    }
  }

  return (
    <group
      position={[x, 0.5, z]}
      rotation={[0, (rotation * Math.PI) / 180, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => {
        if (!isPreview && onRemove && e.button === 2) {
          e.stopPropagation()
          onRemove()
        }
      }}
    >
      {/* Module base */}
      <mesh>
        <boxGeometry args={[width, 1, depth]} />
        <meshStandardMaterial color={color} opacity={opacity} transparent />
      </mesh>

      {/* Render OBJ model if available */}
      <Suspense fallback={null}>
        <ModuleModel moduleId={module.id} width={width} depth={depth} color={color} />
      </Suspense>

      {/* Module label */}
      <Text
        position={[0, 0.6, depth / 2 - 0.2]} // In front of the box
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.2}
      >
        {module.id}
      </Text>

      {/* Module details (only show when hovered and not a preview) */}
      {hovered && !isPreview && (
        <Text
          position={[0, 2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.6}
          color="#88c0d0"
          anchorX="center"
          anchorY="middle"
          maxWidth={width - 0.2}
        >
          {`${width * 10}x${depth * 10}m • $${module.price}`}
        </Text>
      )}
    </group>
  )
}

