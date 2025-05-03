"use client"

import { useState } from "react"
import type { Module } from "@/types/datacenter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"

interface ModuleLibraryProps {
  modules: Module[]
  onSelectModule: (module: Module) => void
  selectedModule: Module | null
}

export default function ModuleLibrary({ modules, onSelectModule, selectedModule }: ModuleLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Group modules by category
  const groupedModules = modules.reduce(
    (acc, module) => {
      const category = module.type || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(module)
      return acc
    },
    {} as Record<string, Module[]>,
  )

  // Filter modules based on search term
  const filterModules = (moduleList: Module[]) => {
    if (!searchTerm) return moduleList
    return moduleList.filter((module) => module.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const categories = Object.keys(groupedModules)

  return (
    <div className="p-4 flex flex-col h-[50vh] border-b border-[#0e3e7b]">
      <h2 className="text-xl font-bold mb-4">Module Library</h2>

      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search modules..."
          className="pl-8 pr-4 py-2 w-full bg-[#011845] border border-[#0e3e7b] rounded text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue={categories[0] || "all"}>
        <ScrollArea className="w-full pb-2" orientation="horizontal" scrollHideDelay={0} type="scroll">
          <TabsList className="w-max bg-[#011845] border border-[#0e3e7b] flex-nowrap inline-flex">
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-[#0e3e7b] data-[state=active]:text-white whitespace-nowrap"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-2 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 gap-2">
                {filterModules(groupedModules[category]).map((module) => (
                  <div
                    key={module.name}
                    className={`p-3 border rounded cursor-pointer transition-colors ${selectedModule?.name === module.name
                      ? "bg-[#0e3e7b] border-[#88c0d0]"
                      : "bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e]"
                      }`}
                    onClick={() => onSelectModule(module)}
                  >
                    <div className="font-medium">{module.name}</div>
                    <div className="text-sm text-[#88c0d0]">
                      {module.dim[0]}x{module.dim[1]} • ${module.cost}
                    </div>
                    <div className="text-xs mt-1 text-[#a9c4d4]">
                      {module.description || "No description available"}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
