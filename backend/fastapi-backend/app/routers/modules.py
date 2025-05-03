from fastapi import APIRouter, HTTPException, status
from DB.cliente import cliente_modulos
from DB.modelos.modules import Module
from DB.esquemas.esquema_modules import module_esquema, modules_esquema
from bson import ObjectId

router = APIRouter(tags=["modules"])
modules_collection = cliente_modulos["modules"]

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

@router.get("/{id}")
async def get_module_by_id(id: str):
    module = buscar_module("_id", ObjectId(id))
    if isinstance(module, dict) and "error" in module:
        raise HTTPException(status_code=404, detail=module["error"])
    return module

@router.get("/query")
async def get_module_by_query(id: str):
    module = buscar_module("_id", ObjectId(id))
    if isinstance(module, dict) and "error" in module:
        raise HTTPException(status_code=404, detail=module["error"])
    return module

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
