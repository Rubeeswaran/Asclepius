from fastapi import APIRouter, HTTPException

from ..database import supabase

router = APIRouter(prefix="/compounds", tags=["Compounds"])


@router.get("/{compound_id}")
def get_compound(compound_id: int):
    compound_result = (
        supabase
        .table("compounds")
        .select("id, name, chembl_id")
        .eq("id", compound_id)
        .maybe_single()
        .execute()
    )

    compound = compound_result.data if compound_result else None

    if not compound:
        raise HTTPException(
            status_code=404,
            detail="Compound not found",
        )

    targets = (
        supabase
        .table("target_compounds")
        .select(
            "activity, activity_type, source, target_id, "
            "targets(id, name, symbol, source, source_id)"
        )
        .eq("compound_id", compound_id)
        .execute()
        .data
    )

    targets = targets or []

    formatted_targets = [
        {
            "id": item["targets"]["id"],
            "name": item["targets"]["name"],
            "symbol": item["targets"]["symbol"],
            "source": item["targets"]["source"],
            "source_id": item["targets"]["source_id"],
            "activity": item["activity"],
            "activity_type": item["activity_type"],
            "relationship_source": item["source"],
        }
        for item in targets
    ]

    return {
        "compound": compound,
        "targets": formatted_targets,
    }