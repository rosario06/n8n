# 📚 Índice Completo - Oficina Legal Automatizada

Navegación rápida por todas las documentaciones y archivos del proyecto.

---

## 🚀 Para Empezar (Elige tu ruta)

### Si tienes 5 minutos

→ Lee [QUICKSTART.md](QUICKSTART.md)

- Setup básico en fase rápida
- Primeros tests con webhooks
- Problemas comunes

### Si tienes 2 horas

→ Sigue [docs/setup.md](docs/setup.md) paso a paso

- Instalación completa (6 fases)
- Testing automatizado
- Checklist final

### Si eres técnico y quieres todo

→ Lee [DELIVERABLES.md](DELIVERABLES.md) primero

- Qué está incluido
- Checklist de completitud
- Validación final

---

## 📖 Documentación por Tema

### 1. Arquitectura & Diseño

| Documento                                              | Propósito                                           | Público          |
| ------------------------------------------------------ | --------------------------------------------------- | ---------------- |
| [docs/blueprint.md](docs/blueprint.md)                 | Visión general del sistema, 5 agentes, guardrails   | PM, Tech Leads   |
| [docs/workflows.md](docs/workflows.md)                 | Detalles técnicos de cada WF (nodos, SQL, payloads) | Developers       |
| [docs/roadmap-6-semanas.md](docs/roadmap-6-semanas.md) | Plan de desarrollo iterativo                        | PM, Stakeholders |

### 2. Instalación & Setup

| Documento                         | Propósito                                | Público            |
| --------------------------------- | ---------------------------------------- | ------------------ |
| [QUICKSTART.md](QUICKSTART.md)    | Empezar en 5 minutos                     | Everyone           |
| [docs/setup.md](docs/setup.md) ⭐ | Guía completa (6 fases, troubleshooting) | Developers, DevOps |
| [.env.example](.env.example)      | Variables de entorno necesarias          | Devops, Sysadmin   |

### 3. Integración & API

| Documento                                          | Propósito                                       | Público                 |
| -------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| [docs/api-webhooks.md](docs/api-webhooks.md)       | Especificación OpenAPI de todos los 8 endpoints | Developers, Integrators |
| [n8n/workflows/README.md](n8n/workflows/README.md) | Cómo importar workflows en n8n                  | Developers              |

### 4. Extensión & Contribución

| Documento                          | Propósito                                                  | Público                  |
| ---------------------------------- | ---------------------------------------------------------- | ------------------------ |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guía para agregar features, integraciones, mejorar prompts | Developers, Contributors |

### 5. Entrega & Validación

| Documento                          | Propósito                               | Público         |
| ---------------------------------- | --------------------------------------- | --------------- |
| [DELIVERABLES.md](DELIVERABLES.md) | Resumen completo, checklist, validación | Project Manager |

---

## 💻 Base de Datos

### Archivos de BD

| Archivo                             | Propósito                                     | Uso                          |
| ----------------------------------- | --------------------------------------------- | ---------------------------- |
| [db/schema.sql](db/schema.sql)      | Definición de 9 tablas (NO USAR DIRECTAMENTE) | Reference only               |
| [db/migrate.sql](db/migrate.sql) ✅ | Script idempotente (USAR ESTE)                | `psql ... -f db/migrate.sql` |

### Estructura de Tablas

```
clients          ← Clientes
├─ cases         ← Expedientes (relacionados a clients)
│  ├─ deadlines  ← Plazos críticos
│  ├─ case_events ← Historial flexible
│  └─ appointments ← Citas
├─ invoices      ← Facturas
├─ conversations ← Chat history
├─ knowledge_chunks ← Base de conocimiento (RAG)
└─ audit_logs    ← Trazabilidad RGPD
```

### Operaciones Comunes en BD

```sql
-- Ver cliente y sus casos
SELECT c.id, c.full_name, COUNT(ca.id) as num_casos
FROM clients c
LEFT JOIN cases ca ON ca.client_id = c.id
GROUP BY c.id;

-- Ver plazos próximos (próximos 7 días)
SELECT ca.id, ca.case_type, d.deadline_date, d.description
FROM cases ca
JOIN deadlines d ON d.case_id = ca.id
WHERE d.deadline_date BETWEEN NOW() AND NOW() + INTERVAL 7 DAY
ORDER BY d.deadline_date;

-- Ver historial de eventos de un caso
SELECT event_type, event_payload, created_at
FROM case_events
WHERE case_id = $1
ORDER BY created_at DESC;
```

---

## 🔧 Workflows n8n

