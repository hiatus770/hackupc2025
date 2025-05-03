from fastapi import APIRouter, HTTPException, File, UploadFile
from bson import ObjectId
from app.models.schemas import DatacenterSpec
from app.repositories.datacenter_spec_repository import DatacenterSpecRepository
from DB.esquemas.esquema_datacenter_specs import datacenter_spec_esquema, datacenter_specs_esquema
from typing import List
import csv
import io
from pydantic import BaseModel

router = APIRouter()
datacenter_spec_repo = DatacenterSpecRepository()

class CSVImportRequest(BaseModel):
    csv_data: str

@router.post("/datacenter-specs", response_description="Create a new datacenter specification")
async def create_datacenter_spec(datacenter_spec: DatacenterSpec):
    datacenter_spec_dict = datacenter_spec.dict(exclude={"id"})

    id = datacenter_spec_repo.create(datacenter_spec_dict)

    new_spec = datacenter_spec_repo.get_by_id(id)
    return datacenter_spec_esquema(new_spec)

@router.get("/datacenter-specs", response_description="List all datacenter specifications")
async def list_datacenter_specs():
    datacenter_specs = datacenter_spec_repo.get_all()
    return datacenter_specs_esquema(datacenter_specs)

@router.get("/datacenter-specs/{id}", response_description="Get a datacenter specification by id")
async def get_datacenter_spec(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid id format: {id}")

    datacenter_spec = datacenter_spec_repo.get_by_id(id)
    if datacenter_spec is None:
        raise HTTPException(status_code=404, detail=f"Datacenter specification {id} not found")

    return datacenter_spec_esquema(datacenter_spec)

@router.put("/datacenter-specs/{id}", response_description="Update a datacenter specification")
async def update_datacenter_spec(id: str, datacenter_spec: DatacenterSpec):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid id format: {id}")

    datacenter_spec_dict = datacenter_spec.dict(exclude={"id"})
    result = datacenter_spec_repo.update(id, datacenter_spec_dict)

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail=f"Datacenter specification {id} not found")

    updated_spec = datacenter_spec_repo.get_by_id(id)
    return datacenter_spec_esquema(updated_spec)

@router.delete("/datacenter-specs/{id}", response_description="Delete a datacenter specification")
async def delete_datacenter_spec(id: str):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail=f"Invalid id format: {id}")

    result = datacenter_spec_repo.delete(id)

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Datacenter specification {id} not found")

    return {"message": f"Datacenter specification {id} deleted successfully"}

@router.post("/datacenter-specs/import", response_description="Import datacenter specifications from CSV")
async def import_datacenter_specs(import_request: CSVImportRequest):
    """
    Import datacenter specifications from CSV data

    CSV Format: ID;Name;Below_Amount;Above_Amount;Minimize;Maximize;Unconstrained;Unit;Amount
    """
    specs_to_insert = []
    try:
        for row in import_request.csv_data.strip().split("\n"):
            if not row.strip():
                continue

            parts = row.split(";")
            if len(parts) != 9:
                continue  # Skip invalid rows

            spec = {
                "ID": parts[0],
                "Name": parts[1],
                "Below_Amount": int(parts[2]),
                "Above_Amount": int(parts[3]),
                "Minimize": int(parts[4]),
                "Maximize": int(parts[5]),
                "Unconstrained": int(parts[6]),
                "Unit": parts[7],
                "Amount": int(parts[8])
            }
            specs_to_insert.append(spec)

        result = datacenter_spec_repo.bulk_create(specs_to_insert)
        return {"message": f"Imported {len(result)} datacenter specifications"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing data: {str(e)}")

@router.get("/datacenter-specs/component/{component_id}", response_description="Get all specifications for a component")
async def get_component_specs(component_id: str):
    specs = datacenter_spec_repo.get_by_component_id(component_id)
    if not specs:
        raise HTTPException(status_code=404, detail=f"No specifications found for component {component_id}")

    return datacenter_specs_esquema(specs)
