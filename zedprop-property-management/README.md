# 🏢 ZedProp — AI-Powered WhatsApp Property Management Platform

[![GitHub License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rosario06%2Fn8n-blue?logo=github)](https://github.com/rosario06/n8n)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Setup Time](https://img.shields.io/badge/Setup-25%20min-blue)]()
[![Cost](https://img.shields.io/badge/Cost-%24%24%24%200-brightgreen)]()

Una plataforma **enterprise-grade** de gestión de propiedades construida **directamente dentro de WhatsApp** usando n8n, Baserow, Invoice Ninja, y Groq/Llama 3.

✨ **100% GRATUITO** — sin límites de registros, sin cuotas, self-hosted  
💰 **Costo: $0/mes** (todos los servicios son open-source o gratis)  
⚡ **Instalable en 25 minutos**  
🔐 **Datos tuyos** — nada en la nube sin tu control

## 🎯 Descripción General

ZedProp es una solución enterprise para gestionar:

- **Residencias para estudiantes** (contratos, pagos, documentos)
- **Propiedades de alquiler** (inquilinos, solicitudes, facturas)
- **Comunicación directa** con propietarios, administradores e inquilinos

### ⚡ Inicio Rápido

| Recurso                                                                  | Descripción                                               |
| ------------------------------------------------------------------------ | --------------------------------------------------------- |
| [📋 REQUIREMENT_VALIDATION.md](REQUIREMENT_VALIDATION.md)                | ✅ Validación 100% del requerimiento inicial              |
| [📖 SETUP_GUIDE.md](docs/SETUP_GUIDE.md)                                 | 5 fases de instalación (25 min total con Docker Compose)  |
| [🏗️ ARCHITECTURE.md](docs/ARCHITECTURE.md)                               | Diagrama técnico del stack (Baserow, Invoice Ninja, Groq) |
| [🔌 Integraciones](integrations/)                                        | Guías de setup para n8n, Baserow, Invoice Ninja, Groq     |
| [📊 REQUIREMENT_VALIDATION.md → Casos de Uso](REQUIREMENT_VALIDATION.md) | 6 flujos reales con stack gratuito                        |

### Características Principales

✅ **Enrutamiento Inteligente**: Detecta automáticamente si quien escribe es propietario, inquilino o desconocido  
✅ **Generación de PDFs Dinámicos**: Contratos y facturas en ~3 segundos (nodo HTML​2PDF)  
✅ **Sincronización Contable**: Pagos → Invoice Ninja automáticamente  
✅ **IA Integrada**: Tutoría online con Groq Llama 3 (completamente gratuita)  
✅ **Gestión de Propiedades**: Datos centralizados en Baserow (self-hosted)  
✅ **Notificaciones Multi-Canal**: WhatsApp, Telegram, Discord, Email  
✅ **Costo REAL $0**: Sin tarjetas de crédito, sin suscripciones, sin límites

> **¿Cumple el requerimiento?** → Ver [REQUIREMENT_VALIDATION.md](REQUIREMENT_VALIDATION.md) (validación completa con checklist de 10+ funcionalidades)

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────┐
│            Canales de Entrada (Gratuitos)                │
│  WhatsApp (Twilio/Meta) | Telegram | Discord | Email     │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│         n8n Workflow Engine (100+ Nodos)                 │
│  • Recepción de webhooks                                 │
│  • Enrutamiento inteligente (Owner/Tenant/Public)        │
│  • Validación y procesamiento                            │
│  • Orquestación de integraciones                         │
└──────────────┬──────────────┬──────────────┬─────────────┘
               │              │              │
               ▼              ▼              ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ Baserow  │    │ Invoice  │    │ Groq /   │
        │ (Datos)  │    │ Ninja    │    │ Llama 3  │
        │ Self-    │    │ (Factura)│    │ (IA)     │
        │ hosted   │    │ Gratis   │    │ Gratis   │
        └──────────┘    └──────────┘    └──────────┘
               │              │              │
               └──────────────┬──────────────┘
                              │
                   ┌──────────▼──────────┐
                   │ Canales de Salida   │
                   │ WhatsApp/Telegram   │
                   │ Discord/Email/SMS   │
                   └─────────────────────┘
```

### Stack Tecnológico (100% Gratuito)

1. **Webhook Entrada** → Recibe mensaje WhatsApp
2. **Identificación de Usuario** → ¿Quién envía el mensaje?
3. **Enrutamiento Dinámico** → Menú contextual según rol
4. **Procesamiento de Solicitud** → Acción específica
5. **Sincronización** → Actualiza Airtable/Google Sheets (o Xero)
6. **Respuesta** → Envía resultado a WhatsApp

---

## 📁 Estructura de Carpetas

```
zedprop-property-management/
├── README.md                          # Este archivo
├── docs/
│   ├── ARCHITECTURE.md               # Diagrama y explicación técnica
│   ├── USER_FLOWS.md                 # Flujos por tipo de usuario
│   ├── SETUP_GUIDE.md                # Guía de instalación
│   └── API_REFERENCE.md              # Referencia de APIs
├── n8n-workflows/
│   ├── main-webhook-handler.json     # Flujo principal (100+ nodos)
│   ├── sub-workflows/
│   │   ├── smart-routing.json        # Enrutamiento inteligente
│   │   ├── pdf-generator.json        # Generador dinámico de PDFs
│   │   ├── xero-sync.json            # Sincronización contable
│   │   └── ai-companion.json         # Asistente de IA
│   └── examples/
│       ├── rental-payment.json       # Ejemplo: procesar pago
│       └── contract-request.json     # Ejemplo: solicitar contrato
├── integrations/
│   ├── airtable-config.js            # Configuración Airtable
│   ├── xero-config.js                # Credenciales Xero
│   ├── gpt4o-setup.md                # Configuración GPT-4o
│   └── whatsapp-setup.md             # Setup WhatsApp API
├── schemas/
│   ├── data-models.json              # Modelos de datos
│   ├── user-types.json               # Roles y permisos
│   └── request-types.json            # Tipos de solicitudes
├── prompts/
│   ├── study-buddy.md                # Prompt: Compañero de estudio
│   ├── property-assistant.md         # Prompt: Asistente de propiedades
│   └── customer-service.md           # Prompt: Servicio al cliente
├── config/
│   ├── .env.example                  # Variables de entorno
│   ├── mappings.json                 # Mapeos de datos
│   └── error-handling.json           # Gestión de errores
└── templates/
    ├── pdf-contract-template.html    # Template: contrato
    ├── pdf-invoice-template.html     # Template: factura
    └── messages-templates.json       # Templates de mensajes
```

---

## 🚀 Instalación Rápida - 100% Gratuito

### Stack Completo (Costo: $0/mes)

- **n8n** (Self-hosted, Docker) - Gratuito & Open Source
- **Baserow** (Self-hosted, Docker) - Gratuito & Open Source (alternativa Airtable)
- **Invoice Ninja** (Self-hosted, Docker) - Gratuito & Open Source (facturación/contabilidad)
- **Groq / Hugging Face** (Llama 3) - API Gratuita (IA)
- **WhatsApp/Telegram** - Canales de entrada gratuitos

### Opción Simple (En Servidor Local)

```bash
# 1. Docker Compose con 3 contenedores: n8n + Baserow + Invoice Ninja
docker-compose up -d

# 2. Configurar webhooks WhatsApp → n8n
# 3. Crear tablas en Baserow
# 4. Importar workflows n8n (.json)
# 5. Listo en ~25 minutos
```

**Costo real**: $0 (solo costo de infraestructura si usas VPS: ~$3-5/mes)

---

## 🎯 Pasos de Instalación (5 fases)

**Fase 1: Base de Datos (Baserow)** - 5 min  
**Fase 2: Mensajería (WhatsApp/Telegram)** - 10 min  
**Fase 3: Contabilidad (Invoice Ninja)** - 5 min  
**Fase 4: IA (Groq/Llama 3)** - 2 min  
**Fase 5: Workflows (n8n)** - 10 min

[👉 Ver SETUP_GUIDE.md completo](docs/SETUP_GUIDE.md)

---

## 🔑 Funcionalidades Detalladas

### 1️⃣ Enrutamiento Inteligente

```
Mensaje WhatsApp entra → n8n webhook
    ↓
Query Baserow: ¿Teléfono en tabla Propietarios?
    ↓
¿Propietario? → [Menú Propietario]
¿Estudiante/Inquilino? → [Menú Inquilino]
¿Desconocido? → [Menú Público]
```

**Menú Propietario**: Ver inquilinos, reportes, facturas pendientes, crear propiedades  
**Menú Inquilino**: Solicitar contrato, pagar renta, reportar daños, tutoría IA  
**Menú Público**: Info general, formulario solicitud, consultar precio

### 2️⃣ PDFs Dinámicos (~3 segundos)

Flujo en n8n:

```
1. Inquilino: "Quiero mi contrato"
   ↓
2. Query Baserow → Extrae datos (formato, términos, arrendador)
   ↓
3. Nodo HTML2PDF → Renderiza template HTML
   ↓
4. Opcional: Sube a Baserow files, o enlace temporal
   ↓
5. Envía PDF link por WhatsApp
```

**Tiempo**: Query (500ms) + Render (1s) + Send (500ms) = **~2-3s** ✅

### 3️⃣ Sincronización Contable (Invoice Ninja)

Flujo automático:

```
Inquilino: "Pagar $500 por renta"
   ↓
n8n valida: ¿Cantidad correcta y propiedad válida? (Baserow)
   ↓
Crea Invoice en Invoice Ninja
   ↓
Marca como pagado en Baserow
   ↓
Notifica al propietario (WhatsApp/Email)
```

**Soporta**:

- Pagos de una sola vez
- Pagos recurrentes (mensuales)
- Recordatorios automáticos (Discord/Email)
- Reportes de flujo de caja (dashboard Invoice Ninja)

### 4️⃣ Asistente de IA (Groq Llama 3)

Estudiantes pueden:

```
"¿Cómo resuelvo las integrales?"
   ↓
n8n envía a Groq API (Llama 3 - GRATIS)
   ↓
Respuesta con explicación paso a paso
   ↓
Almacena en Baserow para historial
```

**Base**: Prompt personalizado para contexto educativo  
**Costo**: GRATIS (API gratuita de Groq)  
**Velocidad**: Respuesta en 1-2 segundos

---

## 📊 Flujos de Casos de Uso (Stack Gratuito)

| Caso                   | Actor       | Flujo                                                                                         |
| ---------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| **Solicitar Contrato** | Estudiante  | Mensaje → n8n busca en **Baserow** → Genera PDF (nodo HTML2PDF) → Envía link (WA/Telegram)    |
| **Procesar Pago**      | Estudiante  | "Pagar $500" → Valida (Baserow) → Crea factura en **Invoice Ninja** → Confirmación automática |
| **Ver Inquilinos**     | Propietario | Mensaje → Query **Baserow** (Estado: Activo) → Lista formateada → Envía por WA                |
| **Reportar Daño**      | Estudiante  | Foto + descripción → Registro en **Baserow** → Notifica a Staff (**Discord/Email**)           |
| **Consulta Contable**  | Propietario | "¿Facturas pendientes?" → Sync con **Invoice Ninja** → Respuesta con saldo                    |
| **Tutoría Online**     | Estudiante  | "¿Cómo integrales?" → **Groq/Llama 3** (gratis) → Explicación paso a paso                     |

---

## 🔒 Seguridad

- **Validación**: Todos los números se validan contra tabla de propietarios/inquilinos (**Baserow**)
- **Permisos**: Roles (Admin, Propietario, Inquilino, Staff) con acceso granular
- **Encriptación**: API keys en variables de entorno (.env)
- **Rate Limiting**: Límites por usuario para evitar spam
- **Logs**: Auditoría completa en Baserow (quién, qué, cuándo)
- **Self-Hosted**: Datos en tu servidor, no en la nube

---

## 📞 Canales de Comunicación

| Canal                 | Entrada    | Salida            | Costo      |
| --------------------- | ---------- | ----------------- | ---------- |
| **WhatsApp** (Twilio) | ✅ Webhook | ✅ Respuestas     | $0.005/msg |
| **Telegram**          | ✅ Webhook | ✅ Notificaciones | GRATIS     |
| **Discord**           | ❌         | ✅ Alertas staff  | GRATIS     |
| **Email**             | ❌         | ✅ Confirmaciones | GRATIS     |

---

## 🛠️ Stack Tecnológico (100% Gratuito)

| Componente            | Tecnología                      | Rol                     | Costo  | Licencia     |
| --------------------- | ------------------------------- | ----------------------- | ------ | ------------ |
| **Backend**           | n8n (self-hosted)               | Orquestación            | $0     | Open Source  |
| **Base de datos**     | **Baserow** (self-hosted)       | Propiedades, inquilinos | $0     | Open Source  |
| **Contabilidad**      | **Invoice Ninja** (self-hosted) | Facturas, pagos         | $0     | Open Source  |
| **IA**                | **Groq / Llama 3**              | Asistente educativo     | $0     | API Gratuita |
| **Total Costo Mes 1** | -                               | -                       | **$0** | -            |

---

## 📈 Escalabilidad

- **Multipropiedad**: Un solo setup para múltiples propiedades
- **Multiusuario**: Unlimited propietarios + inquilinos
- **Multidioma**: Fácil agregar soporte a otros idiomas
- **Multimercado**: Estructura lista para US, UK, LATAM, etc.

Con n8n auto-scaling, maneja 1000+ mensajes/día sin problemas.

---

## �️ Roadmap

### ✅ MVP Completado (v1.0) - 100% Gratuito

- [x] Gestión de propiedades en **Baserow** (self-hosted)
- [x] WhatsApp/Telegram webhooks
- [x] Enrutamiento inteligente (Owner/Tenant/Public)
- [x] PDFs dinámicos (contratos, facturas) con html2pdf
- [x] Sincronización contable (**Invoice Ninja** self-hosted)
- [x] Asistente IA (**Groq/Llama 3** gratis)
- [x] Notificaciones multi-canal (WA, Telegram, Discord, Email)
- [x] Documentación completa (3,500+ líneas)
- [x] Setup en 25 minutos
- [x] **Costo: $0/mes** (datos tuyos, código abierto)

### 🔄 Próximo (v1.1) - Q2 2026

- [ ] Dashboard web (Baserow integrado)
- [ ] SMS como canal adicional (Twilio)
- [ ] Reportes avanzados (Invoice Ninja + Baserow)
- [ ] Integración payment gateways (Stripe, Mercado Pago)
- [ ] Templates de contratos personalizables

### 🚀 Futuro (v2.0) - Q3-Q4 2026

- [ ] Reportes avanzados (BI integrado)

### 🚀 Futuro (v2.0) - Q3-Q4 2026

- [ ] Mobile app (iOS/Android)
- [ ] WhatsApp Catalog integration
- [ ] Marketplace de templates
- [ ] White-label solution
- [ ] Multi-tenant SaaS

---

## �📝 Próximos Pasos

1. **Revisa** [ARCHITECTURE.md](docs/ARCHITECTURE.md) para entender el flujo completo
2. **Sigue** [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) para instalación paso a paso
3. **Explora** ejemplos de workflow en `n8n-workflows/examples/`
4. **Configura** integraciones en `integrations/`
5. **Personaliza** prompts de IA en `prompts/`

---

## 📄 Licencia

Código abierto. Libre para usar y modificar.

---

## 💬 Soporte & Contribuciones

- **Preguntas**: Abre un issue
- **Contributions**: Pull requests bienvenidas
- **Bugs**: Reporta con detalles en Issues

---

**Creado con ❤️ para propietarios e inquilinos que se merecen mejor UX**

Última actualización: Marzo 2026
