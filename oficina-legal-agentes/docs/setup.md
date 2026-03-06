# Setup e Instalación: Oficina Legal Automatizada

Guía completa para implementar el sistema desde cero hasta producción.

## Fase 1: Preparación del Entorno (30 minutos)

### 1.1 Requisitos previos

- PostgreSQL 14+ instalado y corriendo
- Node.js 18+ para n8n
- n8n 1.0+ (cloud o self-hosted)
- OpenAI API key válida
- (Opcional) WhatsApp Business Account para WF-01
- (Opcional) SMTP válido para notificaciones

### 1.2 Clonar y configurar variables de entorno

```bash
cd oficina-legal-agentes
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legal_office_db
DB_USER=postgres
DB_PASSWORD=tu_contraseña

# OpenAI
OPENAI_API_KEY=sk-...

# Integraciones opcionales
WHATSAPP_API_KEY=...
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# JWT para webhooks seguros
JWT_SECRET=$(openssl rand -hex 32)
```

## Fase 2: Base de Datos (15 minutos)

### 2.1 Crear base de datos

```bash
psql -U postgres -h localhost -c "CREATE DATABASE legal_office_db;"
```

### 2.2 Aplicar schema

```bash
psql -U postgres -h localhost legal_office_db -f db/schema.sql
```

**Validar creación:**

```bash
psql -U postgres -h localhost legal_office_db -c "\dt"
```

Deberías ver 9 tablas:

- clients
- cases
- deadlines
- appointments
- invoices
- case_events
- conversations
- knowledge_chunks
- audit_logs

## Fase 3: n8n Setup (20 minutos)

### 3.1 Instalar n8n

```bash
npm install -g n8n
n8n start
```

O usar Docker:

```bash
docker run -d --name n8n -p 5678:5678 n8nio/n8n
```

Accede a http://localhost:5678

### 3.2 Crear credenciales PostgreSQL

En n8n:

1. **Credenciales** → **+ Crear nueva**
2. Tipo: **PostgreSQL**
3. Configura con valores de `.env`:
   - Host: `localhost`
   - Port: `5432`
   - Database: `legal_office_db`
   - User: valor de `DB_USER`
   - Password: valor de `DB_PASSWORD`
4. **Salva** y **Prueba conexión**

### 3.3 Crear credenciales OpenAI (opcional para WF-06)

En n8n:

1. **Credenciales** → **+ Crear nueva**
2. Tipo: **OpenAI**
3. API Key: valor de `OPENAI_API_KEY`
4. Model: `gpt-4-turbo`

## Fase 4: Importar Workflows (25 minutos)

### 4.1 Importar en orden recomendado

```
1. WF-01 (Recepción omnicanal)
2. WF-02 (Intake legal)
3. WF-03 (Estado de caso)
4. WF-04 (Agenda y recordatorios) [requiere cron habilitado]
5. WF-05 (Escalado de urgencias)
6. WF-06 (Borradores asistidos) [requiere OpenAI credentials]
7. WF-07 (Facturación y cobros) [requiere cron habilitado]
8. WF-08 (Auditoría)
```

**Para cada workflow:**

```
1. N8N Dashboard → + (nuevo workflow)
2. Ícono ... (menú) → Import from File
3. Selecciona: n8n/workflows/wf-XX-*.json
4. Revisa nodos "postgres" → verifica credenciales asignadas
5. Revisa nodos "OpenAI" en WF-06 → verifica credenciales
6. Guarda: Ctrl+S
7. Activa: botón azul "Execute Workflow" o cron trigger
```

### 4.2 Configurar webhooks base

En n8n, después de importar WF-01, WF-02, WF-03:

1. Abre el nodo webhook de cada workflow
2. Copia la URL webhook (ej: `https://n8n.example.com/webhook/legal-intake`)
3. Actualiza `WEBHOOK_BASE_URL` en tu aplicación cliente
4. Prueba con payloads de ejemplo (ver `tests/` directorio)

## Fase 5: Testing (30 minutos)

### 5.1 Validar conexión a BD

```bash
psql -U postgres -h localhost legal_office_db -c "SELECT COUNT(*) FROM clients;"
# Debe retornar: count
#                -----
#                    0
```

### 5.2 Test rápido de cada workflow

**PowerShell (Windows):**

```powershell
cd tests
.\http-payloads.ps1 -BaseUrl "http://localhost:5678"
```

**Bash (Linux/Mac):**

```bash
cd tests
chmod +x http-payloads.sh
./http-payloads.sh "http://localhost:5678"
```

### 5.3 Validar datos en BD

```bash
psql -U postgres -h localhost legal_office_db -c "
  SELECT id, full_name, email FROM clients LIMIT 5;
  SELECT id, status FROM cases LIMIT 5;
  SELECT item_type, COUNT(*) FROM case_events GROUP BY item_type;
"
```

## Fase 6: Producción (Configuración final)

### 6.1 Usar HTTPS

- Certificados SSL en n8n (si self-hosted)
- Configurar reverse proxy (Nginx/CloudFlare)
- Actualizar `WEBHOOK_BASE_URL` a HTTPS

### 6.2 Monitoreo y logs

1. En n8n: **Execution** tab muestra historial
2. En PostgreSQL: `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;`
3. Integrar con Slack/Email alerts en WF-05

### 6.3 Backups

```bash
# Backup semanal de BD
pg_dump -U postgres -h localhost legal_office_db > backup_$(date +%Y%m%d).sql

# Restore si es necesario
psql -U postgres -h localhost legal_office_db < backup_20260303.sql
```

### 6.4 Escalado horizontal (Fase 2)

- Múltiples replicas de n8n con load balancer
- Connection pool de PostgreSQL (pgbouncer)
- Cache Redis para knowledge_chunks (WF-06)

## Checklist Final ✅

- [ ] `.env` configurado con todas las variables
- [ ] PostgreSQL corriendo, DB creada, schema aplicado
- [ ] n8n instalado y accesible en http://localhost:5678
- [ ] Credenciales PostgreSQL creadas en n8n
- [ ] Credenciales OpenAI creadas en n8n (si usas WF-06)
- [ ] Todos 8 workflows importados y guardados
- [ ] Tests ejecutados con éxito (0 errores)
- [ ] Datos ficticios en clients y cases desde tests
- [ ] audit_logs refleja actividad de workflows
- [ ] Webhooks base URL documentados en cliente
- [ ] HTTPS configurado (si es producción)
- [ ] Backups programados en cron

## Troubleshooting

### Error: "PostgreSQL connection refused"

```bash
# Verifica que PostgreSQL esté corriendo
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # Mac
Get-Service postgresql*  # Windows PowerShell
```

### Error: "Workflow import failed - invalid JSON"

```bash
# Valida JSON del template
Get-Content n8n/workflows/wf-01-recepcion-template.json -Raw | ConvertFrom-Json
```

### Error: "FK constraint violation on case_id"

Este error indica que un workflow intenta referenciar un `case_id` que no existe. Solución:

1. Verifica que WF-02 ejecutó antes de WF-04/05/07
2. Revisa que `case_events.case_id` permite NULL (schema.sql validado)

## Siguientes Pasos

1. **Fase 2 (Semanas 3-4)**: Agregar RAG a WF-06 con embeddings OpenAI
2. **Fase 2 (Semana 5)**: Dashboard de KPIs (casos abiertos, deadlines próximos, ingresos por mes)
3. **Fase 2 (Semana 6)**: Integraciones adicionales (Google Calendar, Slack, Zoom)

Para soporte: Revisa `docs/blueprint.md` para arquitectura y `CONTRIBUTING.md` para extensiones.
