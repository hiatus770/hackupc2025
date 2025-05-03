from fastapi import FastAPI
from app.routers import modules  # Make sure this import is correct

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}

app.include_router(modules.router, prefix="/datacenter-specs")
app.include_router(modules.router, prefix="/modules")
