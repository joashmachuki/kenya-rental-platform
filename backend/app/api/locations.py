from fastapi import APIRouter
from app.utils.kenya_locations import get_counties, get_sub_counties, get_wards, get_all_locations

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/counties")
def counties():
    return {"counties": get_counties()}

@router.get("/sub-counties/{county}")
def sub_counties(county: str):
    return {"sub_counties": get_sub_counties(county)}

@router.get("/wards/{county}/{sub_county}")
def wards(county: str, sub_county: str):
    return {"wards": get_wards(county, sub_county)}

@router.get("/all")
def all_locations():
    return get_all_locations()
