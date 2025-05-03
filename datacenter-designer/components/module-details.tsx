"use client"

import type { Module } from "@/types/datacenter"
import { X } from "lucide-react"

interface ModuleDetailsProps {
  module: Module
  onClose: () => void
}

export default function ModuleDetails({ module, onClose }: ModuleDetailsProps) {
  return (
    <div className="p-4 border-t border-[#0e3e7b] flex-shrink-0">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Module Details</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-[#0a2d5e]">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#88c0d0]">Name:</span>
          <span>{module.name}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#88c0d0]">Dimensions:</span>
          <span>
            {module.dim[0]}m × {module.dim[1]}m
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#88c0d0]">Cost:</span>
          <span>${module.cost?.toLocaleString()}</span>
        </div>

        {module.supplied_power !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Power Supply:</span>
            <span className="text-green-400">+{module.supplied_power} kW</span>
          </div>
        )}

        {module.power_usage !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Power Usage:</span>
            <span className="text-red-400">-{module.power_usage} kW</span>
          </div>
        )}

        {module.supplied_water !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Water Supply:</span>
            <span className="text-green-400">+{module.supplied_water} kL</span>
          </div>
        )}

        {module.water_usage !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Water Usage:</span>
            <span className="text-red-400">-{module.water_usage} kL</span>
          </div>
        )}

        {module.processing_power !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Processing:</span>
            <span>+{module.processing_power} TFLOPS</span>
          </div>
        )}

        {module.storage_capacity !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Storage:</span>
            <span>+{module.storage_capacity} TB</span>
          </div>
        )}

        {module.network_capacity !== undefined && (
          <div className="flex justify-between">
            <span className="text-[#88c0d0]">Network:</span>
            <span>+{module.network_capacity} Gbps</span>
          </div>
        )}
      </div>

      {module.description && (
        <div className="mt-4">
          <span className="text-[#88c0d0] text-sm">Description:</span>
          <p className="text-sm mt-1">{module.description}</p>
        </div>
      )}

      <button
        className="w-full mt-4 py-2 bg-[#0e3e7b] hover:bg-[#1a4d8c] rounded text-white transition-colors"
        onClick={() => {
          // This button could be used to place the module or perform other actions
          // For now, we'll just keep the details open
        }}
      >
        Place Module
      </button>
    </div>
  )
}