### Los 8 Workflows

| #   | Nombre              | Archivo JSON                               | Trigger      | Descrip                                    |
| --- | ------------------- | ------------------------------------------ | ------------ | ------------------------------------------ |
| 01  | Recepción omnicanal | `wf-01-recepcion-template.json`            | Webhook      | Recibe WhatsApp/Email, clasifica, responde |
| 02  | Intake legal        | `wf-02-intake-template.json`               | Webhook      | Crea cliente + expediente                  |
| 03  | Estado de caso      | `wf-03-estado-caso-template.json`          | Webhook      | Consulta status                            |
| 04  | Agenda              | `wf-04-agenda-recordatorios-template.json` | Webhook+Cron | Citas + reminders                          |
| 05  | Urgencias           | `wf-05-escalado-urgencias-template.json`   | Webhook      | Escala casos urgentes                      |
| 06  | Borradores          | `wf-06-borradores-template.json`           | Webhook      | Genera documentos (OpenAI)                 |
| 07  | Facturación         | `wf-07-facturacion-template.json`          | Webhook+Cron | Facturas + cobros                          |
| 08  | Auditoría           | `wf-08-auditoria-template.json`            | Webhook      | Event logging                              |

### Workflow Dependencies

```
WF-01 → detecta intención
   ↓
WF-02 → crea cliente/caso
   ↓
├─ WF-03 → consulta estado
├─ WF-04 → agrega citas
├─ WF-05 → detecta urgencias
├─ WF-06 → genera borradores
├─ WF-07 → factura
└─ WF-08 → audita todo
```

**Orden de importación recomendado:** WF-01 → WF-02 → WF-03, WF-04, WF-05, WF-06, WF-07 → WF-08

---

## 🤖 Prompts de IA

Archivos que controlan el comportamiento de los agentes:

| Prompt                                                         | Usado en | Propósito                    |
| -------------------------------------------------------------- | -------- | ---------------------------- |
| [prompts/agente_recepcion.md](prompts/agente_recepcion.md)     | WF-01    | Clasificación de intenciones |
| [prompts/agente_intake.md](prompts/agente_intake.md)           | WF-02    | Recopilación de hechos       |
| [prompts/agente_seguimiento.md](prompts/agente_seguimiento.md) | WF-03    | Status updates               |
| [prompts/agente_borradores.md](prompts/agente_borradores.md)   | WF-06    | Generación de documentos     |

---

## 📡 Webhooks & API

### Endpoints Disponibles

```
POST /webhook/legal-recepcion          (WF-01) - Recibir mensajes
POST /webhook/legal-intake             (WF-02) - Nuevo cliente/caso
POST /webhook/legal-estado             (WF-03) - Consultar caso
POST /webhook/legal-agenda             (WF-04) - Crear cita
POST /webhook/legal-urgencias          (WF-05) - Escalar caso urgente
POST /webhook/legal-borradores         (WF-06) - Generar documento
POST /webhook/legal-facturacion        (WF-07) - Crear factura
POST /webhook/legal-auditoria          (WF-08) - Log evento
```

**Especificación completa:** [docs/api-webhooks.md](docs/api-webhooks.md)

---

## 🧪 Testing

### Scripts de Test

| Archivo                                            | Propósito                   | Uso                                  |
| -------------------------------------------------- | --------------------------- | ------------------------------------ |
| [tests/http-payloads.ps1](tests/http-payloads.ps1) | Valida todos los 8 webhooks | `.\http-payloads.ps1 -BaseUrl "..."` |

### Test Payloads

Ejemplos de request para cada endpoint en:

- [docs/api-webhooks.md](docs/api-webhooks.md) (JSON examples)
- [n8n/workflows/README.md](n8n/workflows/README.md) (test payloads)

---

## 🔐 Seguridad

### Archivos de Seguridad

