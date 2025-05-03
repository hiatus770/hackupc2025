export interface Module {
  name: string
  type?: string
  dim: [number, number] // [width, height] in meters
  cost: number
  description?: string

  // Power related
  supplied_power?: number // kW
  power_usage?: number // kW

  // Water related
  supplied_water?: number // kL
  water_usage?: number // kL

  // Compute related
  processing_power?: number // TFLOPS
  storage_capacity?: number // TB
  network_capacity?: number // Gbps
}

export interface PlacedModule {
  id: string
  module: Module
  position: {
    x: number
    y: number
  }
  rotation: number // 0, 90, 180, 270 degrees
}

export interface DatacenterStyle {
  id: string
  name: string
  description: string // a quick description 
  grid_connection: number // how much grid connections it has 
  water_connection: number  // how much water it has 
  processing: number | null // processing power of the server 
  price: number | null // the price of the server, if null we want to minimize 
  dim: [number, number]
  data_storage: number | null 
  focus: "processing" | "storage" | "network" | "server"
  recommended_modules?: string[] // Array of module names
}
