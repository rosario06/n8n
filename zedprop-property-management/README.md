# 🏢 ZedProp — AI-Powered WhatsApp Property Management Platform

[![GitHub License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rosario06%2Fn8n-blue?logo=github)](https://github.com/rosario06/n8n)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Setup Time](https://img.shields.io/badge/Setup-25%20min-blue)]()
[![Cost](https://img.shields.io/badge/Cost-$0%20Starter-green)]()

Una plataforma **enterprise-grade** de gestión de propiedades construida **directamente dentro de WhatsApp** usando n8n, Airtable, Google Sheets (o Xero) y GPT-4o.

✨ **Sin aplicaciones que descargar, sin portales web complicados** — todo funciona en WhatsApp.  
💰 **Gratis para empezar** ($0/mes con Google Sheets)  
⚡ **Instalable en 25 minutos**

## 🎯 Descripción General

ZedProp es una solución enterprise para gestionar:

- **Residencias para estudiantes** (contratos, pagos, documentos)
- **Propiedades de alquiler** (inquilinos, solicitudes, facturas)
- **Comunicación directa** con propietarios, administradores e inquilinos

### ⚡ Inicio Rápido

| Recurso                                                   | Descripción                                                 |
| --------------------------------------------------------- | ----------------------------------------------------------- |
| [📋 REQUIREMENT_VALIDATION.md](REQUIREMENT_VALIDATION.md) | ✅ Validación 100% del requerimiento inicial                |
| [📖 SETUP_GUIDE.md](docs/SETUP_GUIDE.md)                  | 5 fases de instalación (25 min total)                       |
| [💰 ACCOUNTING_OPTIONS.md](ACCOUNTING_OPTIONS.md)         | Comparar: Google Sheets vs Wave vs Xero                     |
| [🏗️ ARCHITECTURE.md](docs/ARCHITECTURE.md)                | Diagrama técnico completo                                   |
| [🔌 Integraciones](integrations/)                         | Guías de setup para Airtable, WhatsApp, Google Sheets, Xero |

### Características Principales

✅ **Enrutamiento Inteligente**: Detecta automáticamente si quien escribe es propietario, inquilino o desconocido  
✅ **Generación de PDFs Dinámicos**: Contratos y facturas en ~3 segundos  
✅ **Sincronización Contable**: Pagos de alquiler → Google Sheets o Xero automáticamente  
✅ **IA Integrada**: Compañero de estudio y asistente virtual con GPT-4o  
✅ **Gestión de Propiedades**: Datos centralizados en Airtable/Google Sheets  
✅ **Notificaciones Automáticas**: Recordatorios de pago, actualizaciones de propiedades, etc.  
✅ **Costo MÍNIMO**: $0 inicial (todos los servicios tienen plan gratuito)

> **¿Cumple el requerimiento?** → Ver [REQUIREMENT_VALIDATION.md](REQUIREMENT_VALIDATION.md) (validación completa con checklist de 10+ funcionalidades)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    WhatsApp Web Hook                     │
│              (Twilio / WhatsApp Business API)            │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│              n8n Workflow Engine (100+ nodos)            │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Mayor flujo de trabajo principal:                   ││
│  │ - Webhook receptor / entrada                        ││
│  │ - Enrutamiento (propietario/inquilino/otro)         ││
│  │ - Menús dinámicos / procesamiento                   ││
│  │ - Integraciones y sincronización                    ││
│  └─────────────────────────────────────────────────────┘│
└───┬──────────┬──────────┬──────────┬───────────────────┘
    │          │          │          │
    ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Airtable│ │  Xero  │ │  GPT-4o│ │ Google │
│ (Base) │ │(Cuenta)│ │(Prompt)│ │ Sheets │
└────────┘ └────────┘ └────────┘ └────────┘
```

### Flujos de Trabajo Principales

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

## 🚀 Instalación Rápida

### ⭐ Opción MVP (Recomendada) - Totalmente Gratis

Todos los servicios con plan **gratuito**:

- **n8n** (self-hosted o n8n.cloud - Free tier)
- **Airtable** (Free: 5 bases, 1200 registros)
- **Google Sheets** ⭐ (Contabilidad gratis - Setup 5 min)
- **OpenAI API** (Pay-as-you-go desde $0.15)
- **WhatsApp Business API** (Twilio - $0.005/msg)

**Total costo mes 1**: ~$5-10  
**Setup completo**: ~25 minutos  
[Ver ACCOUNTING_OPTIONS.md](ACCOUNTING_OPTIONS.md) para otras opciones

### ❤️ Opción Enterprise (Profesional)

Para operaciones a escala (100+ propiedades):

- **n8n Pro/Business** ($20+/mes, self-hosted gratis)
- **Airtable Pro** ($12/mes)
- **Xero** ($15/mes, contabilidad oficial)
- **OpenAI GPT-4o** (API credits)
- **Amazon S3** (PDFs, $0.023/GB almacenado)

**Total costo mes 1**: ~$50-80  
**Setup completo**: ~45 minutos

---

## 🎯 Pasos de Instalación (5 fases)

**Fase 1: Datos (Airtable)** - 5 min  
**Fase 2: Mensajería (WhatsApp)** - 10 min  
**Fase 3: Contabilidad (Google Sheets o Xero)** - 5-15 min ⭐ ELIGE AQUÍ  
**Fase 4: IA (OpenAI)** - 2 min  
**Fase 5: Workflows (n8n)** - 10 min

[👉 Ver SETUP_GUIDE.md completo](docs/SETUP_GUIDE.md)

---

## 🔑 Funcionalidades Detalladas

### 1️⃣ Enrutamiento Inteligente

```
Mensaje WhatsApp entra
    ↓
¿Número en base de propietarios? → [Menú Propietario]
    ↓
¿Número en base de estudiantes? → [Menú Estudiante]
    ↓
Número desconocido → [Menú Público]
```

**Menú Propietario**: Crear propiedad, ver inquilinos, reportes, facturación  
**Menú Estudiante**: Solicitar contrato, pagar renta, reportes de daños, mensajes  
**Menú Público**: Info general, formulario de solicitud

### 2️⃣ PDFs Dinámicos (~3 segundos)

El n8n workflow:

1. Recibe solicitud de contrato/factura
2. Extrae datos de Airtable (arrendador, inquilino, términos)
3. **Renderiza HTML → PDF** (usando librería pdf-lib o similar)
4. Sube PDF a servidor temporal
5. Envía enlace directo al chat WhatsApp

**Tiempo**: Query Airtable (500ms) + Render HTML (1s) + Upload PDF (500ms) + Send message (500ms) = ~2-3s ✅

### 3️⃣ Sincronización Contable (Xero)

Flujo automático:

```
Inquilino paga renta vía WhatsApp
    ↓
n8n valida el pago (Airtable)
    ↓
Crea factura en Xero automáticamente
    ↓
Actualiza estado de pago
    ↓
Notifica a propietario
```

Soporta:

- Pagos únicos
- Pagos recurrentes/automáticos
- Recordatorios antes de la fecha de vencimiento
- Reportes de flujo de caja

### 4️⃣ Asistente de IA (Study Buddy)

Estudiantes pueden:

- Hacer preguntas sobre sus tareas
- Explicaciones de conceptos
- Generador de resúmenes
- Chat conversacional 24/7

Base: GPT-4o con prompt personalizado para contexto educativo

---

## 📊 Casos de Uso

| Caso                           | Actor       | Flujo                                                         |
| ------------------------------ | ----------- | ------------------------------------------------------------- |
| Solicitar contrato de alquiler | Estudiante  | Mensaje → n8n busca en Airtable → Genera PDF → Envía link     |
| Procesar pago de renta         | Estudiante  | "Pagar $500" → Valida → Xero → Confirmación                   |
| Ver inquilinos activos         | Propietario | Mensaje → Query Airtable → Lista con estado                   |
| Reportar daño en propiedad     | Estudiante  | Foto + descripción → Se registra en Airtable → Notifica staff |
| Consulta contable              | Propietario | "¿Facturas pendientes?" → Sync con Xero → Respuesta           |
| Tutoría online                 | Estudiante  | "¿Cómo integrales?" → GPT-4o → Explicación completa           |

---

## 🔒 Seguridad

- **Validación**: Todos los números se validan contra base de propietarios/inquilinos
- **Permisos**: Roles (Admin, Propietario, Inquilino, Staff) con acceso granular
- **Encriptación**: Credenciales Xero/Airtable en variables de entorno
- **Rate Limiting**: Límites por usuario para evitar spam
- **Logs**: Auditoría completa de acciones (quién, qué, cuándo)

---

## 📞 Integración WhatsApp

### Opción 1: Twilio (Recomendado)

- Más flexible y rápido de setup
- Soporta multimedia (imágenes, PDFs)
- Excelente documentación

### Opción 2: Meta (WhatsApp Business API)

- Oficial de Meta
- Mejor deliverability
- Requiere verificación más estricta

Ambas se conectan a n8n via webhook HTTP.

---

## 🛠️ Stack Tecnológico

| Componente        | Tecnología              | Rol                                | Costo MVP        |
| ----------------- | ----------------------- | ---------------------------------- | ---------------- |
| **Backend**       | n8n (100+ nodos)        | Orquestación, lógica               | $0 (self-hosted) |
| **Base de datos** | Airtable                | Propiedades, inquilinos, historial | $0 (Free plan)   |
| **Contabilidad**  | Google Sheets ⭐ / Xero | Facturas, pagos, reportes          | **$0** / $15/mes |
| **IA**            | OpenAI (GPT-4o)         | Asistente, procesamiento NLP       | $0.15-2/mes      |
| **Mensajería**    | WhatsApp API            | Interfaz de usuario                | $0.005/msg       |
| **PDFs**          | pdf-lib / puppeteer     | Generación dinámica                | $0               |
| **Autenticación** | API Keys + JWT          | Seguridad                          | $0               |

**MVP Total (Mes 1)**: ~$5-10  
**Enterprise (100+ props)**: ~$50-80

---

## 📈 Escalabilidad

- **Multipropiedad**: Un solo setup para múltiples propiedades
- **Multiusuario**: Unlimited propietarios + inquilinos
- **Multidioma**: Fácil agregar soporte a otros idiomas
- **Multimercado**: Estructura lista para US, UK, LATAM, etc.

Con n8n auto-scaling, maneja 1000+ mensajes/día sin problemas.

---

## �️ Roadmap

### ✅ MVP Completado (v1.0)

- [x] Gestión de propiedades en Airtable
- [x] WhatsApp webhook (Twilio/Meta)
- [x] Enrutamiento inteligente (Owner/Tenant/Public)
- [x] PDFs dinámicos (contratos, facturas)
- [x] Sincronización contable (Google Sheets, Xero)
- [x] 3 asistentes de IA (GPT-4o)
- [x] Documentación completa (3,500+ líneas)
- [x] Setup en 25 minutos

### 🔄 Próximo (v1.1) - Q2 2026

- [ ] Guía Wave (opción gratuita adicional)
- [ ] SMS como canal alternativo
- [ ] Dashboard web complementario
- [ ] Integración payment gateways (Stripe, Mercado Pago)
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
