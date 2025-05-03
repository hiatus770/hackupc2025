"use client"

import { useState } from "react"
import type { DatacenterStyle } from "@/types/datacenter"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Upload, Save, Trash2 } from "lucide-react"

interface DesignerControlsProps {
  datacenterStyles: DatacenterStyle[]
  selectedStyle: DatacenterStyle | null
  onStyleChange: (style: DatacenterStyle) => void
  gridSize: { width: number; height: number }
  onGridSizeChange: (width: number, height: number) => void
}

export default function DesignerControls({
  datacenterStyles,
  selectedStyle,
  onStyleChange,
  gridSize,
  onGridSizeChange,
}: DesignerControlsProps) {
  const [width, setWidth] = useState(gridSize.width)
  const [height, setHeight] = useState(gridSize.height)

  const handleWidthChange = (value: number[]) => {
    const newWidth = value[0]
    setWidth(newWidth)
    onGridSizeChange(newWidth, height)
  }

  const handleHeightChange = (value: number[]) => {
    const newHeight = value[0]
    setHeight(newHeight)
    onGridSizeChange(width, newHeight)
  }

  const handleStyleSelect = (value: string) => {
    const style = datacenterStyles.find((s) => s.id === value)
    if (style) {
      onStyleChange(style)
    }
  }

  const handleSaveDesign = () => {
    // Implement save functionality
    alert("Save functionality would be implemented here")
  }

  const handleLoadDesign = () => {
    // Implement load functionality
    alert("Load functionality would be implemented here")
  }

  const handleClearDesign = () => {
    // Implement clear functionality
    if (confirm("Are you sure you want to clear the current design?")) {
      // Clear the design
    }
  }

  return (
    <div className="p-4 border-t border-[#0e3e7b] flex-shrink-0">
      <h3 className="text-lg font-bold mb-4">Designer Controls</h3>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-[#88c0d0]">Datacenter Style</label>
          <Select value={selectedStyle?.id || ""} onValueChange={handleStyleSelect}>
            <SelectTrigger className="bg-[#011845] border-[#0e3e7b]">
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent className="bg-[#011845] border-[#0e3e7b]">
              {datacenterStyles.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStyle && <p className="text-xs mt-1 text-[#a9c4d4]">{selectedStyle.description}</p>}
        </div>

        {/* <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[#88c0d0]">Grid Width</label>
            <span className="text-sm">{width}m</span>
          </div>
          <Slider value={[width]} min={10} max={50} step={1} onValueChange={handleWidthChange} className="py-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-[#88c0d0]">Grid Height</label>
            <span className="text-sm">{height}m</span>
          </div>
          <Slider value={[height]} min={10} max={50} step={1} onValueChange={handleHeightChange} className="py-2" />
        </div> */}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white"
            onClick={handleSaveDesign}
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white"
            onClick={handleLoadDesign}
          >
            <Upload className="mr-2 h-4 w-4" />
            Load
          </Button>
          <Button
            variant="outline"
            className="bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e] text-white col-span-2"
            onClick={handleClearDesign}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Design
          </Button>
        </div>
      </div>
    </div>
  )
}
