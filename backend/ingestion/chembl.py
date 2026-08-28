import httpx

from backend.app.database import supabase


CHEMBL_URL = "https://www.ebi.ac.uk/chembl/api/data"


def get_chembl_activities(target_chembl_id: str):
    url = f"{CHEMBL_URL}/activity.json"

    response = httpx.get(
        url,
        params={
            "target_chembl_id": target_chembl_id,
            "standard_type__in": "IC50,Ki,Kd,EC50",
            "limit": 10,
        },
        timeout=30,
    )

    response.raise_for_status()

    return response.json()


def store_compounds(target_db_id: int, target_chembl_id: str):
    data = get_chembl_activities(target_chembl_id)

    activities = data.get("activities", [])

    print(f"Found {len(activities)} activities")

    for activity in activities:
        chembl_id = activity.get("molecule_chembl_id")
        value = activity.get("standard_value")
        activity_type = activity.get("standard_type")

        if not chembl_id or value is None:
            continue

        # Store compound
        compound_result = (
            supabase
            .table("compounds")
            .upsert(
                {
                    "chembl_id": chembl_id,
                    "name": None,
                },
                on_conflict="chembl_id",
            )
            .execute()
        )

        compound_db_id = compound_result.data[0]["id"]

        # Store target-compound relationship
        (
            supabase
            .table("target_compounds")
            .upsert(
                {
                    "target_id": target_db_id,
                    "compound_id": compound_db_id,
                    "activity": float(value),
                    "activity_type": activity_type,
                    "source": "ChEMBL",
                },
                on_conflict="target_id,compound_id,source",
            )
            .execute()
        )

        print(
            f"Stored compound: {chembl_id} "
            f"| {activity_type}: {value} nM"
        )


if __name__ == "__main__":

    # TP53 → human ChEMBL target
    chembl_target_id = "CHEMBL4096"

    # Our Supabase target ID for TP53
    target_result = (
        supabase
        .table("targets")
        .select("id")
        .eq("symbol", "TP53")
        .single()
        .execute()
    )

    target_db_id = target_result.data["id"]

    store_compounds(
        target_db_id,
        chembl_target_id,
    )

    print("ChEMBL ingestion complete.")