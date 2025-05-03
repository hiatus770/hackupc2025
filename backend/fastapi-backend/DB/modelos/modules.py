from pydantic import BaseModel, Field
from typing import Optional


class Module(BaseModel):
    ID: Optional[str] = None
    Name: str
    Is_Input: int
    Is_Output: int
    Unit: str
    Amount: int

    class Config:
        from_attributes = True
