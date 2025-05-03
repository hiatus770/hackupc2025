from fastapi import APIRouter, HTTPException, status
from DB.cliente import cliente_modulos
from DB.modelos import Module
from DB.esquemas.esquema_modules import module_esquema, modules_esquema
from bson import ObjectId

router = APIRouter(tags=["modules"])
cliente_modulos = cliente_modulos.modules  # Cambiado para usar la colección de módulos

def buscar_module(campo: str, clave):
    try:
        module = cliente_modulos.find_one({campo: clave})
        if module:
            return Module(**module_esquema(module))
        else:
            raise ValueError
    except:
        return {"error": f"No se ha encontrado el módulo con los valores {campo} y {clave}"}

@router.get("/")
async def get_modules():
    modules = modules_esquema(cliente_modulos.find())
    return modules  # Devuelve una lista de módulos en formato JSON

@router.get("/{id}")  # Por path
async def get_module_by_id(id: str):
    module = buscar_module("_id", ObjectId(id))
    if "error" in module:
        raise HTTPException(status_code=404, detail=module["error"])
    return module

@router.get("/query")  # Por query
async def get_module_by_query(id: str):
    module = buscar_module("_id", ObjectId(id))
    if "error" in module:
        raise HTTPException(status_code=404, detail=module["error"])
    return module

@router.post("/", response_model=Module, status_code=201)  # Crear un módulo
async def post_module(module: Module):
    if isinstance(buscar_module("_id", ObjectId(module.id)), Module):
        raise HTTPException(status_code=400, detail=f"El módulo con id {module.id} ya existe")
    
    module_dict = module.dict()
    del module_dict["id"]  # Asegurarse de que no tenga el atributo id

    id = cliente_modulos.insert_one(module_dict).inserted_id

    new_module = module_esquema(cliente_modulos.find_one({"_id": id}))
    return Module(**new_module)    pip install fastapi bson