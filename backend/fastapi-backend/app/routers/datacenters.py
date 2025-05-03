from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from bson import ObjectId
from app.models.schemas import Datacenter, PlacedModule
from app.repositories.datacenter_repository import DatacenterRepository
from app.repositories.placed_module_repository import PlacedModuleRepository
from DB.esquemas.esquema_datacenters import datacenter_esquema, datacenters_esquema
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(
    prefix="/datacenters",
    tags=["datacenters"],
    responses={404: {"description": "Not found"}}
)

datacenter_repo = DatacenterRepository()
placed_module_repo = PlacedModuleRepository()

# Request models
class DatacenterCreate(BaseModel):
    name: str
    description: Optional[str] = None
    style_id: Optional[str] = None
    dim: Optional[List[int]] = None
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None

class DatacenterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    style_id: Optional[str] = None
    dim: Optional[List[int]] = None
    grid_connection: Optional[int] = None
    water_connection: Optional[int] = None

class DatacenterSearch(BaseModel):
    query: str
    limit: int = 10

@router.get("/", response_description="List all datacenters")
async def list_datacenters(include_modules: bool = False, limit: int = 100, skip: int = 0):
    """
    Get all datacenters with pagination.

    - **include_modules**: Whether to include placed modules in the response
    - **limit**: Maximum number of datacenters to return
    - **skip**: Number of datacenters to skip
    """
    try:
        datacenters = datacenter_repo.get_all(include_modules)

        # Apply pagination
        paginated = datacenters[skip:skip + limit]

        return {
            "total": len(datacenters),
            "datacenters": datacenters_esquema(paginated)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenters: {str(e)}")

@router.post("/search", response_description="Search datacenters")
async def search_datacenters(search: DatacenterSearch):
    """
    Search datacenters by name or description
    """
    try:
        results = datacenter_repo.search(search.query, search.limit)
        return datacenters_esquema(results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching datacenters: {str(e)}")

@router.get("/{id}", response_description="Get a datacenter by ID")
async def get_datacenter(id: str, include_modules: bool = True):
    """
    Get a specific datacenter by ID

    - **include_modules**: Whether to include placed modules in the response
    """
    try:
        datacenter = datacenter_repo.get_by_id(id, include_modules)
        if not datacenter:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        return datacenter_esquema(datacenter)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenter: {str(e)}")

@router.post("/", response_description="Create a new datacenter", status_code=201)
async def create_datacenter(datacenter: DatacenterCreate):
    """Create a new datacenter"""
    try:
        # Convert Pydantic model to dict
        datacenter_dict = datacenter.dict()

        # Create the datacenter
        id = datacenter_repo.create(datacenter_dict)
        new_datacenter = datacenter_repo.get_by_id(id)

        return datacenter_esquema(new_datacenter)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating datacenter: {str(e)}")

@router.put("/{id}", response_description="Update a datacenter")
async def update_datacenter(id: str, datacenter: DatacenterUpdate):
    """Update a datacenter"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Convert Pydantic model to dict, excluding None values
        update_data = {k: v for k, v in datacenter.dict().items() if v is not None}

        # Update the datacenter
        result = datacenter_repo.update(id, update_data)

        # Get updated datacenter
        updated = datacenter_repo.get_by_id(id)
        return datacenter_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating datacenter: {str(e)}")

@router.delete("/{id}", response_description="Delete a datacenter")
async def delete_datacenter(id: str):
    """Delete a datacenter and all its placed modules"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Delete the datacenter
        result = datacenter_repo.delete(id)

        return {"message": f"Datacenter {id} and its modules deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting datacenter: {str(e)}")

@router.post("/{id}/modules", response_description="Add a module to a datacenter")
async def add_module_to_datacenter(id: str, placed_module: PlacedModule):
    """Add a new module to a datacenter"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Set the datacenter ID
        placed_module_dict = placed_module.dict()
        placed_module_dict["datacenter_id"] = id

        # Create the placed module
        module_id = placed_module_repo.create(placed_module_dict)

        # Get the updated datacenter
        updated = datacenter_repo.get_by_id(id)
        return datacenter_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding module to datacenter: {str(e)}")

@router.delete("/{id}/modules/{module_id}", response_description="Remove a module from a datacenter")
async def remove_module_from_datacenter(id: str, module_id: str):
    """Remove a module from a datacenter"""
    try:
        # Verify datacenter exists
        existing = datacenter_repo.get_by_id(id, include_modules=False)
        if not existing:
            raise HTTPException(status_code=404, detail=f"Datacenter with ID {id} not found")

        # Verify module exists and belongs to this datacenter
        placed_module = placed_module_repo.get_by_id(module_id)
        if not placed_module:
            raise HTTPException(status_code=404, detail=f"Module with ID {module_id} not found")

        if placed_module.get("datacenter_id") != id:
            raise HTTPException(status_code=400, detail=f"Module {module_id} does not belong to datacenter {id}")

        # Delete the module
        result = placed_module_repo.delete(module_id)

        # Get the updated datacenter
        updated = datacenter_repo.get_by_id(id)
        return datacenter_esquema(updated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing module from datacenter: {str(e)}")

@router.get("/style/{style_id}", response_description="Get datacenters by style")
async def get_datacenters_by_style(style_id: str):
    """Get all datacenters using a specific style"""
    try:
        datacenters = datacenter_repo.get_by_style_id(style_id)
        return datacenters_esquema(datacenters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving datacenters by style: {str(e)}")