| Concepto                 | Dónde está                                                  | Detalles                          |
| ------------------------ | ----------------------------------------------------------- | --------------------------------- |
| Variables de entorno     | [.env.example](.env.example)                                | 26 variables (crear `.env` real)  |
| JWT authentication       | [docs/setup.md#producción](docs/setup.md#fase-6-producción) | Template de middleware            |
| RGPD compliance          | [db/schema.sql](db/schema.sql#L36)                          | `consent_data_processing` field   |
| Auditoría                | [db/migrate.sql](db/migrate.sql#audit_logs)                 | `audit_logs` table                |
| SQL injection prevention | [docs/workflows.md](docs/workflows.md)                      | Todas las queries parameterizadas |

### Checklist de Seguridad

- [ ] `.env` contiene valores reales (no commitearlo a git)
- [ ] JWT_SECRET cambio a valor aleatorio: `openssl rand -hex 32`
- [ ] PostgreSQL con password fuerte
- [ ] HTTPS configurado (HTTPS en producción)
- [ ] Rate limiting activado
- [ ] Logs de auditoría revisados regularmente

---

## 📈 Roadmap & Siguiente Fase

### Fases Completadas

- ✅ Fase 1: MVP (8 workflows base)

### Fases Pendientes

- 🔜 Fase 2: RAG + Dashboard (Semanas 3-6)
- 🔜 Fase 3: Integraciones Avanzadas (Semana 6+)

**Plan detallado:** [docs/roadmap-6-semanas.md](docs/roadmap-6-semanas.md)

### Oportunidades de Contribución

Ver [CONTRIBUTING.md#roadmap-de-oportunidades](CONTRIBUTING.md#roadmap-de-oportunidades) para:

- RAG con vectores
- Dashboard de KPIs
- Google Calendar Sync
- Docusign Integration
- Stripe Payments
- Multi-language

---

## 🆘 Troubleshooting

### Por Problema

| Síntoma               | Archivo a Revisar                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| PostgreSQL no conecta | [docs/setup.md#troubleshooting](docs/setup.md#troubleshooting)                                 |
| Workflow import falla | [QUICKSTART.md#problemas-comunes](QUICKSTART.md#problemas-comunes)                             |
| Webhook no responde   | [docs/api-webhooks.md#manejo-de-errores-global](docs/api-webhooks.md#manejo-de-errores-global) |
| n8n no arranca        | [QUICKSTART.md#-module-not-found-n8n](QUICKSTART.md#-module-not-found-n8n)                     |
| OpenAI error en WF-06 | [QUICKSTART.md#-openai_api_key-not-found](QUICKSTART.md#-openai_api_key-not-found)             |

---

## 🎓 Guías de Aprendizaje

### Para PM/Stakeholders

1. Leo [README.md](README.md) - visión general
2. Leo [docs/blueprint.md](docs/blueprint.md) - arquitectura
3. Leo [docs/roadmap-6-semanas.md](docs/roadmap-6-semanas.md) - fases
4. Leo [DELIVERABLES.md](DELIVERABLES.md) - checklist

**Tiempo:** 15 min

### Para Developers (Full Stack)

1. Leo [QUICKSTART.md](QUICKSTART.md) - setup rápido
2. Leo [docs/api-webhooks.md](docs/api-webhooks.md) - endpoints
3. Importo workflows en n8n UI
4. Ejecuto `tests/http-payloads.ps1`
5. Edito prompts en `prompts/`
6. Agrego integraciones (ver [CONTRIBUTING.md](CONTRIBUTING.md))

**Tiempo:** 2-4 horas

### Para DevOps

1. Leo [docs/setup.md](docs/setup.md) - instalación
2. Configuro `.env` con credenciales
3. Ejecuto `db/migrate.sql`
4. Arranco n8n
5. Configuro rate limiting, backups, logs
6. Deploy a cloud (AWS/DigitalOcean/Render)

**Tiempo:** 4-6 horas

### Para Abogados/Business

1. Leo [QUICKSTART.md](QUICKSTART.md) - qué es esto
2. Pruebo con un caso ficticio
3. Ajusto prompts a mi jurisdicción
4. Integro mis sistemas (WhatsApp, Google Calendar, etc)

**Tiempo:** 1-2 días

---

## 📊 Estadísticas del Proyecto

```
Líneas de código:
  - JSON (workflows):        ~45,000 líneas
  - SQL (schema + migrate):  ~700 líneas
  - Documentación:           ~12,000 líneas
  - Tests:                   ~600 líneas

Archivos creados:           15+
Tablas de BD:               9
Workflows n8n:              8
API endpoints:              8
Prompts de IA:              4

Tiempo de setup:            2 horas
Tiempo de importación:      25 minutos
Tiempo de testing:          30 minutos
```

---

## 🚀 Iniciar Ahora

**Principiante?** → [QUICKSTART.md](QUICKSTART.md)  
**Técnico?** → [docs/setup.md](docs/setup.md)  
**Developer?** → [docs/api-webhooks.md](docs/api-webhooks.md)  
**Manager?** → [DELIVERABLES.md](DELIVERABLES.md)

---

**Última actualización:** 3 de marzo de 2026  
**Estado:** 100% Completado ✅
