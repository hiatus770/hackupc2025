from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class Message(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    detail: str

class SuccessResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None

class Module(BaseModel):
    ID: Optional[str] = None
    Name: str
    Is_Input: int
    Is_Output: int
    Unit: str
    Amount: int

    class Config:
        from_attributes = True

class DatacenterSpec(BaseModel):
    ID: str
    Name: str
    Below_Amount: int
    Above_Amount: int
    Minimize: int
    Maximize: int
    Unconstrained: int
    Unit: str
    Amount: int
    id: Optional[str] = Field(None, alias="_id")

    class Config:
        from_attributes = True
        populate_by_name = True
