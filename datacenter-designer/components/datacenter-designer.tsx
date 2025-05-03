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
import { set } from "date-fns"

interface DatacenterDesignerProps {
  styleId: string
  // Now allow the passing of the entire json style object
  styleData: DatacenterStyle
}
export default function DatacenterDesigner({ styleId, styleData }: DatacenterDesignerProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [datacenterStyles, setDatacenterStyles] = useState<DatacenterStyle[]>([])
  const [selectedStyle, setSelectedStyle] = useState<DatacenterStyle | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [placedModules, setPlacedModules] = useState<PlacedModule[]>([])
  const [gridSize, setGridSize] = useState({ width: styleData.dim[0] / 10, height: styleData.dim[1] / 10 })
  console.log("Grid Size:", gridSize);

  const [totalCost, setTotalCost] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [totalWater, setTotalWater] = useState(0);
  const [totalArea, setTotalArea] = useState(0);
  const [totalProcessing, setTotalProcessing] = useState(0);
  const [totalStorage, setTotalStorage] = useState(0);
  const [totalInternalWater, setTotalInternalWater] = useState(0);
  const [totalInternalNetwork, setTotalInternalNetwork] = useState(0);
  const [totalExternalNetwork, setTotalExternalNetwork] = useState(0);

  let goalArea = 0; // Total area of the datacenter
  let goalWater = 0;
  let goalProcessing = 0;
  let goalNetwork = 0;
  let goalStorage = 0;
  let targetPrice = 0;

  // Our goals are dependent on the style 
  targetPrice = styleData.price ?? 0
  console.log("STYLE ID:", styleId);
  if (styleId === "server_square") {
    goalArea = 1000 * 500;
    goalStorage = styleData.data_storage ?? 0
    goalProcessing = styleData.processing ?? 0


  } else if (styleId === "dense_storage") {
    // Maximize storage 


  } else if (styleId === "supercomputer") {
    // Maximize processing 
    goalArea = 2000 * 1000;
  } else {
    // Custom 
  }

  const [isPlacingModule, setIsPlacingModule] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);

  // Orbit controls ref 
  const orbitControlsRef = useRef<any>(null);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };

  // State to store the maximum sidebar width
  const [maxSidebarWidth, setMaxSidebarWidth] = useState(300); // Default value

  // Update the maximum sidebar width when the window size changes
  useEffect(() => {
    // Only access window after the component has been mounted
    const updateMaxWidth = () => {
      setMaxSidebarWidth(window.innerWidth * 0.3);
    };

    // Set the initial value
    updateMaxWidth();

    // Add event listener to update when window size changes
    window.addEventListener('resize', updateMaxWidth);

    // Cleanup when unmounting
    return () => window.removeEventListener('resize', updateMaxWidth);
  }, []);

  // Modify the handleMouseMove function to use the maxSidebarWidth state
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizingRef.current) return;
    const newWidth = e.clientX;
    // Use the maxSidebarWidth state instead of calculating window.innerWidth * 0.3 directly
    if (newWidth >= 300 && newWidth <= maxSidebarWidth) {
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

        // Find and set the selected style based on the styleId passed as prop
        const currentStyle = stylesData.find((style: DatacenterStyle) => style.id === styleId)
        if (currentStyle) {
          setSelectedStyle(currentStyle)
        } else if (stylesData.length > 0) {
          // Fallback in case the style is not found
          setSelectedStyle(stylesData[0])
        }
      } catch (error) {
        console.error("Failed to load datacenter data:", error)
      }
    }

    loadData()
  }, [styleId]) // Added styleId as a dependency to update if it changes

  // Calculate totals when placed modules change
  useEffect(() => {
    let cost = 0
    let power = 0
    let water = 0
    let internalWater = 0
    let internalNetwork = 0
    let network = 0
    let processing = 0
    let storage = 0
    let area = 0


    placedModules.forEach((placed) => {
      cost += placed.module.price || 0
      power += placed.module.usable_power || 0
      water += placed.module.fresh_water || 0
      internalWater += placed.module.distilled_water || 0
      network += placed.module.external_network || 0
      internalNetwork += placed.module.internal_network || 0
      processing += placed.module.processing || 0
      storage += placed.module.data_storage || 0
      area += (placed.module.dim[0]) * (placed.module.dim[1]) // Area in m^2
      console.log("NETWORK:", placed.module.external_network, placed.module.internal_network);
    })

    setTotalCost(cost)
    console.log("TOTALS: ", cost, power, water);
    setTotalPower(power)
    setTotalProcessing(processing)
    setTotalStorage(storage)
    setTotalExternalNetwork(network)
    setTotalInternalNetwork(internalNetwork)
    setTotalInternalWater(internalWater)
    setTotalWater(water)
    console.log(cost, power, water);
  }, [placedModules])

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module)
    setIsPlacingModule(true)
  }

  const handleModulePlacement = (x: number, y: number, rotation = 0) => {
    if (!selectedModule) return

    // Check if placement is valid (not overlapping other modules)
    const isValid = checkPlacementValidity(x, y, selectedModule, rotation)
    console.log("Placing!");
    if (isValid) {
      console.log("Placing");
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
    if (!module) return false

    // Get module dimensions, accounting for rotation, scaled down by 10x
    const moduleWidth = rotation % 180 === 0 ? module.dim[0] / 10 : module.dim[1] / 10
    const moduleHeight = rotation % 180 === 0 ? module.dim[1] / 10 : module.dim[0] / 10

    // Check if module is within grid bounds
    if (x < 0 || y < 0 || x + moduleWidth > gridSize.width || y + moduleHeight > gridSize.height) {
      return false
    }

    // Check for overlaps with existing modules
    for (const placed of placedModules) {
      const placedWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] / 10 : placed.module.dim[1] / 10
      const placedHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] / 10 : placed.module.dim[0] / 10

      // Check for overlap
      if (
        x < placed.position.x + placedWidth &&
        x + moduleWidth > placed.position.x &&
        y < placed.position.y + placedHeight &&
        y + moduleHeight > placed.position.y
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
      const placedWidth = placed.rotation % 180 === 0 ? placed.module.dim[0] / 10 : placed.module.dim[1] / 10
      const placedHeight = placed.rotation % 180 === 0 ? placed.module.dim[1] / 10 : placed.module.dim[0] / 10

      return placed.position.x + placedWidth <= width && placed.position.y + placedHeight <= height
    })

    setPlacedModules(validPlacements)
  }

  // This will take a current layout and fetch the backend to generate a new layout that will be applied once it receives the rquest
  const genFunction = () => {
    // Implement the generation logic here
    alert("Generation functionality would be implemented here")
  }

  const resetCameraView = () => {
    // Implement the camera reset logic here
    if (orbitControlsRef.current) {
      orbitControlsRef.current.reset()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Datacenter Designer</h1>
        <div className={styles.metrics}>
          {/* Price Goal Comparison */}
          <div className={styles.metric}>
            <span>Budget:</span>
            {targetPrice > 0 ? ( // Only show if a target price is set
              <span style={{ color: totalCost <= targetPrice ? 'lightgreen' : 'orange' }}>
                ${(targetPrice - totalCost).toLocaleString()} {totalCost <= targetPrice ? 'Remaining' : 'Over'}
              </span>
            ) : (
              <span>${totalCost.toLocaleString()} Spent</span> // Fallback if no target
            )}
          </div>
          {/* Power Balance (Existing) */}
          <div className={styles.metric}>
            <span>Power Balance:</span>
            <span style={{ color: totalPower >= 0 ? 'lightgreen' : 'orange' }}>
              {totalPower >= 0 ? `+${Math.abs(totalPower).toLocaleString()}` : `${totalPower.toLocaleString()}`} kW
            </span>
            {/* Optionally add goal comparison if a 'totalProcessing' state exists and 'goalProcessing' is the target */}
            {/* {goalProcessing > 0 && <span> (Goal: {goalProcessing})</span>} */}
          </div>
          {/* Water Balance (Existing) */}
          <div className={styles.metric}>
            <span>Water Balance:</span>
            <span style={{ color: totalWater >= 0 ? 'lightblue' : 'yellow' }}>
              {totalWater >= 0 ? `+${Math.abs(totalWater).toLocaleString()}` : `${totalWater.toLocaleString()}`} kL
            </span>
            {/* Optionally add goal comparison if 'goalWater' is a target limit/requirement */}
            {/* {goalWater > 0 && <span> (Limit: {goalWater})</span>} */}
          </div>
          {/* Networking Goal Comparison (Assuming 'totalNetwork' state exists or using 0 as placeholder) */}
          <div className={styles.metric}>
            <span>Networking:</span>
            {goalNetwork > 0 ? ( // Only show if a network goal is set
              <span style={{ color: totalExternalNetwork >= goalNetwork ? 'lightgreen' : 'orange' }}>
                {(totalExternalNetwork - goalNetwork).toLocaleString()} {totalExternalNetwork >= goalNetwork ? 'Above Goal' : 'Below Goal'}
              </span>
            ) : (
              <span>{totalExternalNetwork.toLocaleString()} kBps</span> // Fallback if no goal
            )}
          </div>
          {/* Processing Goal Comparison */}
          <div className={styles.metric}>
            <span>Processing:</span>
            {goalProcessing > 0 ? ( // Only show if a target processing is set
              <span style={{ color: totalProcessing >= goalProcessing ? 'lightgreen' : 'orange' }}>
                {totalProcessing.toLocaleString()} {totalProcessing >= goalProcessing ? 'Above Goal' : 'Below Goal'}
              </span>
            ) : (
              <span>{totalProcessing.toLocaleString()} kW</span> // Fallback if no target
            )}
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <div
          ref={sidebarRef}
          style={{ width: `${sidebarWidth}px`, minWidth: '300px', maxWidth: '30vw', flexShrink: 0, position: 'relative' }}
          className={`bg-[#01193d] border-r border-[#0e3e7b] flex flex-col h-[calc(100vh-60px)] overflow-auto ${styles.hideScrollbar}`}
        >
          {/* Divider for resizing that spans the full height */}
          <div
            className="fixed right-auto top-[60px] w-2 bg-[#0e3e7b] cursor-ew-resize hover:bg-blue-500 z-50 h-[calc(100vh-60px)] pointer-events-auto"
            style={{
              left: `${Math.min(sidebarWidth, maxSidebarWidth)}px`
            }}
            onMouseDown={startResizing}
          />

          <ModuleLibrary
            modules={modules}
            onSelectModule={handleModuleSelect}
            selectedModule={selectedModule}
          />

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
            placedModules={placedModules} // Pass placed modules as prop
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
            <OrbitControls
              ref={orbitControlsRef}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2.1}
              enableZoom={true}
              enablePan={true}
              minDistance={10}
              maxDistance={1000}
              panSpeed={2}
            />
            <Grid
              infiniteGrid={false}
              position={[0, -0.01, 0]}
              args={[gridSize.width, gridSize.height]}
              cellSize={1}
              cellThickness={0.5}
              cellColor="#6080ff"
              sectionSize={5}
              sectionThickness={1}
              sectionColor="#8090ff"
              fadeDistance={1000}
              fadeStrength={1.5}

            />
          </Canvas>



        </div>
      </div>
    </div>
  )
}
