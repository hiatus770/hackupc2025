from bson import ObjectId
from DB.cliente import get_database
from app.models.schemas import DatacenterSpec

class DatacenterSpecRepository:
    def __init__(self):
        db = get_database()
        self.collection = db["datacenter_specs"]

    def create(self, datacenter_spec: dict) -> str:
        result = self.collection.insert_one(datacenter_spec)
        return str(result.inserted_id)

    def get_by_id(self, id: str):
        return self.collection.find_one({"_id": ObjectId(id)})

    def get_all(self):
        return list(self.collection.find())

    def update(self, id: str, datacenter_spec: dict):
        return self.collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": datacenter_spec}
        )

    def delete(self, id: str):
        return self.collection.delete_one({"_id": ObjectId(id)})

    def bulk_create(self, datacenter_specs: list) -> list:
        """Insert multiple datacenter specs at once"""
        if not datacenter_specs:
            return []
        result = self.collection.insert_many(datacenter_specs)
        return [str(id) for id in result.inserted_ids]

    def get_by_component_id(self, component_id: str):
        """Get all specs for a specific component ID"""
        return list(self.collection.find({"ID": component_id}))

    def get_by_component_and_unit(self, component_id: str, unit: str):
        """Get a specific component property by ID and Unit"""
        return self.collection.find_one({"ID": component_id, "Unit": unit})
