from fastapi import APIRouter, HTTPException

from ..database import supabase

router = APIRouter(prefix="/diseases", tags=["Diseases"])


@router.get("/{disease_id}")
def get_disease(disease_id: int):
    disease_result = (
        supabase
        .table("diseases")
        .select("id, name, source, source_id, organ_id")
        .eq("id", disease_id)
        .maybe_single()
        .execute()
    )

    disease = disease_result.data if disease_result else None

    if not disease:
        raise HTTPException(
            status_code=404,
            detail="Disease not found",
        )

    relationships = (
        supabase
        .table("disease_targets")
        .select(
            "score, source, target_id, "
            "targets(id, name, symbol, source, source_id)"
        )
        .eq("disease_id", disease_id)
        .execute()
    )

    # Format the target data for a clean API response
    targets = relationships.data or []

    formatted_targets = [
        {
            "id": item["targets"]["id"],
            "name": item["targets"]["name"],
            "symbol": item["targets"]["symbol"],
            "source": item["targets"]["source"],
            "source_id": item["targets"]["source_id"],
            "score": item["score"],
            "relationship_source": item["source"],
        }
        for item in targets
    ]

    return {
        "disease": disease,
        "targets": formatted_targets,
    }