def module_esquema(module) -> dict:
    return {
        "ID": str(module["_id"]),
        "Name": module["Name"],
        "Is_Input": module["Is_Input"],
        "Is_Output": module["Is_Output"],
        "Unit": module["Unit"],
        "Amount": module["Amount"]
    }

def modules_esquema(modules) -> list: 
    return [module_esquema(module) for module in modules]
