# ZedProp - AI-Powered WhatsApp Property Management Platform

## 📱 Aplicación Completa de Administración de Propiedades en WhatsApp

Una plataforma **moderna, escalable y sin código** para gestionar propiedades de alquiler directamente desde WhatsApp.

**Tech Stack**: n8n + Airtable + Xero + GPT-4o + WhatsApp API

---

## 🎯 Características Principales

✅ **Enrutamiento Inteligente**: Detección automática de propietarios, inquilinos y públicos  
✅ **Generación de PDFs Dinámicos**: Contratos y facturas en 2-3 segundos  
✅ **Sincronización Contable**: Pagos de renta → Xero automáticamente  
✅ **Asistente IA**: "Study Buddy" propulsado por GPT-4o para estudiantes  
✅ **Sistema de Tickets**: Reportar problemas de propiedades  
✅ **Auditoría Completa**: Logs de todos los mensajes y transacciones  
✅ **Multilenguaje**: Español, inglés, extensible  
✅ **No-Code/Low-Code**: n8n permite modificaciones sin programación

---

## 📁 Estructura del Proyecto

```
zedprop-property-management/
│
├── README.md                    ← Empeza aquí
├── LICENSE
│
├── 📁 docs/
│   ├── ARCHITECTURE.md         ← Diagrama técnico completo
│   ├── USER_FLOWS.md          ← Flujos por tipo de usuario
│   ├── SETUP_GUIDE.md         ← Instalación paso a paso (30-45 min)
│   └── API_REFERENCE.md       ← Referencia de APIs externas
│
├── 📁 n8n-workflows/
│   ├── README.md              ← Cómo importar workflows
│   ├── main-webhook-handler.json      ← FLUJO PRINCIPAL (~100 nodos)
│   ├── sub-workflows/
│   │   ├── smart-routing.json       ← Enrutamiento inteligente
│   │   ├── pdf-generator.json       ← Generador de PDFs
│   │   ├── xero-sync.json          ← Sincronización Xero
│   │   └── ai-companion.json       ← Chat GPT-4o
│   ├── examples/
│   │   ├── rental-payment.json     ← Ejemplo: procesar pago
│   │   └── contract-request.json   ← Ejemplo: descargar contrato
│   └── templates/
│       ├── pdf-contract.html       ← Template HTML contrato
│       └── pdf-invoice.html        ← Template HTML factura
│
├── 📁 integrations/
│   ├── whatsapp-setup.md       ← Configurar Twilio o Meta
│   ├── airtable-config.md      ← Crear base y tablas Airtable
│   ├── xero-config.md          ← OAuth Xero y contabilidad
│   └── gpt4o-setup.md          ← API OpenAI (por hacer)
│
├── 📁 schemas/
│   ├── user-types.json         ← Roles: owner, tenant, staff
│   ├── request-types.json      ← Tipos de solicitudes
│   └── data-models.json        ← Modelos Airtable
│
├── 📁 prompts/
│   ├── study-buddy.md          ← Prompt para tutor IA
│   ├── property-assistant.md   ← Prompt asesor propiedades
│   └── customer-service.md     ← Prompt soporte cliente
│
└── 📁 config/
    ├── .env.example            ← Variables de entorno template
    ├── mappings.json           ← Mapeos de datos
    └── error-handling.json     ← Configuración de errores
```

---

## 🚀 Inicio Rápido (5 min)

### 1. Lee Documentación

```bash
# En este orden:
1. README.md (estás aquí)
2. docs/ARCHITECTURE.md
3. docs/SETUP_GUIDE.md
```

### 2. Cumpla con Requisitos

```
✅ Cuenta Airtable (gratuito: airtable.com)
✅ Cuenta n8n (n8n.cloud o self-hosted)
✅ Cuenta Twilio o Meta (WhatsApp)
✅ Cuenta Xero o Wave (contabilidad)
✅ Cuenta OpenAI (GPT-4o)
```

### 3. Sigue SETUP_GUIDE.md

```bash
# 30-45 minutos para:
- Crear base Airtable ✓
- Configurar WhatsApp ✓
- Conectar Xero ✓
- Agregar OpenAI ✓
- Crear workflows n8n ✓
- Enviar mensaje test ✓
```

### 4. Personaliza

```
Edita prompts/ para tu negocio
Modifica workflows en n8n
Ajusta flujos según necesidad
```

---

## 💡 Casos de Uso

### Caso 1: Residencias para Estudiantes (Original)

```
Estudiantes pueden en WhatsApp:
- Descargar contrato de alquiler
- Pagar renta en tiempo real
- Reportar daños (con foto)
- Chat Study Buddy para ayuda académica
- Ver estado de pagos
```

### Caso 2: Propiedades de Alquiler

```
Propietarios ven en WhatsApp:
- Lista de inquilinos + estado
- Pagos pendientes / recibidos
- Reportes financieros rápida
- Notificaciones automáticas
```

### Caso 3: Empresas Inmobiliarias

```
Staff puede:
- Gestionar múltiples propiedades
- Responder tickets de problemas
- Generar documentos automáticos
- Ver dashboards de ingresos
```

---

## 🏗️ Arquitectura (Alta Nivel)

