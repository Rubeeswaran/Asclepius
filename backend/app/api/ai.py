from fastapi import APIRouter

from ..services.ai_service import explain_research_context

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/explain")
def explain(target_id: int):
    context = {
        "target_id": target_id
    }

    return explain_research_context(context)