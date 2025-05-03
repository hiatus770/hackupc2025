from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from bson.errors import InvalidId
from app.routers import modules, datacenter_spec, datacenter_styles, placed_modules, positions

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

# Add this to handle InvalidId exceptions with English error messages
@app.exception_handler(InvalidId)
async def invalid_id_exception_handler(request: Request, exc: InvalidId):
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid ID format"},
    )

# Include all routers
app.include_router(modules.router)
app.include_router(datacenter_spec.router)
app.include_router(datacenter_styles.router)
app.include_router(placed_modules.router)  
app.include_router(positions.router)
