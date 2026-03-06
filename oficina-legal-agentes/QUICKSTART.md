# ⚡ Quickstart - Empieza en 5 minutos

**Para los que quieren empezar ahora sin leer documentación.**

## Paso 1: Descargar y configurar (2 min)

```bash
# 1. Estás aquí (oficina-legal-agentes/)
cd oficina-legal-agentes

# 2. Copiar configuración
cp .env.example .env

# 3. Editar .env con TUS valores:
# - DB_PASSWORD: cambiar a tu contraseña postgres
# - OPENAI_API_KEY: pegar tu API key de OpenAI
# (Guardar archivo)
```

## Paso 2: Base de datos (2 min)

```bash
# 4. Crear base de datos
psql -U postgres -c "CREATE DATABASE legal_office_db;"

# 5. Aplicar schema
psql -U postgres legal_office_db -f db/migrate.sql

# Si ves "Migración completada. 9 tablas creadas." ✅ estás bien
```

## Paso 3: n8n (1 min)

```bash
# 6. Instalar y arrancar n8n
npm install -g n8n
n8n start

# Abre http://localhost:5678 en el navegador
```

## Paso 4: Importar workflows (MANUAL en UI n8n)

En http://localhost:5678:

1. **Workflow nuevo** (botón +)
2. **Menú ...** → Import from File
3. Selecciona: `n8n/workflows/wf-01-recepcion-template.json`
4. Haz click en nodos **"postgres"** → selecciona credenciales PostgreSQL
5. **Guardar** (Ctrl+S)
6. Repite pasos 1-5 para wf-02, wf-03, ... wf-08

## Paso 5: Validar (Opcional)

```powershell
# PowerShell: validar que todo funciona
cd tests
.\http-payloads.ps1 -BaseUrl "http://localhost:5678"
# Deberías ver: ✅ Pasadas: 10, ❌ Fallidas: 0
```

---

## 🎯 Resultado

- ✅ 8 workflows en n8n
- ✅ Base de datos con 9 tablas
- ✅ Listo para procesar casos legales

**Tiempo total:** ~30 minutos

---

## ¿Qué puedo hacer ahora?

### 1️⃣ Probar con un caso ficticio

**POST a:** `http://localhost:5678/webhook/legal-intake`

**Con este JSON:**

```json
{
  "full_name": "Juan Pérez García",
  "email": "juan@example.com",
  "phone": "+34612345678",
  "case_type": "laboral",
  "description": "Despido injustificado después de 5 años"
}
```

Debería crear un cliente y un caso automáticamente en la BD.

### 2️⃣ Consultar estado

**POST a:** `http://localhost:5678/webhook/legal-estado`

```json
{
  "phone": "+34612345678"
}
```

Devuelve el estado del caso, plazos próximos, etc.

### 3️⃣ Crear cita

**POST a:** `http://localhost:5678/webhook/legal-agenda`

```json
{
  "case_id": 1,
  "appointment_type": "consulta",
  "scheduled_at": "2026-03-10T14:00:00Z",
  "notes": "Revisar documentación"
}
```

### 4️⃣ Generar borrador

**POST a:** `http://localhost:5678/webhook/legal-borradores`

```json
{
  "case_id": 1,
  "document_template": "demanda_laboral",
  "client_name": "Juan Pérez García",
  "defendant": "Empresa XYZ S.L.",
  "claims": ["Salarios adeudados"],
  "damages_amount": 10000
}
```

_(Requiere OPENAI_API_KEY en .env)_

---

## Archivos Importantes

| Archivo                | Propósito                             |
| ---------------------- | ------------------------------------- |
| `.env`                 | Tus credenciales (NO subir a git)     |
| `db/schema.sql`        | Estructura de la BD (9 tablas)        |
| `n8n/workflows/*.json` | Los 8 workflows listos para usar      |
| `docs/setup.md`        | Guía paso a paso completa             |
| `docs/api-webhooks.md` | Especificación de todos los endpoints |

---

## Problemas Comunes

### ❌ "PostgreSQL connection refused"

```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres -c "SELECT 1;"
# Si da error, arrancar PostgreSQL:
# Windows: descargar desde postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt install postgresql
```

### ❌ "Module not found: n8n"

```bash
npm install -g n8n
# Luego:
n8n start
```

### ❌ "JSON import error in n8n"

```powershell
# Validar que el JSON es válido
Get-Content n8n/workflows/wf-01-recepcion-template.json -Raw | ConvertFrom-Json
# Si da error, el JSON tiene problema de syntax
```

### ❌ "OPENAI_API_KEY not found"

Verificar que:

1. `.env` existe (copiaste de `.env.example`)
2. `OPENAI_API_KEY=sk-...` tiene un valor real
3. n8n se reinició después de editar `.env`

---

## Siguiente Nivel

Después de probar:

1. **Leer** [docs/setup.md](docs/setup.md) para setup en producción
2. **Revisar** [docs/api-webhooks.md](docs/api-webhooks.md) para todos los endpoints
3. **Integrar** WhatsApp, Google Calendar, Docusign
4. **Customizar** prompts en `prompts/` a tu jurisdicción

---

## ¿Necesitas Ayuda?

- **Errores de BD:** Ver `db/schema.sql`
- **Estructura de webhooks:** Ver `docs/api-webhooks.md`
- **Extender funcionalidad:** Ver `CONTRIBUTING.md`
- **Deployment a cloud:** Ver `docs/setup.md#fase-6-producción`

---

**¡Bienvenido! Tu oficina legal automatizada está lista.** ⚖️ 🤖
