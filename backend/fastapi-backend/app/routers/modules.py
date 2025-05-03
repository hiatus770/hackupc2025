from fastapi import APIRouter, HTTPException, status
from DB.cliente import cliente_modulos
from DB.modelos.modules import Module
from DB.esquemas.esquema_modules import module_esquema, modules_esquema
from bson import ObjectId
from pydantic import BaseModel
from typing import List
from app.repositories.module_repository import ModuleRepository  # Add this import

router = APIRouter(tags=["modules"])
modules_collection = cliente_modulos["modules"]
module_repo = ModuleRepository()  # Initialize repository

# Import request model
class ModuleImportRequest(BaseModel):
    csv_data: str

# Helper function for existing code
def buscar_module(campo: str, clave):
    try:
        module = modules_collection.find_one({campo: clave})
        if module:
            return Module(**module_esquema(module))
        else:
            raise ValueError
    except Exception as e:
        return {"error": f"No se ha encontrado el módulo con los valores {campo} y {clave}: {str(e)}"}

@router.get("/")
async def get_modules():
    modules = modules_esquema(modules_collection.find())
    return modules

# Place specific routes BEFORE dynamic routes with path parameters
@router.post("/import", response_description="Import modules from CSV data", status_code=201)
async def import_modules(import_request: ModuleImportRequest):
    """
    Import modules from tab-separated CSV data.
    Format: ID    Name    Is_Input    Is_Output    Unit    Amount
    """
    modules_to_insert = []
    try:
        for row in import_request.csv_data.strip().split("\n"):
            if not row.strip():
                continue

            parts = row.split("\t")
            if len(parts) != 6:
                continue  # Skip invalid rows

            # Clean the data - replace spaces with underscores in Unit field
            unit = parts[4].replace(" ", "_")

            module = {
                "ID": parts[0],
                "Name": parts[1],
                "Is_Input": int(parts[2]),
                "Is_Output": int(parts[3]),
                "Unit": unit,
                "Amount": int(parts[5])
            }
            modules_to_insert.append(module)

        if not modules_to_insert:
            raise HTTPException(status_code=400, detail="No valid modules found in the CSV data")

        # Insert modules
        result = modules_collection.insert_many(modules_to_insert)

        # Get the inserted modules
        inserted_ids = [str(id) for id in result.inserted_ids]
        return {
            "message": f"Successfully imported {len(inserted_ids)} modules",
            "imported_count": len(inserted_ids)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing modules: {str(e)}")

# Place dynamic path parameter routes AFTER specific routes
@router.get("/{id}")
async def get_module_by_id(id: str):
    try:
        if ObjectId.is_valid(id):
            module = buscar_module("_id", ObjectId(id))
            if isinstance(module, dict) and "error" in module:
                raise HTTPException(status_code=404, detail=module["error"])
            return module
        else:
            module = buscar_module("ID", id)
            if isinstance(module, dict) and "error" in module:
                raise HTTPException(status_code=404, detail=f"No module found with ID: {id}")
            return module
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving module: {str(e)}")

@router.get("/query")  # By query
async def get_module_by_query(id: str):
    try:
        if ObjectId.is_valid(id):
            module = buscar_module("_id", ObjectId(id))
        else:
            module = buscar_module("ID", id)

        if isinstance(module, dict) and "error" in module:
            raise HTTPException(status_code=404, detail=module["error"])
        return module
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving module: {str(e)}")

@router.post("/", response_model=Module, status_code=201)
async def post_module(module: Module):
    try:
        if hasattr(module, "id") and module.id:
            if isinstance(buscar_module("_id", ObjectId(module.id)), Module):
                raise HTTPException(status_code=400, detail=f"El módulo con id {module.id} ya existe")

        module_dict = module.dict(exclude={"id"} if hasattr(module, "id") else None)
        id = modules_collection.insert_one(module_dict).inserted_id
        new_module = module_esquema(modules_collection.find_one({"_id": id}))
        return Module(**new_module)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el módulo: {str(e)}")
