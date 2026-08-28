from fastapi import APIRouter, HTTPException

from ..database import supabase

router = APIRouter(prefix="/targets", tags=["Targets"])


@router.get("/{target_id}")
def get_target(target_id: int):
    target_result = (
        supabase
        .table("targets")
        .select("id, name, symbol, source, source_id")
        .eq("id", target_id)
        .maybe_single()
        .execute()
    )

    target = target_result.data if target_result else None

    if not target:
        raise HTTPException(
            status_code=404,
            detail="Target not found",
        )

    diseases = (
        supabase
        .table("disease_targets")
        .select(
            "score, source, disease_id, "
            "diseases(id, name, source, source_id, organ_id)"
        )
        .eq("target_id", target_id)
        .execute()
        .data
    )

    compounds = (
        supabase
        .table("target_compounds")
        .select(
            "activity, activity_type, source, compound_id, "
            "compounds(id, name, chembl_id)"
        )
        .eq("target_id", target_id)
        .execute()
        .data
    )

    diseases = diseases or []
    compounds = compounds or []

    formatted_diseases = [
        {
            "id": item["diseases"]["id"],
            "name": item["diseases"]["name"],
            "source": item["diseases"]["source"],
            "source_id": item["diseases"]["source_id"],
            "organ_id": item["diseases"]["organ_id"],
            "score": item["score"],
            "relationship_source": item["source"],
        }
        for item in diseases
    ]

    formatted_compounds = [
        {
            "id": item["compounds"]["id"],
            "name": item["compounds"]["name"],
            "chembl_id": item["compounds"]["chembl_id"],
            "activity": item["activity"],
            "activity_type": item["activity_type"],
            "relationship_source": item["source"],
        }
        for item in compounds
    ]

    return {
        "target": target,
        "diseases": formatted_diseases,
        "compounds": formatted_compounds,
    }