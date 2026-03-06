# Oficina Legal con Agentes Virtuales

Proyecto base para automatizar una pequeña oficina de abogados con agentes virtuales que interactúan contigo y con clientes, manteniendo supervisión humana en decisiones legales sensibles.

## Objetivo

Implementar una oficina legal asistida por IA con:

- Atención omnicanal (WhatsApp/Email/Web)
- Intake legal automático
- Seguimiento proactivo de casos y plazos
- Borradores de documentos con revisión humana
- Agenda y facturación automatizadas

## Principios operativos

1. **Human-in-the-loop obligatorio** para recomendaciones legales, estrategia procesal y documentos finales.
2. **Trazabilidad total** de cada interacción, decisión y cambio en expediente.
3. **Privacidad por diseño** (mínimo privilegio, cifrado, auditoría).
4. **Automatización progresiva**: MVP simple y expansión por fases.

## Stack recomendado

- **Orquestación:** n8n
- **Base de datos:** PostgreSQL
- **Vector/RAG:** pgvector
- **Modelo LLM:** OpenAI (o proveedor equivalente)
- **Canales:** WhatsApp Business API / email / formulario web
- **Calendario y reuniones:** Google Calendar / Outlook

## Estructura del Proyecto

```
oficina-legal-agentes/
├── README.md                              # Este archivo (instrucciones generales)
├── CONTRIBUTING.md                        # Guía para contribuciones y extensiones
├── .env.example                          # Variables de entorno (copiar a .env)
├── docs/
│   ├── blueprint.md                      # Arquitectura del sistema
│   ├── roadmap-6-semanas.md              # Plan de desarrollo fase 1
│   ├── workflows.md                      # Documentación detallada de cada WF
│   ├── setup.md                          # Guía paso a paso de instalación
│   └── api-webhooks.md                   # Especificación OpenAPI de endpoints
├── db/
│   ├── schema.sql                        # Definición de tablas (9 tablas)
│   └── migrate.sql                       # Script idempotente de migración
├── prompts/
│   ├── agente_recepcion.md               # Instrucciones para WF-01
│   ├── agente_intake.md                  # Instrucciones para WF-02
│   ├── agente_seguimiento.md             # Instrucciones para WF-03
│   └── agente_borradores.md              # Instrucciones para WF-06
├── n8n/
│   └── workflows/
│       ├── README.md                     # Instrucciones de importación
│       ├── wf-01-recepcion-template.json
│       ├── wf-02-intake-template.json
│       ├── wf-03-estado-caso-template.json
│       ├── wf-04-agenda-recordatorios-template.json
│       ├── wf-05-escalado-urgencias-template.json
│       ├── wf-06-borradores-template.json
│       ├── wf-07-facturacion-template.json
│       └── wf-08-auditoria-template.json
└── tests/
    └── http-payloads.ps1                # Script para validar todos los webhooks
```

## Fases

- **Fase 1 (2-3 semanas):** recepción, intake, agenda, recordatorios, CRM legal básico.
- **Fase 2 (3-6 semanas):** RAG legal interno, borradores, clasificador de urgencia y panel de KPI.
- **Fase 3:** integraciones avanzadas (firma electrónica, pagos, BI).

## Primeros pasos (5 fases, ~120 minutos)

### Fase 1: Preparación (30 min)

```bash
# 1. Copiar configuración y editar credenciales
cp .env.example .env
# Edita .env con tus API keys (OpenAI, WhatsApp, SMTP, etc)
```

