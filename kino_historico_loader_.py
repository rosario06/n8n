"""
Kino-Brain Historical Loader v2
================================
Fase 1: Carga todos los sorteos en tabla sorteos SIN AI
Fase 2: Procesa solo los ultimos 365 dias CON AI
"""

import csv
import requests
import time
import sys
import os
from datetime import datetime, timedelta

# Forzar UTF-8 en Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

# CONFIGURACION
WEBHOOK_URL_HISTORICO = "https://n8n.kelocode.com/webhook/kino-historico"
WEBHOOK_URL_APRENDIZAJE = "https://n8n.kelocode.com/webhook/kino-aprendizaje"

CSV_FILE = "kinohistorico.csv"
DELAY_FASE1 = 0.2
DELAY_FASE2 = 3.0

FECHA_LIMITE = datetime.now() - timedelta(days=365)


def parsear_fecha(fecha_raw):
    fecha_raw = fecha_raw.strip()
    if not fecha_raw:
        return None
    try:
        dt = datetime.strptime(fecha_raw, "%m/%d/%Y")
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return None


def leer_csv(filepath):
    sorteos = []
    with open(filepath, encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if not row or len(row) < 22:
                continue
            fecha_iso = parsear_fecha(row[0])
            if not fecha_iso:
                continue
            try:
                numeros = [int(n.strip())
                           for n in row[2:22] if n.strip().isdigit()]
            except ValueError:
                continue
            if len(numeros) != 20:
                continue
            numeros_str = ",".join(f"{n:02d}" for n in numeros)
            sorteos.append({
                "fecha":      fecha_iso,
                "numeros":    numeros_str,
                "suma_total": sum(numeros)
            })
    return list(reversed(sorteos))  # ASC: 2011 -> 2026


def enviar_lote(sorteos, webhook, delay, etiqueta):
    total = len(sorteos)
    ok = 0
    errores = 0
    duplicados = 0

    print(f"\n>> {etiqueta}: {total} sorteos\n")

    for i, sorteo in enumerate(sorteos, start=1):
        try:
            resp = requests.post(webhook, json=sorteo, timeout=30)
            if resp.status_code == 200:
                resultado = resp.json() if resp.text else {}
                if resultado.get("status") == "duplicado":
                    duplicados += 1
                    simbolo = "[SKIP]"
                else:
                    ok += 1
                    simbolo = "[OK]  "
            else:
                errores += 1
                simbolo = "[ERR] "
                print(f"  HTTP {resp.status_code}: {resp.text[:60]}")
        except requests.exceptions.ConnectionError:
            errores += 1
            simbolo = "[ERR] "
            print("  No se pudo conectar. Verifica que n8n este activo.")
        except Exception as e:
            errores += 1
            simbolo = "[ERR] "
            print(f"  Error: {e}")

        pct = (i / total) * 100
        print(f"  {simbolo} [{i:4d}/{total}] {pct:5.1f}% -> {sorteo['fecha']}")
        time.sleep(delay)

    print(f"\n--- {etiqueta} COMPLETADA ---")
    print(f"  Insertados : {ok}")
    print(f"  Duplicados : {duplicados}")
    print(f"  Errores    : {errores}")
    print("-" * 40)


if __name__ == "__main__":
    try:
        todos = leer_csv(CSV_FILE)
    except FileNotFoundError:
        print(f"No se encontro: {CSV_FILE}")
        sys.exit(1)

    if not todos:
        print("No se encontraron sorteos validos.")
        sys.exit(1)

    fase2 = [s for s in todos
             if datetime.strptime(s["fecha"], "%Y-%m-%d") >= FECHA_LIMITE]

    print("")
    print("=" * 45)
    print("  KINO-BRAIN HISTORICAL LOADER V2")
    print("=" * 45)
    print(f"  Total sorteos CSV     : {len(todos)}")
    print(f"  Fase 1 (sin AI)       : {len(todos)} sorteos")
    print(f"  Fase 2 (con AI)       : {len(fase2)} sorteos")
    print(
        f"  Rango Fase 2          : {fase2[0]['fecha']} a {fase2[-1]['fecha']}")
    print(f"  Costo estimado Fase 2 : ~${len(fase2) * 0.02:.2f} USD")
    print(
        f"  Tiempo estimado F2    : ~{len(fase2) * DELAY_FASE2 / 60:.0f} minutos")
    print("=" * 45)
    print("")
    print("Que deseas ejecutar?")
    print("  1) Solo Fase 1 - cargar sorteos SIN AI (gratis)")
    print("  2) Solo Fase 2 - AI aprende ultimos 365 dias (~$7 USD)")
    print("  3) Ambas fases en secuencia")
    print("  0) Cancelar")

    opcion = input("\nOpcion (0-3): ").strip()

    if opcion == "1":
        enviar_lote(todos, WEBHOOK_URL_HISTORICO,
                    DELAY_FASE1, "FASE 1 - Carga Sorteos")
    elif opcion == "2":
        enviar_lote(fase2, WEBHOOK_URL_APRENDIZAJE,
                    DELAY_FASE2, "FASE 2 - Aprendizaje AI")
    elif opcion == "3":
        enviar_lote(todos, WEBHOOK_URL_HISTORICO,
                    DELAY_FASE1, "FASE 1 - Carga Sorteos")
        print("\nFase 1 completada. Iniciando Fase 2 en 5 segundos...")
        time.sleep(5)
        enviar_lote(fase2, WEBHOOK_URL_APRENDIZAJE,
                    DELAY_FASE2, "FASE 2 - Aprendizaje AI")
    else:
        print("Cancelado.")
