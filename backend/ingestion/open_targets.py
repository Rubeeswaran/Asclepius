import httpx

from backend.app.database import supabase


OPEN_TARGETS_URL = "https://api.platform.opentargets.org/api/v4/graphql"


def query_open_targets(query: str, variables: dict | None = None):
    response = httpx.post(
        OPEN_TARGETS_URL,
        json={
            "query": query,
            "variables": variables or {},
        },
        timeout=30,
    )

    response.raise_for_status()

    result = response.json()

    if "errors" in result:
        raise RuntimeError(result["errors"])

    return result["data"]


if __name__ == "__main__":
    disease_id = "MONDO_0007256"

    query = """
    query Disease($id: String!) {
        disease(efoId: $id) {
            id
            name
            associatedTargets {
                rows {
                    target {
                        id
                        approvedSymbol
                        approvedName
                    }
                    score
                }
            }
        }
    }
    """

    data = query_open_targets(
        query,
        {"id": disease_id}
    )

    disease = data["disease"]

    # Find Liver in Supabase
    organ_result = (
        supabase
        .table("organs")
        .select("id")
        .eq("name", "Liver")
        .single()
        .execute()
    )

    organ_id = organ_result.data["id"]

    # Insert disease
    disease_result = (
        supabase
        .table("diseases")
        .upsert(
            {
                "name": disease["name"],
                "source": "Open Targets",
                "source_id": disease["id"],
                "organ_id": organ_id,
            },
            on_conflict="source,source_id",
        )
        .execute()
    )

    disease_db_id = disease_result.data[0]["id"]

    print(f"Stored disease: {disease['name']}")

    # Insert targets + disease-target relationships
    for row in disease["associatedTargets"]["rows"]:
        target = row["target"]

        target_result = (
            supabase
            .table("targets")
            .upsert(
                {
                    "name": target["approvedName"],
                    "symbol": target["approvedSymbol"],
                    "source": "Open Targets",
                    "source_id": target["id"],
                },
                on_conflict="source,source_id",
            )
            .execute()
        )

        target_db_id = target_result.data[0]["id"]

        (
            supabase
            .table("disease_targets")
            .upsert(
                {
                    "disease_id": disease_db_id,
                    "target_id": target_db_id,
                    "score": row["score"],
                    "source": "Open Targets",
                },
                on_conflict="disease_id,target_id,source",
            )
            .execute()
        )

        print(
            f"Stored target: {target['approvedSymbol']} "
            f"| score: {row['score']}"
        )

    print("Open Targets ingestion complete.")