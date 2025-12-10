from bson import ObjectId
from pydantic import BaseModel, Field
from pydantic import GetCoreSchemaHandler, GetJsonSchemaHandler
from pydantic.json_schema import JsonSchemaValue
from typing import Optional, Any
from pydantic import ConfigDict
import pydantic_core


class PyObjectId(ObjectId):
    """
    Custom ObjectId type for Pydantic v2.
    """

    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> pydantic_core.CoreSchema:
        return pydantic_core.core_schema.no_info_before_validator_function(
            cls.validate,
            pydantic_core.core_schema.str_schema(),
        )

    @classmethod
    def __get_pydantic_json_schema__(
        cls, core_schema: pydantic_core.CoreSchema, handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        json_schema = handler(core_schema)
        json_schema.update(type="string")
        return json_schema

    @classmethod
    def validate(cls, v: Any) -> ObjectId:
        if isinstance(v, ObjectId):
            return v
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)


class MongoModel(BaseModel):
    """
    Common base model for MongoDB documents.
    """

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
    )
