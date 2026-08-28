from fastapi import APIRouter

from ..database import supabase

router = APIRouter(prefix="/evidence", tags=["Evidence"])


@router.get("/disease/{disease_id}")
def disease_evidence(disease_id: int):
    results = (
        supabase
        .table("disease_targets")
        .select(
            "disease_id, target_id, score, source"
        )
        .eq("disease_id", disease_id)
        .execute()
    )

    return {
        "disease_id": disease_id,
        "evidence": results.data or [],
    }


@router.get("/target/{target_id}")
def target_evidence(target_id: int):
    results = (
        supabase
        .table("target_compounds")
        .select(
            "target_id, compound_id, "
            "activity, activity_type, source"
        )
        .eq("target_id", target_id)
        .execute()
    )

    return {
        "target_id": target_id,
        "evidence": results.data or [],
    }