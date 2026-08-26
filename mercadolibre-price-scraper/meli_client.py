"""Client to fetch product data from MercadoLibre.

Two strategies are provided:

1. ``get_item`` / ``search_products``: use MercadoLibre's public REST API
   (https://api.mercadolibre.com). This is the preferred approach: it
   returns structured JSON, is far more stable than HTML scraping, and
   needs no authentication for public read-only endpoints.

2. ``scrape_item_page``: a fallback that parses the product's HTML page
   with BeautifulSoup, for cases where you only have a product URL and
   want the current listing price shown on the page. HTML scraping is
   fragile (breaks when MercadoLibre changes its markup) and should be
   used only when the API route above doesn't fit your case.

Both strategies respect basic etiquette: a descriptive User-Agent, a
timeout on every request, and a small delay is left to the caller
(see monitor.py) between requests to avoid hammering the site.
"""

import re
import time
from typing import Optional
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

API_BASE = "https://api.mercadolibre.com"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (compatible; PriceMonitorBot/1.0; "
        "+https://github.com/) price-monitor-personal-use"
    )
}

REQUEST_TIMEOUT = 15
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 2


def _request_with_retries(method: str, url: str, **kwargs) -> requests.Response:
    last_exc = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = requests.request(
                method, url, headers=HEADERS, timeout=REQUEST_TIMEOUT, **kwargs
            )
            if response.status_code == 429:
                # Rate limited: back off and retry.
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)
                continue
            response.raise_for_status()
            return response
        except requests.RequestException as exc:
            last_exc = exc
            time.sleep(RETRY_BACKOFF_SECONDS * attempt)
    raise RuntimeError(f"Request to {url} failed after {MAX_RETRIES} attempts") from last_exc


def get_item(item_id: str) -> dict:
    """Fetch a single item by its MercadoLibre ID (e.g. 'MLA1234567890')."""
    url = f"{API_BASE}/items/{item_id}"
    response = _request_with_retries("GET", url)
    data = response.json()
    return {
        "id": data.get("id"),
        "title": data.get("title"),
        "price": data.get("price"),
        "currency": data.get("currency_id"),
        "available_quantity": data.get("available_quantity"),
        "url": data.get("permalink"),
    }


def search_products(site_id: str, query: str, limit: int = 5) -> list:
    """Search products by keyword and return the top results.

    site_id examples: MLA (Argentina), MLM (Mexico), MCO (Colombia),
    MLB (Brasil), MLC (Chile), MPE (Peru), MLU (Uruguay).
    """
    url = f"{API_BASE}/sites/{site_id}/search"
    response = _request_with_retries(
        "GET", url, params={"q": query, "limit": limit}
    )
    data = response.json()
    results = []
    for item in data.get("results", []):
        results.append(
            {
                "id": item.get("id"),
                "title": item.get("title"),
                "price": item.get("price"),
                "currency": item.get("currency_id"),
                "url": item.get("permalink"),
            }
        )
    return results


def extract_item_id_from_url(url: str) -> Optional[str]:
    """Try to extract a MercadoLibre item ID (e.g. MLA123456789) from a product URL."""
    match = re.search(r"(ML[A-Z]-?\d+)", url.upper())
    if not match:
        return None
    return match.group(1).replace("-", "")


def scrape_item_page(url: str) -> dict:
    """Fallback: fetch the product HTML page and parse title/price.

    Use this only when you can't resolve the item through the API
    (for example, some shortened or campaign URLs). MercadoLibre may
    change its markup at any time, which can break the selectors below.
    """
    parsed = urlparse(url)
    if not parsed.scheme or not parsed.netloc:
        raise ValueError(f"Invalid URL: {url}")

    response = _request_with_retries("GET", url)
    soup = BeautifulSoup(response.text, "lxml")

    title_tag = soup.find("h1", class_=re.compile("ui-pdp-title"))
    title = title_tag.get_text(strip=True) if title_tag else None

    price = None
    meta_price = soup.find("meta", itemprop="price")
    if meta_price and meta_price.get("content"):
        try:
            price = float(meta_price["content"])
        except ValueError:
            price = None

    if price is None:
        fraction = soup.find("span", class_=re.compile("andes-money-amount__fraction"))
        if fraction:
            digits = re.sub(r"[^\d]", "", fraction.get_text())
            if digits:
                price = float(digits)

    currency = None
    meta_currency = soup.find("meta", itemprop="priceCurrency")
    if meta_currency and meta_currency.get("content"):
        currency = meta_currency["content"]

    if price is None:
        raise RuntimeError(f"Could not find a price on the page: {url}")

    return {
        "id": extract_item_id_from_url(url) or url,
        "title": title,
        "price": price,
        "currency": currency,
        "url": url,
    }
