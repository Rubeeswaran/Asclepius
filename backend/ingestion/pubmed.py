import httpx
import xml.etree.ElementTree as ET

from backend.app.database import supabase


PUBMED_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


def search_pubmed(term: str, limit: int = 10):
    response = httpx.get(
        f"{PUBMED_URL}/esearch.fcgi",
        params={
            "db": "pubmed",
            "term": term,
            "retmode": "json",
            "retmax": limit,
        },
        timeout=30,
    )

    response.raise_for_status()

    return response.json()["esearchresult"]["idlist"]


def get_pubmed_articles(pmids: list[str]):
    if not pmids:
        return []

    response = httpx.get(
        f"{PUBMED_URL}/efetch.fcgi",
        params={
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "xml",
        },
        timeout=30,
    )

    response.raise_for_status()

    root = ET.fromstring(response.text)

    articles = []

    for article in root.findall(".//PubmedArticle"):
        pmid_element = article.find(".//PMID")
        title_element = article.find(".//ArticleTitle")

        pmid = pmid_element.text if pmid_element is not None else None

        title = (
            "".join(title_element.itertext())
            if title_element is not None
            else None
        )

        year_element = article.find(
            ".//PubDate/Year"
        )

        if year_element is not None:
            publication_date = f"{year_element.text}-01-01"
        else:
            publication_date = None

        if pmid:
            articles.append(
                {
                    "pmid": pmid,
                    "title": title,
                    "publication_date": publication_date,
                }
            )

    return articles


def store_publications(articles):
    for article in articles:

        result = (
            supabase
            .table("publications")
            .upsert(
                {
                    "pmid": article["pmid"],
                    "title": article["title"],
                    "publication_date": article["publication_date"],
                },
                on_conflict="pmid",
            )
            .execute()
        )

        print(
            f"Stored publication: "
            f"PMID {article['pmid']} | "
            f"{article['title']}"
        )


if __name__ == "__main__":

    search_term = (
        '"hepatocellular carcinoma" '
        'AND (TP53 OR CTNNB1 OR MET)'
    )

    print(f"Searching PubMed for: {search_term}")

    pmids = search_pubmed(
        search_term,
        limit=10,
    )

    print(f"Found {len(pmids)} publications")

    articles = get_pubmed_articles(pmids)

    store_publications(articles)

    print("PubMed ingestion complete.")