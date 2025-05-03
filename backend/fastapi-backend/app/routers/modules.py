from fastapi import APIRouter, HTTPException, status
from DB.cliente import cliente_modulos
from DB.modelos.modules import Module
from DB.esquemas.esquema_modules import module_esquema, modules_esquema
from bson import ObjectId
from pydantic import BaseModel
from typing import List
from app.repositories.module_repository import ModuleRepository

router = APIRouter(
    prefix="/modules",
    tags=["modules"]
)
modules_collection = cliente_modulos["modules"]
module_repo = ModuleRepository()  # Initialize repository

# Import request models
class ModuleImportRequest(BaseModel):
    csv_data: str

class JSONModuleImportRequest(BaseModel):
    modules: List[Module]

# Helper function for existing code
def buscar_module(campo: str, clave):
    try:
        module = modules_collection.find_one({campo: clave})
        if module:
            return module_esquema(module)
        else:
            raise ValueError(f"No module found with {campo}={clave}")
    except Exception as e:
        return {"error": f"Module not found with field {campo} and value {clave}: {str(e)}"}

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

# Add JSON import endpoint
@router.post("/json-import", response_description="Import modules from JSON data", status_code=201)
async def import_modules_json(import_request: JSONModuleImportRequest):
    """
    Import modules from JSON data.
    Expects a list of modules in the modern format.
    """
    try:
        if not import_request.modules:
            raise HTTPException(status_code=400, detail="No modules found in the request")

        # Convert modules to database format
        modules_to_insert = []
        for module in import_request.modules:
            module_dict = module.dict()

            # Create DB compatible format
            db_module = {
                "ID": module_dict["id"],
                "Name": f"{module_dict['type'].replace(' ', '_').capitalize()}_{module_dict.get('usable_power', '') or module_dict.get('fresh_water', '') or module_dict.get('chilled_water', '') or module_dict.get('internal_network', '') or module_dict.get('data_storage', '')}",
                "Space_X": module_dict["dim"][0],
                "Space_Y": module_dict["dim"][1],
                "Price": module_dict["price"]
            }

            # Process resource fields - positive values are outputs, negative are inputs
            resource_mappings = {
                "usable_power": "Usable_Power",
                "grid_connection": "Grid_Connection",
                "water_connection": "Water_Connection",
                "fresh_water": "Fresh_Water",
                "distilled_water": "Distilled_Water",
                "chilled_water": "Chilled_Water",
                "internal_network": "Internal_Network",
                "external_network": "External_Network",
                "processing": "Processing",
                "data_storage": "Data_Storage"
            }

            for json_field, db_field in resource_mappings.items():
                if json_field in module_dict and module_dict[json_field] is not None:
                    db_module[db_field] = module_dict[json_field]

                    # Add input/output flags based on resource value
                    value = module_dict[json_field]
                    if json_field == "grid_connection" or json_field == "water_connection":
                        # Connection fields are always inputs
                        db_module["Is_Input"] = 1
                        db_module["Is_Output"] = 0
                        db_module["Unit"] = json_field.replace("_", " ").capitalize()
                    else:
                        # Resource fields: positive = output, negative = input
                        if value > 0:
                            db_module["Is_Input"] = 0
                            db_module["Is_Output"] = 1
                        else:
                            db_module["Is_Input"] = 1
                            db_module["Is_Output"] = 0
                        db_module["Unit"] = json_field.replace("_", " ").capitalize()
                        db_module["Amount"] = abs(value)

            modules_to_insert.append(db_module)

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
        # First check if ID is valid before attempting conversion
        is_valid_object_id = False
        try:
            if id and ObjectId.is_valid(id):
                is_valid_object_id = True
        except:
            # If any error occurs during validation, just treat it as invalid
            is_valid_object_id = False

        # First try to find by string ID directly
        module = modules_collection.find_one({"id": id})
        if module:
            return module_esquema(module)

        # Try by legacy ID field
        module = modules_collection.find_one({"ID": id})
        if module:
            return module_esquema(module)

        # Only try ObjectId if it's valid
        if is_valid_object_id:
            module = modules_collection.find_one({"_id": ObjectId(id)})
            if module:
                return module_esquema(module)

        # If we get here, no module was found
        raise HTTPException(status_code=404, detail=f"Module not found with ID: {id}")
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
            if ObjectId.is_valid(module.id):
                existing = modules_collection.find_one({"_id": ObjectId(module.id)})
                if existing:
                    raise HTTPException(status_code=400, detail=f"Module with id {module.id} already exists")
            else:
                existing = modules_collection.find_one({"id": module.id})
                if existing:
                    raise HTTPException(status_code=400, detail=f"Module with id {module.id} already exists")

        module_dict = module.dict(exclude={"id"} if hasattr(module, "id") else None)
        id = modules_collection.insert_one(module_dict).inserted_id
        new_module = module_esquema(modules_collection.find_one({"_id": id}))
        return Module(**new_module)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating module: {str(e)}")

@router.delete("/all", response_description="Delete all modules")
async def delete_all_modules():
    """
    Delete all modules from the database.
    WARNING: This will remove ALL modules and cannot be undone.
    """
    try:
        count = modules_collection.count_documents({})

        result = modules_collection.delete_many({})

        if result.deleted_count == 0:
            return {"message": "No modules found to delete"}

        return {
            "message": f"Successfully deleted {result.deleted_count} modules",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting modules: {str(e)}")
