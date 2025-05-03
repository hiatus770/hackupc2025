from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.models.schemas import Module
from app.repositories.module_repository import ModuleRepository
from typing import List

router = APIRouter()
module_repo = ModuleRepository()

# Helper function to convert ObjectId to string for JSON serialization
def serialize_module(module):
    if module and "_id" in module:
        module["_id"] = str(module["_id"])
    return module

@router.post("/modules", response_description="Create a new module", status_code=201)
async def create_module(module: Module):
    module_dict = module.dict(exclude={"id"} if hasattr(module, "id") else None)
    id = module_repo.create(module_dict)
    return {"id": id, **module_dict}

@router.get("/modules", response_description="List all modules", response_model=List[Module])
async def list_modules():
    modules = module_repo.get_all()
    return [serialize_module(module) for module in modules]

@router.get("/modules/{id}", response_description="Get a module by id")
async def get_module(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid id format: {id}")

    module = module_repo.get_by_id(id)
    if module is None:
        raise HTTPException(status_code=404, detail=f"Module {id} not found")

    return serialize_module(module)

@router.put("/modules/{id}", response_description="Update a module")
async def update_module(id: str, module: Module):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid id format: {id}")

    module_dict = module.dict(exclude={"id"} if hasattr(module, "id") else None)
    result = module_repo.update(id, module_dict)

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Module {id} not found")

    return serialize_module({"_id": id, **module_dict})

@router.delete("/modules/{id}", response_description="Delete a module")
async def delete_module(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid id format: {id}")

    result = module_repo.delete(id)

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Module {id} not found")

    return {"message": f"Module {id} deleted successfully"}
