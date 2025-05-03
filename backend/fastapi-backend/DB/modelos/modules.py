from pydantic import BaseModel


class Module(BaseModel):
    ID: str = None
    Name: str 
    Is_Input: int 
    Is_Output: int 
    Unit: str
    Amount: int 



