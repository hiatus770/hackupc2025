from fastapi import FastAPI
from app.api.endpoints.router import router
from app.routers import modules  

app = FastAPI()

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

app.include_router(modules.router)
