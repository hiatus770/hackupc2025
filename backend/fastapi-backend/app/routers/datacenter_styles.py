from fastapi import APIRouter, HTTPException
from typing import List, Optional
from bson import ObjectId
from app.models.schemas import DatacenterStyle
from app.repositories.datacenter_style_repository import DatacenterStyleRepository
from DB.esquemas.esquema_datacenter_styles import datacenter_style_esquema, datacenter_styles_esquema
from pydantic import BaseModel

router = APIRouter(
    prefix="/datacenter-styles",
    tags=["datacenter_styles"],
    responses={404: {"description": "Not found"}}
)

datacenter_style_repo = DatacenterStyleRepository()

class StylesImport(BaseModel):
    styles: List[DatacenterStyle]

@router.get("/", response_description="Get all datacenter styles")
async def get_all_datacenter_styles():
    """Get all available datacenter styles"""
    styles = datacenter_style_repo.get_all()
    return datacenter_styles_esquema(styles)

@router.get("/{id}", response_description="Get a datacenter style by ID")
async def get_datacenter_style(id: str):
    """Get a specific datacenter style by ID"""
    style = datacenter_style_repo.get_by_id(id)
    if not style:
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    return datacenter_style_esquema(style)

@router.post("/", response_description="Create a new datacenter style", status_code=201)
async def create_datacenter_style(style: DatacenterStyle):
    """Create a new datacenter style"""
    try:
        style_dict = style.dict()
        id = datacenter_style_repo.create(style_dict)
        new_style = datacenter_style_repo.get_by_id(id)
        return datacenter_style_esquema(new_style)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating datacenter style: {str(e)}")

@router.put("/{id}", response_description="Update a datacenter style")
async def update_datacenter_style(id: str, style: DatacenterStyle):
    """Update an existing datacenter style"""
    if not ObjectId.is_valid(id) and not any(datacenter_style_repo.get_by_id(id)):
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    style_dict = style.dict(exclude={"id"})
    result = datacenter_style_repo.update(id, style_dict)

    if result.modified_count == 0:
        raise HTTPException(status_code=304, detail=f"Datacenter style {id} was not modified")

    updated_style = datacenter_style_repo.get_by_id(id)
    return datacenter_style_esquema(updated_style)

@router.delete("/{id}", response_description="Delete a datacenter style")
async def delete_datacenter_style(id: str):
    """Delete a datacenter style"""
    if not ObjectId.is_valid(id) and not any(datacenter_style_repo.get_by_id(id)):
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    result = datacenter_style_repo.delete(id)
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Datacenter style with ID {id} not found")

    return {"message": f"Datacenter style {id} deleted successfully"}

@router.get("/focus/{focus}", response_description="Get datacenter styles by focus")
async def get_datacenter_styles_by_focus(focus: str):
    """Get all datacenter styles of a specific focus type"""
    valid_focuses = ["processing", "storage", "network", "server"]
    if focus not in valid_focuses:
        raise HTTPException(status_code=400, detail=f"Invalid focus: {focus}. Must be one of {valid_focuses}")

    styles = datacenter_style_repo.get_by_focus(focus)
    return datacenter_styles_esquema(styles)

@router.post("/import", response_description="Import multiple datacenter styles", status_code=201)
async def import_datacenter_styles(import_request: StylesImport):
    """Import multiple datacenter styles at once"""
    if not import_request.styles:
        raise HTTPException(status_code=400, detail="No styles to import")

    try:
        styles_to_insert = [style.dict() for style in import_request.styles]
        result = datacenter_style_repo.bulk_create(styles_to_insert)
        return {
            "message": f"Successfully imported {len(result)} datacenter styles",
            "imported_count": len(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing datacenter styles: {str(e)}")

@router.delete("/all", response_description="Delete all datacenter styles")
async def delete_all_datacenter_styles(confirm: bool = False):
    """
    Delete all datacenter styles.
    WARNING: This will remove ALL datacenter styles and cannot be undone.
    """
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Confirmation required. Set 'confirm=true' to proceed with deletion."
        )

    try:
        result = datacenter_style_repo.collection.delete_many({})
        return {
            "message": f"Successfully deleted {result.deleted_count} datacenter styles",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting datacenter styles: {str(e)}")
