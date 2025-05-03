"use client"

import { useState, useRef, useEffect } from "react"
import type { Module } from "@/types/datacenter"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search } from "lucide-react"
import styles from "./module-library.module.css"

interface ModuleLibraryProps {
  modules: Module[]
  onSelectModule: (module: Module) => void
  selectedModule: Module | null
  onResize?: (e: React.MouseEvent) => void
}

export default function ModuleLibrary({ modules, onSelectModule, selectedModule, onResize }: ModuleLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const tabsListRef = useRef<HTMLDivElement>(null)

  // Mejora en el manejo del evento wheel para scroll horizontal
  useEffect(() => {
    const tabsList = tabsListRef.current;

    if (!tabsList) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevenimos el comportamiento por defecto
      e.preventDefault();

      // Aplicamos el scroll horizontal con una velocidad razonable
      tabsList.scrollBy({
        left: e.deltaY * 0.5,
        behavior: 'smooth'
      });
    };

    // Añadimos el event listener
    tabsList.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      // Limpiamos el event listener
      tabsList.removeEventListener('wheel', handleWheel);
    };
  }, []);

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
    return moduleList.filter((module) => module.id.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const categories = Object.keys(groupedModules)

  return (
    <div className="p-4 flex flex-col h-auto border-b border-[#0e3e7b] relative">
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
        <div
          className="w-full overflow-x-auto pb-2 custom-scrollbar"
          ref={tabsListRef}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#0e3e7b #01193d',
          }}
        >
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
        </div>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-2 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 gap-2">
                {filterModules(groupedModules[category]).map((module) => (
                  <div
                    key={module.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${selectedModule?.id === module.id
                      ? "bg-[#0e3e7b] border-[#88c0d0]"
                      : "bg-[#011845] border-[#0e3e7b] hover:bg-[#0a2d5e]"
                      }`}
                    onClick={() => onSelectModule(module)}
                  >
                    <div className="font-medium">{module.id}</div>
                    <div className="text-sm text-[#88c0d0]">
                      {module.dim[0]}x{module.dim[1]} • ${module.price}
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
