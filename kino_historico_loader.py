"""
Kino-Brain Historical Loader
==============================
Lee kinohistorico.csv y envía cada sorteo a n8n via webhook.
El flujo n8n lo inserta en la tabla sorteos (ignorando duplicados).

Uso:
    pip install requests
    python kino_historico_loader.py
"""

import csv
import requests
import time
import sys
from datetime import datetime

# ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────
#WEBHOOK_URL = "https://n8n.kelocode.com/webhook-test/kino-historico"  # ← cambia esto
WEBHOOK_URL = "https://n8n.kelocode.com/webhook/kino-historico"  # ← cambia esto

CSV_FILE    = "kinohistorico.csv"
DELAY_SEC   = 3.0   # pausa entre requests (evita saturar n8n)
# ──────────────────────────────────────────────────────────────────────────────


def parsear_fecha(fecha_raw: str) -> str | None:
    """Convierte 'M/D/YYYY' → 'YYYY-MM-DD' (formato ISO para PostgreSQL)."""
    fecha_raw = fecha_raw.strip()
    if not fecha_raw:
        return None
    try:
        dt = datetime.strptime(fecha_raw, "%m/%d/%Y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        pass
    return None


def leer_csv(filepath: str) -> list[dict]:
    """Lee el CSV y retorna lista de sorteos válidos."""
    sorteos = []
    # utf-8-sig elimina el BOM automaticamente
    with open(filepath, encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        next(reader)  # saltar encabezado
        for i, row in enumerate(reader, start=2):
            if not row or len(row) < 22:
                continue

            fecha_iso = parsear_fecha(row[0])
            if not fecha_iso:
                continue

            try:
                numeros = [int(n.strip()) for n in row[2:22] if n.strip().isdigit()]
            except ValueError:
                continue

            if len(numeros) != 20:
                continue

            numeros_str = ",".join(f"{n:02d}" for n in numeros)
            suma_total  = sum(numeros)

            sorteos.append({
                "fecha":      fecha_iso,
                "numeros":    numeros_str,
                "suma_total": suma_total
            })

    return sorteos


def enviar_a_n8n(sorteos: list[dict]) -> None:
    """Envia cada sorteo al webhook de n8n con delay entre requests."""
    total      = len(sorteos)
    ok         = 0
    errores    = 0
    duplicados = 0

    print(f"\n Iniciando carga de {total} sorteos...\n")

    for i, sorteo in enumerate(sorteos, start=1):
        try:
            resp = requests.post(WEBHOOK_URL, json=sorteo, timeout=10)

            if resp.status_code == 200:
                resultado = resp.json() if resp.text else {}
                estado = resultado.get("status", "ok")
                if estado == "duplicado":
                    duplicados += 1
                    simbolo = "[SKIP]"
                else:
                    ok += 1
                    simbolo = "[OK]  "
            else:
                errores += 1
                simbolo = "[ERR] "
                print(f"  Error HTTP {resp.status_code}: {resp.text[:80]}")

        except requests.exceptions.ConnectionError:
            errores += 1
            simbolo = "[ERR] "
            print("  No se pudo conectar a n8n. Esta corriendo el webhook?")
        except Exception as e:
            errores += 1
            simbolo = "[ERR] "
            print(f"  Error inesperado: {e}")

        porcentaje = (i / total) * 100
        print(f"  {simbolo} [{i:4d}/{total}] {porcentaje:5.1f}% -> {sorteo['fecha']} | {sorteo['numeros'][:20]}...")

        time.sleep(DELAY_SEC)

    print(f"""
===========================================
  CARGA COMPLETADA
===========================================
  Total procesados : {total}
  Insertados       : {ok}
  Duplicados       : {duplicados}
  Errores          : {errores}
===========================================
""")


if __name__ == "__main__":
    try:
        sorteos = leer_csv(CSV_FILE)
    except FileNotFoundError:
        print(f"No se encontro el archivo: {CSV_FILE}")
        print("Asegurate de que el CSV este en la misma carpeta que este script.")
        sys.exit(1)

    if not sorteos:
        print("No se encontraron sorteos validos en el CSV.")
        sys.exit(1)

    print(f"CSV leido: {len(sorteos)} sorteos validos encontrados")
    print(f"   Rango: {sorteos[-1]['fecha']} -> {sorteos[0]['fecha']}")
    print(f"   Webhook: {WEBHOOK_URL}")
    print(f"\nContinuar? (s/n): ", end="")

    if input().strip().lower() != "s":
        print("Cancelado.")
        sys.exit(0)

    sorteos = list(reversed(sorteos))  # ASC: 2011 -> 2026
    print(f"   Orden: {sorteos[0]['fecha']} -> {sorteos[-1]['fecha']}")
    enviar_a_n8n(sorteos)
