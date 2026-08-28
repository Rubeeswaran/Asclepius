import httpx

from backend.app.database import supabase


CHEMBL_URL = "https://www.ebi.ac.uk/chembl/api/data"

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "Asclepius/1.0",
}


def get_chembl_activities(target_chembl_id: str, required: int = 10):
    """
    Fetch usable quantitative IC50 measurements from ChEMBL.

    Only activities containing:
      - standard_value
      - standard_type = IC50
      - standard_units
    are retained.
    """

    url = f"{CHEMBL_URL}/activity.json"

    print("Requesting filtered ChEMBL IC50 activities...")

    response = httpx.get(
        url,
        params={
            "target_chembl_id": target_chembl_id,
            "standard_type": "IC50",
            "standard_units": "nM",
            "limit": required,
            "offset": 0,
        },
        headers=HEADERS,
        timeout=60,
    )

    response.raise_for_status()

    payload = response.json()

    activities = payload.get("activities", [])

    valid_activities = []

    for activity in activities:
        standard_value = activity.get("standard_value")
        standard_type = activity.get("standard_type")
        standard_units = activity.get("standard_units")

        if standard_value is None:
            continue

        if standard_type is None:
            continue

        if standard_units is None:
            continue

        if standard_type.upper() != "IC50":
            continue

        valid_activities.append(activity)

        if len(valid_activities) >= required:
            break

    print(f"Found {len(valid_activities)} usable IC50 activities")

    return valid_activities


def get_compound(chembl_id: str):
    """
    Fetch complete molecule metadata from ChEMBL.
    """

    url = f"{CHEMBL_URL}/molecule/{chembl_id}.json"

    print(f"Fetching compound metadata: {chembl_id}")

    response = httpx.get(
        url,
        headers=HEADERS,
        timeout=60,
    )

    response.raise_for_status()

    return response.json()


def extract_compound_metadata(molecule: dict):
    """
    Extract meaningful fields from a ChEMBL molecule response.
    """

    chembl_id = molecule.get("molecule_chembl_id")

    # Preferred compound name.
    name = molecule.get("pref_name") or chembl_id

    if name:
        name = name.strip()

    # ChEMBL molecule properties.
    properties = molecule.get("molecule_properties") or {}

    # ChEMBL stores structural information separately.
    structures = molecule.get("molecule_structures") or {}

    canonical_smiles = structures.get("canonical_smiles")

    # Correct ChEMBL property names.
    molecular_formula = properties.get("full_molformula")
    molecular_weight = properties.get("full_mwt")

    # ChEMBL max_phase may be numeric.
    max_phase = molecule.get("max_phase")

    return {
        "chembl_id": chembl_id,
        "name": name,
        "canonical_smiles": canonical_smiles,
        "molecular_formula": molecular_formula,
        "molecular_weight": (
            float(molecular_weight)
            if molecular_weight is not None
            else None
        ),
        "max_phase": (
            int(max_phase)
            if max_phase is not None
            else None
        ),
        "source": "ChEMBL",
    }


def store_compound(chembl_id: str):
    """
    Fetch and store complete compound metadata.
    """

    molecule = get_compound(chembl_id)

    data = extract_compound_metadata(molecule)

    result = (
        supabase
        .table("compounds")
        .upsert(
            data,
            on_conflict="chembl_id",
        )
        .execute()
    )

    if not result.data:
        raise RuntimeError(
            f"Failed to store compound {chembl_id}"
        )

    return result.data[0]


def get_compound_id(chembl_id: str):
    """
    Get internal compounds.id from ChEMBL ID.
    """

    result = (
        supabase
        .table("compounds")
        .select("id")
        .eq("chembl_id", chembl_id)
        .single()
        .execute()
    )

    return result.data["id"]


def store_activity(
    target_id: int,
    compound_id: int,
    activity: dict,
):
    """
    Store an individual ChEMBL experimental measurement.

    Each ChEMBL activity is preserved separately.
    """

    standard_value = activity.get("standard_value")
    standard_type = activity.get("standard_type")
    standard_units = activity.get("standard_units")

    if standard_value is None:
        return

    if standard_type is None:
        return

    if standard_units is None:
        return

    data = {
        "target_id": target_id,
        "compound_id": compound_id,
        "activity": float(standard_value),
        "activity_type": standard_type,
        "activity_units": standard_units,
        "source": "ChEMBL",

        # Preserve the original ChEMBL experiment information.
        "chembl_activity_id": activity.get("activity_id"),
        "assay_chembl_id": activity.get("assay_chembl_id"),
        "pchembl_value": (
            float(activity["pchembl_value"])
            if activity.get("pchembl_value") is not None
            else None
        ),
        "relation": activity.get("standard_relation"),
    }

    # First check whether this exact ChEMBL activity
    # has already been stored.
    chembl_activity_id = data["chembl_activity_id"]

    if chembl_activity_id is not None:

        existing = (
            supabase
            .table("target_compounds")
            .select("id")
            .eq(
                "chembl_activity_id",
                chembl_activity_id,
            )
            .execute()
        )

        if existing.data:
            (
                supabase
                .table("target_compounds")
                .update(data)
                .eq(
                    "chembl_activity_id",
                    chembl_activity_id,
                )
                .execute()
            )

            return

    # Otherwise insert a new experimental measurement.
    (
        supabase
        .table("target_compounds")
        .insert(data)
        .execute()
    )


def main():

    # =====================================================
    # Target
    # =====================================================

    target_chembl_id = "CHEMBL4096"

    # Our internal targets.id
    # TP53
    target_id = 1

    # =====================================================
    # Fetch activities
    # =====================================================

    activities = get_chembl_activities(
        target_chembl_id,
        required=10,
    )

    processed_compounds = set()

    # =====================================================
    # Process activities
    # =====================================================

    for activity in activities:

        chembl_id = activity.get(
            "molecule_chembl_id"
        )

        if not chembl_id:
            continue

        # -------------------------------------------------
        # Store compound metadata
        # -------------------------------------------------

        if chembl_id not in processed_compounds:

            compound = store_compound(
                chembl_id
            )

            processed_compounds.add(
                chembl_id
            )

            print(
                f"Stored compound: {chembl_id} | "
                f"Name: {compound.get('name')} | "
                f"Formula: {compound.get('molecular_formula')} | "
                f"MW: {compound.get('molecular_weight')}"
            )

        # -------------------------------------------------
        # Get internal compound ID
        # -------------------------------------------------

        compound_id = get_compound_id(
            chembl_id
        )

        # -------------------------------------------------
        # Store experimental activity
        # -------------------------------------------------

        store_activity(
            target_id=target_id,
            compound_id=compound_id,
            activity=activity,
        )

        print(
            f"Stored activity: {chembl_id} | "
            f"{activity.get('standard_type')}: "
            f"{activity.get('standard_value')} "
            f"{activity.get('standard_units')} | "
            f"Activity ID: "
            f"{activity.get('activity_id')}"
        )

    print()
    print("ChEMBL ingestion complete.")


if __name__ == "__main__":
    main()