# Monitor de precios de MercadoLibre

Herramienta en Python para monitorear precios de productos en MercadoLibre
y detectar bajadas de precio o cuando un producto alcanza un precio
objetivo.

Usa principalmente la **API pública de MercadoLibre**
(`https://api.mercadolibre.com`), que no requiere autenticación para
búsquedas y consulta de ítems, y es mucho más estable que raspar HTML.
Incluye además un scraper de respaldo con BeautifulSoup para cuando
solo se cuenta con la URL de un producto.

## Instalación

```bash
cd mercadolibre-price-scraper
python3 -m venv venv
source venv/bin/activate   # en Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Configuración

1. Copia el archivo de ejemplo:
   ```bash
   cp config.example.json config.json
   ```
2. Edita `config.json`:
   - `site_id`: sitio de MercadoLibre (`MLA` Argentina, `MLM` México,
     `MCO` Colombia, `MLB` Brasil, `MLC` Chile, `MPE` Perú, `MLU` Uruguay).
   - `products`: lista de productos a monitorear. Cada uno admite:
     - `type: "item_id"` + `value`: ID exacto del producto (ej. `MLA1234567890`).
     - `type: "search"` + `value`: texto de búsqueda (se monitorea el primer resultado).
     - `type: "url"` + `value`: URL del producto (se intenta resolver por API; si falla, se raspa el HTML).
     - `max_price` (opcional): si el precio actual es menor o igual, se genera una alerta.
   - `notifications`: opcional, para recibir alertas por correo cuando baja el precio
     o se alcanza `max_price`. La contraseña del correo **nunca** va en el JSON:
     se lee desde una variable de entorno (ver `smtp_password_env`).

Ejemplo para activar notificaciones por Gmail:
```bash
export MELI_SMTP_PASSWORD="tu_contraseña_de_aplicación"
```

## Uso

Ejecutar una sola verificación de todos los productos:
```bash
python monitor.py --config config.json
```

Ejecutar en bucle continuo (según `check_interval_minutes` del config):
```bash
python monitor.py --config config.json --loop
```

También puedes programarlo con `cron` en vez de `--loop`, por ejemplo
para correrlo cada hora:
```
0 * * * * cd /ruta/al/proyecto && /ruta/al/venv/bin/python monitor.py --config config.json >> monitor.log 2>&1
```

## Historial de precios

Cada verificación se guarda en una base de datos SQLite (`price_history.db`
por defecto). Puedes consultarla directamente:

```bash
sqlite3 price_history.db "SELECT product_name, price, currency, checked_at FROM price_history ORDER BY checked_at DESC LIMIT 20;"
```

O usar las funciones `get_last_price` / `get_history` de `db.py` desde
otro script de Python para graficar la evolución de precios.

## Estructura del proyecto

```
mercadolibre-price-scraper/
├── config.example.json   # plantilla de configuración
├── db.py                 # almacenamiento de historial en SQLite
├── meli_client.py         # cliente de la API + scraper HTML de respaldo
├── monitor.py             # script principal (CLI)
├── notifier.py             # alertas por correo (opcional)
├── requirements.txt
└── README.md
```

## Notas legales y de buenas prácticas

- Este proyecto está pensado para **uso personal de monitoreo de precios**,
  respetando los Términos y Condiciones de MercadoLibre.
- Se usa la API pública en la medida de lo posible; el scraping de HTML es
  solo un respaldo para casos puntuales.
- El código incluye delays entre solicitudes y reintentos con backoff para
  no sobrecargar los servidores.
- Revisa siempre los [Términos y Condiciones](https://www.mercadolibre.com.ar/ayuda/terminos-y-condiciones)
  y el `robots.txt` de MercadoLibre antes de un uso intensivo o comercial,
  y considera solicitar acceso oficial a la API (OAuth) si necesitas mayor
  volumen o funcionalidades adicionales: https://developers.mercadolibre.com.ar/
