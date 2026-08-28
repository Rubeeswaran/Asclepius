from fastapi import APIRouter, Query

from ..database import supabase

router = APIRouter()


@router.get("/search")
def search(q: str = Query(..., min_length=1)):
    query = q.strip()

    diseases = (
        supabase
        .table("diseases")
        .select("id, name, source, source_id")
        .ilike("name", f"%{query}%")
        .limit(10)
        .execute()
        .data
    )

    targets = (
        supabase
        .table("targets")
        .select("id, name, symbol, source, source_id")
        .or_(f"name.ilike.%{query}%,symbol.ilike.%{query}%")
        .limit(10)
        .execute()
        .data
    )

    compounds = (
        supabase
        .table("compounds")
        .select("id, name, chembl_id")
        .ilike("name", f"%{query}%")
        .limit(10)
        .execute()
        .data
    )

    return {
        "query": query,
        "diseases": diseases,
        "targets": targets,
        "compounds": compounds,
    }