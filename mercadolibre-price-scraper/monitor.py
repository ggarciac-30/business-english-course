"""Price monitor for MercadoLibre products.

Usage:
    python monitor.py --config config.json           # run one check
    python monitor.py --config config.json --loop    # run forever, on schedule

See config.example.json for the expected configuration format.
"""

import argparse
import json
import sys
import time

import db
import meli_client
from notifier import send_email_alert

DEFAULT_DELAY_BETWEEN_REQUESTS = 2  # seconds, to be polite with the API/site


def load_config(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def fetch_current_data(site_id: str, product: dict) -> dict:
    product_type = product["type"]
    value = product["value"]

    if product_type == "item_id":
        return meli_client.get_item(value)

    if product_type == "search":
        results = meli_client.search_products(site_id, value, limit=1)
        if not results:
            raise RuntimeError(f"No results found for search: {value!r}")
        return results[0]

    if product_type == "url":
        item_id = meli_client.extract_item_id_from_url(value)
        if item_id:
            try:
                return meli_client.get_item(item_id)
            except RuntimeError:
                pass  # fall back to HTML scraping below
        return meli_client.scrape_item_page(value)

    raise ValueError(f"Unknown product type: {product_type!r}")


def check_product(site_id: str, product: dict, config: dict) -> None:
    name = product["name"]
    max_price = product.get("max_price")

    try:
        current = fetch_current_data(site_id, product)
    except Exception as exc:
        print(f"[ERROR] {name}: could not fetch current price ({exc})")
        return

    product_ref = str(current["id"])
    price = current["price"]
    currency = current.get("currency") or ""
    url = current.get("url") or ""
    title = current.get("title") or name

    previous = db.get_last_price(product_ref)
    db.save_price(name, product_ref, title, price, currency, url)

    if previous is None:
        print(f"[INFO] {name}: first check recorded -> {price} {currency}")
    else:
        prev_price = previous["price"]
        if price < prev_price:
            change = prev_price - price
            pct = (change / prev_price) * 100 if prev_price else 0
            message = (
                f"[BAJO DE PRECIO] {name}: {prev_price} -> {price} {currency} "
                f"(-{change:.2f}, -{pct:.1f}%)\n{url}"
            )
            print(message)
            send_email_alert(config, f"Bajo de precio: {name}", message)
        elif price > prev_price:
            print(f"[INFO] {name}: subio de {prev_price} a {price} {currency}")
        else:
            print(f"[INFO] {name}: sin cambios ({price} {currency})")

    if max_price is not None and price <= max_price:
        message = (
            f"[ALERTA OBJETIVO] {name}: precio actual {price} {currency} "
            f"alcanzo tu limite de {max_price}.\n{url}"
        )
        print(message)
        send_email_alert(config, f"Objetivo de precio alcanzado: {name}", message)


def run_once(config: dict) -> None:
    site_id = config.get("site_id", "MLA")
    for product in config["products"]:
        check_product(site_id, product, config)
        time.sleep(DEFAULT_DELAY_BETWEEN_REQUESTS)


def run_loop(config: dict) -> None:
    interval_minutes = config.get("check_interval_minutes", 60)
    print(f"Monitoreo iniciado. Verificando cada {interval_minutes} minutos. Ctrl+C para salir.")
    while True:
        run_once(config)
        time.sleep(interval_minutes * 60)


def main() -> int:
    parser = argparse.ArgumentParser(description="Monitor de precios de MercadoLibre")
    parser.add_argument("--config", default="config.json", help="Ruta al archivo de configuracion JSON")
    parser.add_argument("--db", default=db.DB_PATH, help="Ruta al archivo SQLite de historial")
    parser.add_argument("--loop", action="store_true", help="Ejecutar en bucle segun check_interval_minutes")
    args = parser.parse_args()

    db.DB_PATH = args.db
    db.init_db(args.db)

    try:
        config = load_config(args.config)
    except FileNotFoundError:
        print(f"No se encontro el archivo de configuracion: {args.config}")
        print("Copia config.example.json a config.json y edítalo con tus productos.")
        return 1

    if args.loop:
        try:
            run_loop(config)
        except KeyboardInterrupt:
            print("\nMonitoreo detenido por el usuario.")
    else:
        run_once(config)

    return 0


if __name__ == "__main__":
    sys.exit(main())
