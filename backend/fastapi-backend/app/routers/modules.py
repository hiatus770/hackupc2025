from fastapi import APIRouter, HTTPException, status
from BD.cliente import cliente_modulos

from DB.modelos.modules import Module
from DB.esquemas.esquema_modules import module
from bson import ObjectId
'''
router = APIRouter(tags=["modules"])
cliente_modulos = cliente_modulos.plantas

def buscar_entidad(campo: str, clave):
    try:
        modelo = cliente_modelo.find_one({campo: clave})
        return Module(**module_esquema(module)) #User(**user_schema(user))
    except:
        return {"error": f"No se ha encontrado la entidad con los valores {campo} y {clave}"}
@router.get("/")
async def get_entidades():
    a =entidades_esquema(cliente_pvz.entidades.find()) 
    print(f"{a}")

    return entidades_esquema(cliente_pvz.entidades.find()) #devuelve una lista de entidades en formato json borja

@router.get("/{id}") #por path
async def get_entidad_id(id:str):
    return buscar_entidad("_id", ObjectId(id))

@router.get("/") #por query
async def get_entidad_id_query(id:str):
    return buscar_entidad("_id", ObjectId(id))

@router.post("/", response_model=Entidad, status_code=201) #por query
async def post_entidad(entidad: Entidad):
    if type(buscar_entidad("_id", ObjectId(entidad.id))) == Entidad:
        raise HTTPException(status_code=404, detail=f"La entidad con id {entidad.id} ya existe")
    entidad_dict = dict(entidad)
    del entidad_dict["id"] #Me aseguro que no tenga el atributo id

    id = cliente_entidad.insert_one(entidad_dict).inserted_id

    new_entidad = entidad_esquema(cliente_entidad.find_one({"_id":id}))
    return Entidad(**new_entidad)

'''
#pasando el crud 