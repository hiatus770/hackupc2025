from fastapi import APIRouter, HTTPException
from typing import List
from DB.cliente import cliente_modulos    # Modelo de MongoDB para Data Center
from DB.esquemas.esquema_datacenterf import datacenter_esquema, datacenters_esquema  # Esquemas para serialización
from bson import ObjectId

router = APIRouter(tags=["data_center_specs"])

@router.get("/", response_model=List[dict])
async def get_all_specs():
    """Obtiene todos los registros de Data Center."""
    specs = datacenters_esquema(cliente_modulos.find())
    return specs

@router.get("/{id}", response_model=dict)
async def get_spec_by_id(id: str):
    """Obtiene un registro de Data Center por ID."""
    try:
        spec = cliente_modulos.find_one({"_id": ObjectId(id)})
        if not spec:
            raise HTTPException(status_code=404, detail=f"No se encontró una especificación con ID {id}")
        return datacenter_esquema(spec)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

@router.post("/", response_model=dict, status_code=201)
async def create_spec(spec: datacenter_spec):
    """Crea un nuevo registro de Data Center."""
    spec_dict = spec.dict()
    inserted_id = cliente_modulos.insert_one(spec_dict).inserted_id
    new_spec = cliente_modulos.find_one({"_id": inserted_id})
    return datacenter_esquema(new_spec)

@router.put("/{id}", response_model=dict)
async def update_spec(id: str, updated_spec: datacenter_spec):
    """Actualiza un registro existente de Data Center."""
    try:
        result = cliente_modulos.update_one({"_id": ObjectId(id)}, {"$set": updated_spec.dict()})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"No se encontró una especificación con ID {id}")
        updated = cliente_modulos.find_one({"_id": ObjectId(id)})
        return datacenter_esquema(updated)
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")

@router.delete("/{id}", response_model=dict)
async def delete_spec(id: str):
    """Elimina un registro de Data Center por ID."""
    try:
        result = cliente_modulos.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"No se encontró una especificación con ID {id}")
        return {"message": f"Especificación con ID {id} eliminada correctamente"}
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")