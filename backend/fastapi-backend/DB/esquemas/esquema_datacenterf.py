def datacenter_esquema(datacenter) -> dict:
    return {
        "ID": str(datacenter["_id"]),
        "Name": datacenter["Name"],
        "Below_Amount": datacenter["Below_Amount"],
        "Above_Amount": datacenter["Above_Amount"],
        "Minimize": datacenter["Minimize"],
        "Maximize": datacenter["Maximize"],
        "Unconstrained": datacenter["Unconstrained"],
        "Unit": datacenter["Unit"],
        "Amount": datacenter["Amount"]
    }

def datacenters_esquema(datacenters) -> list:
    return [datacenter_esquema(datacenter) for datacenter in datacenters]