Instrucciones detalladas: [docs/setup.md](docs/setup.md#fase-1-preparación-del-entorno-30-minutos)

### Fase 2: Base de datos (15 min)

```bash
# 2. Crear BD y aplicar schema
psql -U postgres -c "CREATE DATABASE legal_office_db;"
psql -U postgres legal_office_db -f db/migrate.sql
```

Instrucciones: [docs/setup.md](docs/setup.md#fase-2-base-de-datos-15-minutos)

### Fase 3: n8n Setup (20 min)

- Instalar n8n: `npm install -g n8n && n8n start`
- Crear credenciales PostgreSQL en n8n UI
- Crear credenciales OpenAI (opcional para WF-06)

Instrucciones: [docs/setup.md](docs/setup.md#fase-3-n8n-setup-20-minutos)

### Fase 4: Importar workflows (25 min)

- Importar 8 templates JSON en orden (WF-01 → WF-08)
- Verificar que credenciales PostgreSQL estén asignadas en nodos SQL
- Guardar y activar cada workflow

Instrucciones: [docs/setup.md](docs/setup.md#fase-4-importar-workflows-25-minutos)

### Fase 5: Testing (30 min)

```powershell
# 5. Ejecutar suite de tests
cd tests
.\http-payloads.ps1 -BaseUrl "http://localhost:5678" -Verbose
```

Resultado esperado: ✅ 10/10 tests pasados

Instrucciones: [docs/setup.md](docs/setup.md#fase-5-testing-30-minutos)

## Documentación Completa

| Documento                                              | Propósito                                                 |
| ------------------------------------------------------ | --------------------------------------------------------- |
| [docs/blueprint.md](docs/blueprint.md)                 | Arquitectura: 5 agentes, guardrails, KPIs                 |
| [docs/roadmap-6-semanas.md](docs/roadmap-6-semanas.md) | Plan de desarrollo iterativo                              |
| [docs/workflows.md](docs/workflows.md)                 | Detalles técnicos de cada WF (trigger, nodos, SQL)        |
| [docs/setup.md](docs/setup.md)                         | Instalación paso a paso (este es tu archivo principal)    |
| [docs/api-webhooks.md](docs/api-webhooks.md)           | Especificación OpenAPI de todos los endpoints             |
| [CONTRIBUTING.md](CONTRIBUTING.md)                     | Cómo extender el proyecto (nuevos WF, integraciones, etc) |

## Estado actual: MVP Completo ✅

**Workflows implementados y listos para usar:**

| WF  | Nombre                 | Trigger                         | Estado   |
| --- | ---------------------- | ------------------------------- | -------- |
| 01  | Recepción omnicanal    | Webhook + WhatsApp/Email        | ✅ Listo |
| 02  | Intake legal           | Webhook (nuevo cliente)         | ✅ Listo |
| 03  | Estado de caso         | Webhook (consulta estado)       | ✅ Listo |
| 04  | Agenda y recordatorios | Webhook + Cron diario           | ✅ Listo |
| 05  | Escalado de urgencias  | Webhook (detección automática)  | ✅ Listo |
| 06  | Borradores asistidos   | Webhook (generación con OpenAI) | ✅ Listo |
| 07  | Facturación y cobros   | Webhook + Cron semanal          | ✅ Listo |
| 08  | Auditoría              | Webhook (event logging)         | ✅ Listo |

**Infraestructura incluida:**

- ✅ Base de datos PostgreSQL con 9 tablas (clients, cases, deadlines, appointments, invoices, case_events, conversations, knowledge_chunks, audit_logs)
- ✅ 8 templates JSON listos para importar en n8n
- ✅ 4 prompts de sistema para agentes (recepción, intake, seguimiento, borradores)
- ✅ Script de migration SQL idempotente (`db/migrate.sql`)
- ✅ Suite de tests HTTP para validar todos los endpoints (`tests/http-payloads.ps1`)
- ✅ Documentación completa (setup, API, contributing)

**Base de datos completamente modelada:**

```sql
-- 9 Tablas creadas
clients                -- Información de clientes (42 campos)
cases                  -- Expedientes legales
case_events            -- Historial de eventos (flexible, case_id nullable)
deadlines              -- Plazos críticos
appointments           -- Agenda de citas
invoices               -- Facturación
conversations          -- Historial conversacional
knowledge_chunks       -- Base de conocimiento para IA
audit_logs             -- Trazabilidad para compliance
```

---

## Siguientes Pasos Recomendados

### Fase 2: RAG y Mejora de IA (Semanas 3-4)

- [ ] Cargar knowledge_chunks con jurisprudencia local
- [ ] Integrar embeddings OpenAI + similarity search
- [ ] Mejorar generación de borradores con contexto legal

### Fase 2: Dashboard y Reporting (Semana 5)

- [ ] Frontend React para visualizar casos y KPIs
- [ ] Tableros de: casos abiertos, ingresos, deadlines próximos
- [ ] API REST para operaciones CRUD de casos

### Fase 2: Integraciones Avanzadas (Semana 6)

- [ ] Google Calendar bidireccional (sincronización de citas)
- [ ] Docusign: firma de documentos automática
- [ ] Slack: notificaciones de abogados en tiempo real
- [ ] Stripe: pagos online de facturas

---

## Tips Importantes

### 🔒 Seguridad

- **Cambiar JWT_SECRET** en `.env` a valor aleatorio: `openssl rand -hex 32`
- **HTTPS para producción**: usar reverse proxy (Nginx/CloudFlare)
- **Encriptación de datos**: considerar pgcrypto para información sensible

### 🚀 Escalado

- **n8n**: múltiples instancias detrás de load balancer
- **PostgreSQL**: connection pooling con pgbouncer
- **Rate limiting**: implementar en API gateway

### 📋 Compliance

- Todos los eventos registrados en `audit_logs` para RGPD
- Consentimiento de procesamiento de datos capturado en `clients.consent_data_processing`
- Trazas de quién cambió qué y cuándo

---

## Soporte y Contribuciones

- **Reportar bugs**: Crear issue en GitHub
- **Proponer features**: Revisar [CONTRIBUTING.md](CONTRIBUTING.md)
- **Mejorar prompts**: Editar archivos en `prompts/` y testear
- **Crear integraciones**: Guía en [CONTRIBUTING.md](CONTRIBUTING.md#3-agregar-integraciones-externas)

---

## Especificaciones Técnicas

- **Lenguajes**: JSON (n8n), SQL (PostgreSQL), JavaScript (Code nodes)
- **Dependencias externas**: n8n, PostgreSQL 14+, OpenAI API
- **Compatibilidad**: n8n 1.0+, PostgreSQL 14+, WebStandard webhooks (RFC 3986)
- **Performance**: < 10s por webhook (con BD de ~100 casos)
- **Disponibilidad**: self-hosted o cloud (AWS, DigitalOcean, Render, etc)

---

## Variables de Entorno Necesarias

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=legal_office_db
DB_USER=postgres
DB_PASSWORD=***

# OpenAI
OPENAI_API_KEY=sk-***
OPENAI_MODEL=gpt-4-turbo
OPENAI_TEMPERATURE=0.7

# (Opcional) Canales
WHATSAPP_API_KEY=***
WHATSAPP_PHONE_ID=***

# (Opcional) SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=***
SMTP_PASSWORD=***

# Seguridad
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
```

Copiar `.env.example` a `.env` y actualizar valores.

---

## Licencia y Uso

Este proyecto es código base (scaffolding) para que los abogados lo adapten a su práctica. Incluye:

- ✅ Plantillas JSON listas para usar
- ✅ Esquema de BD diseñado para legal
- ✅ Prompts base (ajustables)
- ✅ Tests automatizados

No incluye:

- ❌ Asesoramiento legal
- ❌ Cumplimiento regulatorio específico de tu jurisdicción
- ❌ Integración con sistemas legales locales

**Debes revisar con un abogado especializado en tech/compliance antes de producción.**

---

## Agradecimientos

Proyecto diseñado para pequeños despachos que quieren automatizar sin costo prohibitivo. Stack elegido por ser open-source, escalable y agnóstico de proveedor.

¡Empezar instalación: [docs/setup.md](docs/setup.md) →
