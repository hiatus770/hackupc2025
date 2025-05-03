from fastapi import APIRouter
from app.services.backend_service import some_backend_logic_function

router = APIRouter()

@router.get("/some-endpoint")
async def some_endpoint():
    result = some_backend_logic_function()
    return {"result": result}
