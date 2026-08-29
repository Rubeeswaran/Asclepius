import os

from dotenv import load_dotenv
from google import genai

from ..database import supabase


load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")

client = genai.Client(api_key=GEMINI_API_KEY)


def explain_research_context(context: dict) -> dict:
    target_id = context["target_id"]

    # Get target
    target_result = (
        supabase
        .table("targets")
        .select("id, name, symbol, source, source_id")
        .eq("id", target_id)
        .single()
        .execute()
    )

    target = target_result.data

    if not target:
        return {
            "error": "Target not found"
        }

    # Get disease relationships
    diseases_result = (
        supabase
        .table("disease_targets")
        .select(
            "score, source, disease_id, "
            "diseases(id, name, source, source_id, organ_id)"
        )
        .eq("target_id", target_id)
        .execute()
    )

    diseases = []

    for item in diseases_result.data or []:
        disease = item.get("diseases")

        if disease:
            diseases.append({
                "id": disease["id"],
                "name": disease["name"],
                "source": disease["source"],
                "source_id": disease["source_id"],
                "organ_id": disease["organ_id"],
                "association_score": item["score"],
                "relationship_source": item["source"],
            })

    # Get compound relationships
    compounds_result = (
        supabase
        .table("target_compounds")
        .select(
            "activity, activity_type, source, compound_id, "
            "compounds(id, name, chembl_id)"
        )
        .eq("target_id", target_id)
        .execute()
    )

    compounds = []

    for item in compounds_result.data or []:
        compound = item.get("compounds")

        if compound:
            compounds.append({
                "id": compound["id"],
                "name": compound["name"],
                "chembl_id": compound["chembl_id"],
                "activity": item["activity"],
                "activity_type": item["activity_type"],
                "relationship_source": item["source"],
            })

    # Build research context
    research_context = {
        "target": target,
        "diseases": diseases,
        "compounds": compounds,
    }

    # Send the research context to Gemini
    prompt = f"""
You are an evidence-grounded biomedical research assistant.

Use ONLY the supplied Asclepius research data.

Your task is to explain the relationships shown in the data.

Rules:
- Do not invent facts, evidence, publications, or relationships.
- Do not interpret an Open Targets score as a probability or percentage.
- Refer to it as an "Open Targets association score".
- Do not claim that an association score proves causation.
- Do not compare IC50 values across different assays as if they are directly comparable.
- Preserve activity types and values exactly as provided.
- If multiple measurements exist for a compound, state that multiple measurements are available.
- Clearly separate database evidence from your interpretation.
- Do not claim that compound activity proves clinical effectiveness.
- Do not provide medical advice.
- If the supplied data is insufficient to make a conclusion, explicitly say so.
- Do not infer the biological meaning of an activity measurement beyond the supplied activity_type.
- If the data only says IC50, refer to it as a reported IC50 measurement.
- Do not describe an IC50 measurement as binding or functional inhibition unless the supplied data explicitly supports that interpretation.

Return the answer in these sections:

1. Summary
2. Disease relationship
3. Compound relationships
4. Evidence available
5. Interpretation
6. Limitations

Keep the explanation clear and understandable to a researcher.

Research data:
{research_context}
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return {
        "target": target,
        "diseases": diseases,
        "compounds": compounds,
        "explanation": response.text,
    }