import { NextResponse } from "next/server"
import type { Module } from "@/types/datacenter"

export async function GET() {
  // This would typically come from a database or external file
  const modules: Module[] = [
    {
        "object_id": "6816857543d3fffc69d7ede4",
        "id": "transformer_100",
        "type": "transformer",
        "dim": [
            40,
            40
        ],
        "price": 1000,
        "description": "Small transformer for moderate power distribution",
        "usable_power": 100,
        "grid_connection": 1
    },
    {
        "object_id": "6816857543d3fffc69d7ede5",
        "id": "transformer_1000",
        "type": "transformer",
        "dim": [
            100,
            100
        ],
        "price": 50000,
        "description": "Medium transformer for large power distribution",
        "usable_power": 1000,
        "grid_connection": 1
    },
    {
        "object_id": "6816857543d3fffc69d7ede6",
        "id": "transformer_5000",
        "type": "transformer",
        "dim": [
            200,
            200
        ],
        "price": 250000,
        "description": "Large transformer for datacenter-wide power distribution",
        "usable_power": 5000,
        "grid_connection": 1
    },
    {
        "object_id": "6816857543d3fffc69d7ede7",
        "id": "water_supply_100",
        "type": "water supply",
        "dim": [
            50,
            50
        ],
        "price": 200,
        "description": "Small water supply unit",
        "fresh_water": 100,
        "water_connection": 1
    },
    {
        "object_id": "6816857543d3fffc69d7ede8",
        "id": "water_supply_500",
        "type": "water supply",
        "dim": [
            150,
            100
        ],
        "price": 400,
        "description": "Large water supply unit",
        "fresh_water": 500,
        "water_connection": 1
    },
    {
        "object_id": "6816857543d3fffc69d7ede9",
        "id": "water_treatment_50",
        "type": "water treatment",
        "dim": [
            50,
            50
        ],
        "price": 10000,
        "description": "Small water treatment system",
        "distilled_water": 50,
        "fresh_water": 50,
        "usable_power": -50
    },
    {
        "object_id": "6816857543d3fffc69d7edea",
        "id": "water_treatment_250",
        "type": "water treatment",
        "dim": [
            200,
            200
        ],
        "price": 40000,
        "description": "Medium water treatment system",
        "distilled_water": 250,
        "fresh_water": 250,
        "usable_power": -90
    },
    {
        "object_id": "6816857543d3fffc69d7edeb",
        "id": "water_treatment_500",
        "type": "water treatment",
        "dim": [
            400,
            400
        ],
        "price": 70000,
        "description": "Large water treatment system",
        "distilled_water": 500,
        "fresh_water": 500,
        "usable_power": -150
    },
    {
        "object_id": "6816857543d3fffc69d7edec",
        "id": "water_chiller_100",
        "type": "water chiller",
        "dim": [
            100,
            100
        ],
        "price": 40000,
        "description": "Small water cooling system",
        "chilled_water": 95,
        "distilled_water": 100,
        "usable_power": -500
    },
    {
        "object_id": "6816857543d3fffc69d7eded",
        "id": "water_chiller_400",
        "type": "water chiller",
        "dim": [
            300,
            100
        ],
        "price": 150000,
        "description": "Large water cooling system",
        "chilled_water": 390,
        "distilled_water": 400,
        "usable_power": -1500
    },
    {
        "object_id": "6816857543d3fffc69d7edee",
        "id": "network_rack_50",
        "type": "network rack",
        "dim": [
            40,
            40
        ],
        "price": 2000,
        "description": "Basic network rack for small networks",
        "chilled_water": -5,
        "fresh_water": -5,
        "usable_power": -50,
        "internal_network": 50
    },
    {
        "object_id": "6816857543d3fffc69d7edef",
        "id": "network_rack_100",
        "type": "network rack",
        "dim": [
            40,
            40
        ],
        "price": 8000,
        "description": "Standard network rack for medium networks",
        "chilled_water": -7,
        "fresh_water": -7,
        "usable_power": -75,
        "internal_network": 100
    },
    {
        "object_id": "6816857543d3fffc69d7edf0",
        "id": "network_rack_200",
        "type": "network rack",
        "dim": [
            40,
            40
        ],
        "price": 20000,
        "description": "High-performance network rack for large networks",
        "chilled_water": -10,
        "fresh_water": -40,
        "usable_power": -95,
        "internal_network": 200
    },
    {
        "object_id": "6816857543d3fffc69d7edf1",
        "id": "server_rack_100",
        "type": "server rack",
        "dim": [
            40,
            40
        ],
        "price": 8000,
        "description": "Basic server rack for general computing",
        "chilled_water": -15,
        "distilled_water": 15,
        "usable_power": -75,
        "processing": 100,
        "internal_network": -10,
        "external_network": 100
    },
    {
        "object_id": "6816857543d3fffc69d7edf2",
        "id": "server_rack_200",
        "type": "server rack",
        "dim": [
            40,
            40
        ],
        "price": 12000,
        "description": "Standard server rack for enterprise computing",
        "chilled_water": -25,
        "distilled_water": -25,
        "usable_power": -125,
        "processing": 150,
        "internal_network": -18,
        "external_network": 200
    },
    {
        "object_id": "6816857543d3fffc69d7edf3",
        "id": "server_rack_500",
        "type": "server rack",
        "dim": [
            40,
            40
        ],
        "price": 50000,
        "description": "High-performance server rack for intensive computing",
        "chilled_water": -50,
        "distilled_water": -50,
        "usable_power": -240,
        "processing": 1000,
        "internal_network": -32,
        "external_network": 400
    },
    {
        "object_id": "6816857543d3fffc69d7edf4",
        "id": "data_rack_100",
        "type": "data rack",
        "dim": [
            40,
            40
        ],
        "price": 2000,
        "description": "Basic storage rack for general data needs",
        "chilled_water": -3,
        "distilled_water": -3,
        "usable_power": -15,
        "internal_network": -5,
        "data_storage": 100
    },
    {
        "object_id": "6816857543d3fffc69d7edf5",
        "id": "data_rack_250",
        "type": "data rack",
        "dim": [
            40,
            40
        ],
        "price": 7500,
        "description": "Standard storage rack for enterprise data",
        "chilled_water": -3,
        "distilled_water": -3,
        "usable_power": -25,
        "internal_network": -10,
        "data_storage": 250
    },
    {
        "object_id": "6816857543d3fffc69d7edf6",
        "id": "data_rack_500",
        "type": "data rack",
        "dim": [
            40,
            40
        ],
        "price": 20500,
        "description": "High-capacity storage rack for large-scale data",
        "chilled_water": -6,
        "distilled_water": -6,
        "usable_power": -40,
        "internal_network": -20,
        "data_storage": 500
    },
    {
        "object_id": "681686b8c028e28ca9864789",
        "id": "transformer_100",
        "type": "transformer",
        "dim": [
            40,
            40
        ],
        "price": 1000,
        "description": "Small transformer for moderate power distribution",
        "usable_power": 100,
        "grid_connection": 1
    },
    {
        "object_id": "681686b8c028e28ca986478a",
        "id": "transformer_1000",
        "type": "transformer",
        "dim": [
            100,
            100
        ],
        "price": 50000,
        "description": "Medium transformer for large power distribution",
        "usable_power": 1000,
        "grid_connection": 1
    },
    {
        "object_id": "681686b8c028e28ca986478b",
        "id": "transformer_5000",
        "type": "transformer",
        "dim": [
            200,
            200
        ],
        "price": 250000,
        "description": "Large transformer for datacenter-wide power distribution",
        "usable_power": 5000,
        "grid_connection": 1
    },
    {
        "object_id": "681686b8c028e28ca986478c",
        "id": "water_supply_100",
        "type": "water supply",
        "dim": [
            50,
            50
        ],
        "price": 200,
        "description": "Small water supply unit",
        "fresh_water": 100,
        "water_connection": 1
    },
    {
        "object_id": "681686b8c028e28ca986478d",
        "id": "water_supply_500",
        "type": "water supply",
        "dim": [
            150,
            100
        ],
        "price": 400,
        "description": "Large water supply unit",
        "fresh_water": 500,
        "water_connection": 1
    },
    {
        "object_id": "681686b8c028e28ca986478e",
        "id": "water_treatment_50",
        "type": "water treatment",
        "dim": [
            50,
            50
        ],
        "price": 10000,
        "description": "Small water treatment system",
        "distilled_water": 50,
        "fresh_water": 50,
        "usable_power": -50
    },
    {
        "object_id": "681686b8c028e28ca986478f",
        "id": "water_treatment_250",
        "type": "water treatment",
        "dim": [
            200,
            200
        ],
        "price": 40000,
        "description": "Medium water treatment system",
        "distilled_water": 250,
        "fresh_water": 250,
        "usable_power": -90
    },
    {
        "object_id": "681686b8c028e28ca9864790",
        "id": "water_treatment_500",
        "type": "water treatment",
        "dim": [
            400,
            400
        ],
        "price": 70000,
        "description": "Large water treatment system",
        "distilled_water": 500,
        "fresh_water": 500,
        "usable_power": -150
    },
    {
        "object_id": "681686b8c028e28ca9864791",
        "id": "water_chiller_100",
        "type": "water chiller",
        "dim": [
            100,
            100
        ],
        "price": 40000,
        "description": "Small water cooling system",
        "chilled_water": 95,
        "distilled_water": 100,
        "usable_power": -500
    },
    {
        "object_id": "681686b8c028e28ca9864792",
        "id": "water_chiller_400",
        "type": "water chiller",
        "dim": [
            300,
            100
        ],
        "price": 150000,
        "description": "Large water cooling system",
        "chilled_water": 390,
        "distilled_water": 400,
        "usable_power": -1500
    },
    {
        "object_id": "681686b8c028e28ca9864793",
        "id": "network_rack_50",
        "type": "network rack",
        "dim": [
            40,
            40
        ],
        "price": 2000,
        "description": "Basic network rack for small networks",
        "chilled_water": -5,
        "fresh_water": -5,
        "usable_power": -50,
        "internal_network": 50
    },
    {
        "object_id": "681686b8c028e28ca9864794",
        "id": "network_rack_100",
        "type": "network rack",
        "dim": [
            40,
            40
        ],
        "price": 8000,
        "description": "Standard network rack for medium networks",
        "chilled_water": -7,
        "fresh_water": -7,
        "usable_power": -75,
        "internal_network": 100
    },
    {
        "object_id": "681686b8c028e28ca9864795",
        "id": "network_rack_200",
        "type": "network rack",
        "dim": [
            40,
            40
        ],
        "price": 20000,
        "description": "High-performance network rack for large networks",
        "chilled_water": -10,
        "fresh_water": -40,
        "usable_power": -95,
        "internal_network": 200
    },
    {
        "object_id": "681686b8c028e28ca9864796",
        "id": "server_rack_100",
        "type": "server rack",
        "dim": [
            40,
            40
        ],
        "price": 8000,
        "description": "Basic server rack for general computing",
        "chilled_water": -15,
        "distilled_water": 15,
        "usable_power": -75,
        "processing": 100,
        "internal_network": -10,
        "external_network": 100
    },
    {
        "object_id": "681686b8c028e28ca9864797",
        "id": "server_rack_200",
        "type": "server rack",
        "dim": [
            40,
            40
        ],
        "price": 12000,
        "description": "Standard server rack for enterprise computing",
        "chilled_water": -25,
        "distilled_water": -25,
        "usable_power": -125,
        "processing": 150,
        "internal_network": -18,
        "external_network": 200
    },
    {
        "object_id": "681686b8c028e28ca9864798",
        "id": "server_rack_500",
        "type": "server rack",
        "dim": [
            40,
            40
        ],
        "price": 50000,
        "description": "High-performance server rack for intensive computing",
        "chilled_water": -50,
        "distilled_water": -50,
        "usable_power": -240,
        "processing": 1000,
        "internal_network": -32,
        "external_network": 400
    },
    {
        "object_id": "681686b8c028e28ca9864799",
        "id": "data_rack_100",
        "type": "data rack",
        "dim": [
            40,
            40
        ],
        "price": 2000,
        "description": "Basic storage rack for general data needs",
        "chilled_water": -3,
        "distilled_water": -3,
        "usable_power": -15,
        "internal_network": -5,
        "data_storage": 100
    },
    {
        "object_id": "681686b8c028e28ca986479a",
        "id": "data_rack_250",
        "type": "data rack",
        "dim": [
            40,
            40
        ],
        "price": 7500,
        "description": "Standard storage rack for enterprise data",
        "chilled_water": -3,
        "distilled_water": -3,
        "usable_power": -25,
        "internal_network": -10,
        "data_storage": 250
    },
    {
        "object_id": "681686b8c028e28ca986479b",
        "id": "data_rack_500",
        "type": "data rack",
        "dim": [
            40,
            40
        ],
        "price": 20500,
        "description": "High-capacity storage rack for large-scale data",
        "chilled_water": -6,
        "distilled_water": -6,
        "usable_power": -40,
        "internal_network": -20,
        "data_storage": 500
    }
]

  return NextResponse.json(modules)
}
