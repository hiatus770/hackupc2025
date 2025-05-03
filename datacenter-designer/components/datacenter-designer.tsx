"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import ModuleLibrary from "./module-library"
import DesignerControls from "./designer-controls"
import DatacenterGrid from "./datacenter-grid"
import ModuleDetails from "./module-details"
import type { DatacenterStyle, Module, PlacedModule } from "@/types/datacenter"
import styles from "./datacenter-designer.module.css"

export default function DatacenterDesigner() {
  const [modules, setModules] = useState<Module[]>([])
  const [datacenterStyles, setDatacenterStyles] = useState<DatacenterStyle[]>([])
  const [selectedStyle, setSelectedStyle] = useState<DatacenterStyle | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([])
  const [gridSize, setGridSize] = useState({ width: 20, height: 20 })
  const [totalCost, setTotalCost] = useState(0)
  const [totalPower, setTotalPower] = useState(0)
  const [totalWater, setTotalWater] = useState(0)
  const [isPlacingModule, setIsPlacingModule] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const newWidth = e.clientX;
    if (newWidth >= 300) {
      setSidebarWidth(newWidth);
    }
  };

  const stopResizing = () => {
    resizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  // Load module and datacenter style definitions
  useEffect(() => {
    const loadData = async () => {
      try {
        const modulesResponse = await fetch("/api/modules")
        const stylesResponse = await fetch("/api/datacenter-styles")

        const modulesData = await modulesResponse.json()
        const stylesData = await stylesResponse.json()

        setModules(modulesData)
        setDatacenterStyles(stylesData)

        if (stylesData.length > 0) {
          setSelectedStyle(stylesData[0])
        }
      } catch (error) {
        console.error("Failed to load datacenter data:", error)
      }
    }

    loadData()
  }, [])

  // Calculate totals when placed modules change
  useEffect(() => {
    let cost = 0
    let power = 0
    let water = 0

    placedModules.forEach((placed) => {
      cost += placed.module.cost || 0
      power += placed.module.power_usage || 0
      water += placed.module.water_usage || 0

      // Add power supplied by transformers
      if (placed.module.supplied_power) {
        power -= placed.module.supplied_power
      }

      // Add water supplied by water supply
      if (placed.module.supplied_water) {
        water -= placed.module.supplied_water
      }
    })

    setTotalCost(cost)
    setTotalPower(power)
    setTotalWater(water)
  }, [placedModules])

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module)
    setIsPlacingModule(true)
  }

  const handleModulePlacement = (x: number, y: number, rotation = 0) => {
    if (!selectedModule) return

    // Check if placement is valid (not overlapping other modules)
    const isValid = checkPlacementValidity(x, y, selectedModule, rotation)

    if (isValid) {
      const newPlacedModule: PlacedModule = {
        id: `${Date.now()}`,
        module: selectedModule,
        position: { x, y },
        rotation,
      }

      setPlacedModules([...placedModules, newPlacedModule])
      setIsPlacingModule(false)
    }
  }

  const checkPlacementValidity = (x: number, y: number, module: Module, rotation: number): boolean => {
    // Get module dimensions, accounting for rotation
    const width = rotation % 180 === 0 ? module.dim[0] : module.dim[1]
    const height = rotation % 180 === 0 ? module.dim[1] : module.dim[0]

    // Check if module is within grid bounds
    if (x < 0 || y < 0 || x + width > gridSize.width || y + height > gridSize.height) {
      return false
    }

    // Check for overlaps with existing modules
    for (const placed of placedModules) {
      const placedWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] : placed.module.dim[1]
      const placedHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] : placed.module.dim[0]

      // Check for overlap
      if (
        x < placed.position.x + placedWidth &&
        x + width > placed.position.x &&
        y < placed.position.y + placedHeight &&
        y + height > placed.position.y
      ) {
        return false
      }
    }

    return true
  }

  const handleRemoveModule = (id: string) => {
    setPlacedModules(placedModules.filter((module) => module.id !== id))
  }

  const handleStyleChange = (style: DatacenterStyle) => {
    setSelectedStyle(style)
    // Optionally reset or adjust the design based on the new style
  }

  const handleGridSizeChange = (width: number, height: number) => {
    setGridSize({ width, height })
    // Validate existing placements with new grid size
    const validPlacements = placedModules.filter((placed) => {
      const placedWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] : placed.module.dim[1]
      const placedHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] : placed.module.dim[0]

      return placed.position.x + placedWidth <= width && placed.position.y + placedHeight <= height
    })

    setPlacedModules(validPlacements)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Datacenter Designer</h1>
        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span>Total Cost:</span> ${totalCost.toLocaleString()}
          </div>
          <div className={styles.metric}>
            <span>Power Balance:</span> {totalPower < 0 ? `+${Math.abs(totalPower)}` : `-${totalPower}`} kW
          </div>
          <div className={styles.metric}>
            <span>Water Balance:</span> {totalWater < 0 ? `+${Math.abs(totalWater)}` : `-${totalWater}`} kL
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <div
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px`, minWidth: '300px', maxWidth: '30vw', flexShrink: 0 }}
          className="bg-[#01193d] border-r border-[#0e3e7b] flex flex-col h-[calc(100vh-60px)] overflow-auto relative"
        >
          <ModuleLibrary modules={modules} onSelectModule={handleModuleSelect} selectedModule={selectedModule} />

          {selectedModule && (
            <ModuleDetails
              module={selectedModule}
              onClose={() => {
                setSelectedModule(null)
                setIsPlacingModule(false)
              }}
            />
          )}

          <DesignerControls
            datacenterStyles={datacenterStyles}
            selectedStyle={selectedStyle}
            onStyleChange={handleStyleChange}
            gridSize={gridSize}
            onGridSizeChange={handleGridSizeChange}
          />

          <div
            className="absolute right-0 top-0 bottom-0 w-2 bg-[#0e3e7b] cursor-ew-resize hover:bg-blue-500 z-10"
            onMouseDown={startResizing}
          />
        </div>

        <div className={styles.canvasContainer} style={{ flex: '1', overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, 15, 15], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <DatacenterGrid
              width={gridSize.width}
              height={gridSize.height}
              placedModules={placedModules}
              onPlaceModule={handleModulePlacement}
              onRemoveModule={handleRemoveModule}
              isPlacingModule={isPlacingModule}
              selectedModule={selectedModule}
            />
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableZoom={true} enablePan={true} />
            <Grid
              infiniteGrid
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6080ff"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#8090ff"
              fadeDistance={50}
              fadeStrength={1.5}
            />
          </Canvas>
        </div>
      </div>
    </div>
  )
}