```
┌──────────────────────────────────────────────────────────────┐
│                         WhatsApp                              │
│     (Interfaz del usuario, 2B + 100M usuarios)               │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP POST
                         │
                ┌────────┴──────────┐
                │                   │
         ┌──────▼────────┐  ┌───────▼─────────┐
         │ Twilio API    │  │ Meta API        │
         │ (Recomendado) │  │ (Producción)    │
         └──────┬────────┘  └───────┬─────────┘
                │                   │
                └────────┬──────────┘
                         │
                ┌────────▼──────────────────┐
                │  n8n Workflow Engine      │
                │  (Backend + Lógica)       │
                │  [100+ nodos]             │
                └────────┬──────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐   ┌──────▼────┐   ┌───────▼──────┐
   │ Airtable │   │   Xero    │   │  OpenAI      │
   │ (Datos)  │   │(Contable) │   │ (IA/GPT-4o)  │
   └──────────┘   └───────────┘   └──────────────┘
```

---

## 🔧 Tech Stack Detallado

| Componente        | Tecnología            | Rol                     | Plan Gratuito     |
| ----------------- | --------------------- | ----------------------- | ----------------- |
| **Backend**       | n8n                   | Orquestación, workflows | n8n.cloud gratis  |
| **Base de Datos** | Airtable              | Datos + API             | 100 registros/mes |
| **Contabilidad**  | Xero                  | Invoices, pagos         | 30 días prueba    |
| **IA**            | OpenAI GPT-4o         | Tutorías, chat          | $5 crédito        |
| **Mensajería**    | Twilio                | WhatsApp API            | $15 crédito       |
| **Documentos**    | pdf-lib               | Generar PDFs            | Gratis            |
| **Hosting**       | AWS/GCP/Digital Ocean | Servidor                | Tier gratis       |

**Costo Mínimo Mensual**: $0 (con cuentas gratuitas/trial)

---

## 🎓 Requisitos de Conocimiento

### Mínimo

- [ ] Entender qué es una API webhook
- [ ] Capaz de copiar/pegar JSON
- [ ] Sabe usar navegador web

### Recomendado

- [ ] Experiencia con n8n (basic)
- [ ] Familiaridad con APIs REST
- [ ] Básicos de JavaScript (para Code nodes)

### NO Necesario

- ❌ Programación avanzada
- ❌ DevOps/Kubernetes
- ❌ Bases de datos SQL

---

## 📊 Escalabilidad

### Rendimiento Actual (sin optimizaciones)

- **~100 req/min**
- **~1000 mensajes/día**
- **Respuesta: 2-5 seg**

### Con Optimizaciones (recomendadas)

- **~1000+ req/min**
- **~50,000 mensajes/día**
- **Respuesta: <2 seg**

**Optimizaciones Incluidas**:

- ✅ Caché de Airtable en memoria
- ✅ Batch processing de pagos
- ✅ Async PDF generation
- ✅ Rate limiting

---

## 🔐 Seguridad

- **Validación de usuarios**: Solo #s registrados
- **Role-based access**: Propietarios vs Inquilinos
- **Rate limiting**: Max 20 req/hora por usuario
- **Audit trail**: Cada acción logueeada
- **Encriptación**: Credenciales en variables de entorno
- **Tokenización**: OAuth2 con Xero, Twilio signatures

---

## 🚀 Pasos Siguientes

### Corto Plazo (Week 1)

1. ✅ Crea cuentas en Airtable, Twilio, Xero, OpenAI
2. ✅ Sigue SETUP_GUIDE.md
3. ✅ Envía primer mensaje test
4. ✅ Personaliza prompts de IA

### Mediano Plazo (Week 2-3)

1. Agregar más propiedades + inquilinos reales
2. Optimizar PDF templates
3. Crear views/reportes en Airtable
4. Setup monitoreo con Sentry/DataDog

### Largo Plazo (Month 2+)

1. Expandir a SMS/email (canales adicionales)
2. Integrar payment gateway (Stripe, etc.)
3. Mobile app nativa (React Native)
4. White-label para otros propietarios

---

## 📝 Licencia

**MIT License** - Libre para usar, modificar, distribuir.

Créditos: Inspirado en casos reales de property management.

---

## 🤝 Contribuciones

Reporta bugs, sugiere features, envía PRs:

- Issues: Describe problema + pasos reproducir
- Features: Explica use case
- PRs: Sigue estilo de código existente

---

## 📞 Soporte

**Documentación**: Revisa `/docs` para respuestas
**Community**: Busca en n8n forum / Airtable community
**Contrato**: Este proyecto es abierto; sé respetuoso

---

## 🙏 Agradecimientos

Construido con:

- **n8n**: Workflow automation
- **Airtable**: Database no-code
- **Xero**: Accounting API
- **OpenAI**: LLM intelligence
- **Twilio**: Communication API
- **La comunidad**: Feedback y contribuciones

---

## 📈 Roadmap 2026

- [ ] Multiidioma completo (ES, EN, PT)
- [ ] Pagos directos en WhatsApp (Stripe)
- [ ] Mobile app de propietarios
- [ ] Video calls en WhatsApp
- [ ] Análisis predictivo (inquilinos riesgosos)
- [ ] Marketplace de servicios (plomería, etc.)

---

## 🎯 Tu Siguiente Acción

**→ Lee [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) ahora**

Tendrás tu plataforma funcionando en **30-45 minutos**.

---

**¡Feliz administración de propiedades! 🏠✨**

v1.0 - Marzo 2026
