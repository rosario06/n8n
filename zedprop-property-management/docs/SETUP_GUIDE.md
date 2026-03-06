# Setup Guide - ZedProp Property Management

Guía paso a paso para instalar y configurar la plataforma completa.

**Tiempo estimado**: 30-45 minutos (sin contar verificación manual)

---

## ✅ Checklist de Requisitos Previos

### Cuentas & Servicios

- [ ] Cuenta n8n (self-hosted o n8n.cloud)
- [ ] Cuenta Airtable (gratuita ok: https://airtable.com/signup)
- [ ] Cuenta Twilio o Meta (WhatsApp API)
- [ ] Cuenta Xero (prueba 30 días: https://xero.com/signup) o Wave
- [ ] Cuenta OpenAI (para GPT-4o: https://platform.openai.com)
- [ ] Cuenta AWS S3 o Google Drive (para PDFs, o servidor local)

### Conocimientos Requeridos

- Básico de n8n (crear workflow, conectar nodos)
- Básico de APIs/webhooks
- Acceso a email de administrador

### Software Local

- Node.js v14+ instalado
- git (opcional, para versionado)
- Terminal/PowerShell

---

## Fase 1: Configurar Airtable (5 min)

### 1.1 Crear Base

1. Ve a https://airtable.com/create
2. Clickea "Start from scratch"
3. Nombra: "ZedProp Property Management"
4. **Copia el Base ID** de la URL
   - URL: `https://airtable.com/app[BASE_ID]`

### 1.2 Crear Tablas

Sigue guía completa en: [integrations/airtable-config.md](integrations/airtable-config.md)

Necesitas crear 8 tablas:

- Properties
- Owners
- Tenants
- Payments
- Contracts
- Messages
- Issues
- DocumentTemplates

**Tips**:

- Usa el JSON `schemas/data-models.json` como referencia
- Copia tipos de campos exactamente como especificado
- Configura Links entre tablas (Property ↔ Tenants, etc.)

### 1.3 Generar API Key

1. Ve a https://airtable.com/account/tokens
2. "Create token"
3. Nombre: "ZedProp n8n"
4. Scopes: data.records:read, data.records:write, schema.bases:read
5. Bases: Selecciona tu base ZedProp
6. **Copia el token** (visible solo 1 vez)

Guarda en `.env`:

```
AIRTABLE_API_KEY=pat_xxxxx
AIRTABLE_BASE_ID=appxxxxx
```

---

## Fase 2: Configurar WhatsApp (10 min)

### Opción A: Twilio (Más fácil, recomendado)

#### 2A.1 Crear Cuenta Twilio

1. Ve a https://www.twilio.com/try-twilio
2. Regístrate con nombre + email
3. Verifica número teléfono
4. Dashboard: Obtiene **Account SID** y **Auth Token**

#### 2A.2 Agregar WhatsApp

1. Twilio Console → Messaging → Try it out
2. Busca "WhatsApp"
3. Selecciona "Join early access"
4. Verifica tu número personal
5. Obtén número Twilio WhatsApp (formato: `whatsapp:+1234567890`)

#### 2A.3 Guardar en .env

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
WHATSAPP_WEBHOOK_SECRET=random_secret_string_min_32_chars
```

#### 2A.4 Configurar Webhook

1. Twilio → Messaging → Settings
2. "When a message comes in" → Webhook URL:
   ```
   https://your-n8n.com/webhook/zedprop-whatsapp
   ```
3. Guarda

**Prueba Rápida**:

```bash
# Envía mensaje de test desde tu celular a número Twilio
# Deberías ver request en n8n ejecutándose
```

---

### Opción B: Meta WhatsApp Business API (Producción)

Sigue guía completa en: [integrations/whatsapp-setup.md](integrations/whatsapp-setup.md)

Requiere:

- Empresa registrada
- Página Facebook
- ID de aplicación Meta
- Revisión de Meta (2-7 días)

**Para este setup inicial, recomendamos Twilio.**

---

## Fase 3: Configurar Contabilidad (5-10 min)

### OPCIÓN A: Google Sheets ⭐ (RECOMENDADO PARA MVP)

**Tiempo: 5 minutos | Costo: GRATIS**

Sigue: [integrations/google-sheets-config.md](integrations/google-sheets-config.md)

#### A.1 Crear Google Sheet

1. Ve a https://sheets.google.com
2. "Nueva hoja de cálculo"
3. Nombra: "ZedProp - Pagos y Facturas"

#### A.2 Crear Tablas

Crea 3 pestañas:

- **Payments**: Date, Tenant, Property, Owner, Amount, Status, Month, Notes
- **Summary**: Totales mensuales con fórmulas (=SUM, =COUNTIF)
- **Properties**: Lista propiedades con info

#### A.3 Obtener SHEET_ID

La URL se ve así:

```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```

Copia SHEET_ID y guarda en `.env`:

```
GOOGLE_SHEETS_ID=1a2b3c4d5e6f...
```

#### A.4 Conectar en n8n

1. n8n Settings → Credentials
2. "Google Sheets"
3. Click "Connect"
4. Autoriza tu cuenta Google

**LISTO.** Google Sheets conectado. Crear gráficos en siguiente paso.

---

### OPCIÓN B: Xero (PROFESIONAL)

**Tiempo: 10 minutos | Costo: $15/mes (después de 30 días prueba)**

Sigue guía completa: [integrations/xero-config.md](integrations/xero-config.md)

#### B.1 Crear Cuenta Xero

1. Ve a https://www.xero.com/signup
2. 30 días gratis
3. Verifica email

#### B.2 Registrar Aplicación

1. developer.xero.com
2. "My Apps" → "Create an app"
3. Name: "ZedProp Property Manager"
4. Type: "Web app"
5. Redirect URI: `https://your-n8n.com/oauth/xero/callback`

**Copia**:

```
XERO_CLIENT_ID=xxxxxx
XERO_CLIENT_SECRET=yyyyyy
```

#### B.3 Revisar Chart of Accounts

1. Xero Settings → Chart of Accounts
2. Nota códigos:
   - Accounts Receivable (ej: 200)
   - Rental Income (ej: 400)
   - Bank Account (ej: 840)

Guarda en `.env`

---

### ¿Cuál Elegir?

| Aspecto         | Google Sheets | Xero        |
| --------------- | ------------- | ----------- |
| **Costo**       | GRATIS        | $15/mes     |
| **Setup**       | 5 min         | 10 min      |
| **Reportes**    | Manuales      | Automáticos |
| **Gráficos**    | ✅ Sí         | ✅ Sí       |
| **Para MVP**    | ⭐ IDEAL      | Overkill    |
| **Para Escala** | No            | ⭐ Mejor    |

**RECOMENDACIÓN**: Usa Google Sheets ahora. Migraa Xero cuando tengas 20+ propiedades.

---

## Fase 4: Configurar OpenAI (2 min)

### 4.1 Crear API Key

1. Ve a https://platform.openai.com/api-keys
2. "Create new secret key"
3. Nombra: "zedprop"
4. **Copia el key** (visible solo 1 vez)

Guarda en `.env`:

```
OPENAI_API_KEY=sk-xxxxxx
OPENAI_MODEL=gpt-4o
```

### 4.2 Setup Facturación

1. Billing → Overview
2. Agrega método de pago
3. Set usage limits (ej: $10/mes para empezar)

---

## Fase 5: Configurar n8n (5 min)

### 5.1 Crear Workflow Base

1. n8n → "Create Workflow" (vacío)
2. Nombra: "ZedProp-Main"
3. Agregamos credenciales

### 5.2 Agregar Credenciales

En n8n → Settings → Credentials, crea:

#### Twilio

```
Name: Twilio-ZedProp
Account SID: [desde .env]
Auth Token: [desde .env]
```

#### Airtable

```
Name: Airtable-ZedProp
API Key: [desde .env]
```

#### Xero

```
Name: Xero-ZedProp
Client ID: [XERO_CLIENT_ID]
Client Secret: [XERO_CLIENT_SECRET]
```

#### OpenAI

```
Name: OpenAI-ZedProp
API Key: [OPENAI_API_KEY]
```

### 5.3 Configurar URL Base n8n

1. Settings → Workflow
2. "Webhook URL" debe ser accesible:
   - Local: `http://localhost:5678`
   - Producción: `https://tu-n8n.com`
   - Ngrok test: `https://abc123.ngrok.io`

**IMPORTANTE**: Este debe ser HTTPS para Twilio/Meta webhooks

---

## Fase 6: Arquitectura n8n (10-15 min)

### 6.1 Estructura de Workflow

Tu `main-webhook-handler.json` tendrá esta estructura:

```
┌─ Webhook (Recibe mensaje)
├─ Code: Parse entrada
├─ Airtable: Find user
├─ Code: Smart Router
├─ Switch Node:
│  ├─ Case "owner" → Execute: Owner Workflow
│  ├─ Case "tenant" → Execute: Tenant Workflow
│  └─ Case "unknown" → Execute: Public Workflow
├─ Code: Format response
├─ Twilio: Send message
└─ Airtable: Log message
```

### 6.2 Nodos Esenciales

**Node 1: Webhook Listener**

```json
{
  "node": "Webhook",
  "method": "POST",
  "path": "zedprop-whatsapp",
  "responseCode": 200
}
```

**Node 2: Parse Input**

```javascript
// Code node
const { messages } = $input.first().json;
const [msg] = messages;
return {
  phone: msg.from.replace("whatsapp:", "").replace("+", ""),
  body: msg.body,
  timestamp: msg.timestamp,
};
```

**Node 3: Query Airtable (Buscar usuario)**

```json
{
  "node": "Airtable",
  "action": "select",
  "baseId": "{{ $env.AIRTABLE_BASE_ID }}",
  "table": "Owners",
  "filterByFormula": "{ WhatsApp Phone} = '{{ $node.Parse.json.phone }}'",
  "maxRecords": 1
}
```

**Node 4: Smart Router** (Code node)

```javascript
const ownerQuery = $input.first().json.records;
const tenantQuery = $input.previous(1).json.records; // de query anterior

if (ownerQuery.length > 0) {
  return {
    role: "owner",
    userId: ownerQuery[0].fields.ID,
    userName: ownerQuery[0].fields.Name,
  };
}
if (tenantQuery.length > 0) {
  return {
    role: "tenant",
    userId: tenantQuery[0].fields.ID,
  };
}
return { role: "unknown" };
```

**Node 5: Switch / Route**

```
- IF $node.smartRouter.json.role = "owner"
  THEN execute sub-workflow: Owner
- IF $node.smartRouter.json.role = "tenant"
  THEN execute sub-workflow: Tenant
- ELSE execute: Public Menu
```

**Node 6: Send Response (Twilio)**

```json
{
  "node": "Twilio",
  "action": "sendMessage",
  "from": "{{ $env.TWILIO_WHATSAPP_NUMBER }}",
  "to": "whatsapp:+{{ $node.Parse.json.phone }}",
  "body": "{{ $node.routeResponse.json.message }}"
}
```

**Node 7: Log to Airtable**

```json
{
  "node": "Airtable",
  "action": "create",
  "baseId": "{{ $env.AIRTABLE_BASE_ID }}",
  "table": "Messages",
  "fields": {
    "From": "{{ $node.Parse.json.phone }}",
    "Message Body": "{{ $node.Parse.json.body }}",
    "Response": "{{ $node.routeResponse.json.message }}",
    "Status": "Completed",
    "Created Date": "{{ now() }}"
  }
}
```

---

## Fase 7: Sub-workflows (10-15 min)

### Sub-workflow 1: Smart Router

Crea workflow separado: "Sub-SmartRouter"

- **Entrada**: phone number
- **Salida**: { role, userId, permissions }

### Sub-workflow 2: Tenant Menu

Crea workflow: "Sub-TenantMenu"

- Muestra opciones: Contrato, Pagar, Reportar, Chat IA
- Procesa selección

### Sub-workflow 3: Contract Generator

Crea workflow: "Sub-ContractPDF"

- Entrada: { tenant_id, property_id }
- Output: PDF URL

### Sub-workflow 4: Xero Sync (Pago)

Crea workflow: "Sub-XeroPayment"

- Entrada: { tenant_id, amount }
- Output: { invoice_id, status }

### Sub-workflow 5: AI Chat

Crea workflow: "Sub-AIChat"

- Entrada: { user_message, user_id }
- Output: GPT-4o response

---

## Fase 8: Cargar Datos de Prueba (5 min)

### 8.1 Propietario Test

En Airtable, tabla "Owners", agrega:

```
ID: O001
Name: Maria Garcia
Email: maria@example.com
Phone: +1-555-0100
WhatsApp Phone: +15550100
```

### 8.2 Propiedad Test

Tabla "Properties":

```
ID: P001
Name: College Apt 101
Address: 123 Main St
City: Boston
Type: Apartment
Monthly Rent: 1200
Owner: [Link a O001]
Status: Active
```

### 8.3 Inquilino Test

Tabla "Tenants":

```
ID: T001
Name: John Doe
Email: john@example.com
WhatsApp Phone: +15550123
Property: [Link a P001]
Check-in Date: 2025-09-01
Monthly Rent: 1200
Status: Active
```

---

## Fase 9: Test Completo (5 min)

### 9.1 Envía Test Mensaje

Desde tu celular (usando número Twilio), envía WhatsApp:

```
Hola, quiero mi contrato
```

### 9.2 Verifica Ejecución

En n8n:

1. Abre workflow "ZedProp-Main"
2. Clickea "Executions"
3. Deberías ver ejecución exitosa
4. Inspecciona cada nodo (variables)

### 9.3 Verifica Response

Deberías recibir mensaje de respuesta:

```
Menu de Inquilino:
1️⃣ Descargar contrato
2️⃣ Pagar renta
3️⃣ Reportar daño
4️⃣ Chat Study Buddy
```

### 9.4 Verifica Logs

En Airtable, tabla "Messages":

- Nueva fila creada
- From: tu número
- Body: "Hola, quiero mi contrato"
- Status: Completed

---

## Fase 10: Deploy a Producción (5 min)

### 10.1 Variables de Entorno

```bash
# Copia en producción:
cp .env ../production/.env

# Verifica no contiene datos sensibles expuestos
grep -E "(SECRET|KEY|TOKEN)" .env
```

### 10.2 Configurar HTTPS

- n8n debe correr en HTTPS
- SSL certificate válido
- Verify Token en webhooks

### 10.3 Activar Workflow

En n8n:

1. Abre "ZedProp-Main"
2. Clickea "Activate" (ON)
3. Webhook está vivo

### 10.4 Monitoreo

```
n8n → Workflow → Executions
Ver logs en tiempo real
Setup alerts si necesario
```

---

## 📋 Checklist Final

- [ ] Airtable base creada con 8 tablas
- [ ] Twilio/WhatsApp conectado y webhook funcionando
- [ ] Google Sheets creado con tablas (Payments, Summary, Properties)
- [ ] OpenAI API key activa y con facturación
- [ ] n8n todos los workflows importados
- [ ] Credenciales n8n configuradas (Twilio, Airtable, Google Sheets, OpenAI)
- [ ] Test message enviado → respuesta recibida
- [ ] Audit log en Airtable funciona
- [ ] Datos nuevos aparecen en Google Sheets
- [ ] Sub-workflows creados y linked
- [ ] HTTPS habilitado
- [ ] Workflow "ZedProp-Main" Activado
- [ ] Notificaciones configuradas (correo/Slack)
- [ ] Backups automáticos de Airtable y Google Drive

---

## ⏱️ Tiempo Total de Setup

Con **Google Sheets**: **~25 minutos**

```
├─ Fase 1 (Airtable): 5 min
├─ Fase 2 (WhatsApp): 10 min
├─ Fase 3 (Google Sheets): 5 min
├─ Fase 4 (OpenAI): 2 min
├─ Fase 5 (n8n Workflows): 10 min
└─ Fase 6-9 (Config + Test): 10 min
```

Con **Xero**: ~45 minutos (porque Xero requiere más pasos)

**Mi recomendación**: Usa Google Sheets ahora, migra a Xero/Wave después si necesitas.

Ver: [ACCOUNTING_OPTIONS.md](../ACCOUNTING_OPTIONS.md) para decisión

---

## 🆘 Troubleshooting

### Problema: "Webhook no recibe mensajes"

**Solución**:

1. Verifica URL webhook en Twilio/Meta
2. Asegúrate n8n está Activated
3. Comprueba logs n8n (ver errores)
4. Verifica HTTPS está activo

### Problema: "Airtable query devuelve vacío"

**Solución**:

1. Verifica datos existen en tabla
2. Verifica formula filter está correcta
3. Compara campos exacts (case-sensitive)
4. Usa Airtable API explorer para test

### Problema: "Xero sync falla"

**Solución**:

1. Valida OAuth token vigente
2. Verifica Contact existe en Xero
3. Verifica Account codes válidos
4. Chequea logs Xero API

### Problema: "GPT-4o no responde"

**Solución**:

1. Verifica API key vigente
2. Chequea facturación OpenAI
3. Verifica `max_tokens` no es muy bajo
4. Revisa rate limiting

---

## 📚 Siguiente Pasos

1. **Personalizar**: Ajusta prompts en `prompts/` a tu negocio
2. **Agregar Features**: Sigue ejemplos en `n8n-workflows/examples/`
3. **Escalar**: Si necesitas >100 req/min, considera optimizaciones
4. **Backup**: Exporta workflows n8n semanalmente
5. **Documentar**: Agrega tus propias notas a `.env.example`

---

## 📞 Soporte

- n8n docs: https://docs.n8n.io
- Airtable API: https://airtable.com/api
- Xero API: https://developer.xero.com
- Twilio: https://www.twilio.com/docs
- OpenAI: https://platform.openai.com/docs

---

**¡Estás listo para correr ZedProp! 🚀**

Si encuentras problemas, revisa [ARCHITECTURE.md](docs/ARCHITECTURE.md) o abre un issue.
