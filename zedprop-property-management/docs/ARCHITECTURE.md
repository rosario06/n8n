# Arquitectura Técnica - ZedProp

## 🏗️ Visión General de la Plataforma

```
                            🌐 WhatsApp
                              │
                              │ HTTP POST
                              ▼
                    ┌──────────────────────┐
                    │   n8n Webhook Node   │
                    │  (Recibe mensajes)   │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼────────────┐
                    │  Smart Router (JS)    │
                    │  Identifica usuario   │
                    └──────────┬────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │  Propietario │      │  Inquilino   │      │   Público    │
  │   Workflow   │      │   Workflow   │      │   Workflow   │
  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
  │  Airtable    │      │    Xero      │      │  GPT-4o      │
  │  (Datos)     │      │  (Contable)  │      │  (IA)        │
  └──────────────┘      └──────────────┘      └──────────────┘
```

---

## 🔄 Flujo Principal Detallado

### 1. Ingreso de Mensaje

**Trigger**: POST a `https://tu-n8n.com/webhook/zedprop`

```json
{
  "messages": [
    {
      "from": "+1234567890",
      "body": "Hola, quiero mi contrato de alquiler",
      "type": "text",
      "timestamp": 1234567890
    }
  ]
}
```

### 2. Identificación de Usuario (Smart Router)

El workflow ejecuta:

```javascript
// Node: Code - Identify User
const phone = $input.first().json.messages[0].from;
const airtableQuery = ... // Query Airtable

if (ownerPhones.includes(phone)) {
  return { role: 'owner', id: ownerId, name: ownerName };
}
if (tenantPhones.includes(phone)) {
  return { role: 'tenant', id: tenantId, property: propertyId };
}
return { role: 'unknown', phone };
```

### 3. Enrutamiento Dinámico

Dependiendo del rol:

**OWNER Menu:**

```
1️⃣ Crear propiedad nueva
2️⃣ Ver mis inquilinos
3️⃣ Reportes financieros
4️⃣ Gestionar pagos
5️⃣ Configurar notificaciones
```

**TENANT Menu:**

```
1️⃣ Descargar contrato
2️⃣ Pagar renta
3️⃣ Reportar daños
4️⃣ Ver factura
5️⃣ Chat con soporte
6️⃣ Study Buddy (IA)
```

**PUBLIC Menu:**

```
ℹ️ Información sobre propiedades
📝 Solicitar alquiler
💬 Contactar soporte
```

### 4. Procesamiento de Solicitud

Ejemplo: **"Quiero mi contrato"**

```
Tenant envía mensaje
  ↓
Smart Router → Role: tenant
  ↓
Extract tenant_id, property_id
  ↓
Query Airtable [Contracts table]
  ↓ (Fetch contract data)
  ↓
PDF Generator Node:
  - Carga template HTML
  - Inyecta variables:
    * Tenant name, ID
    * Property address
    * Lease terms, dates
    * Owner signature (si está)
  - Renderiza PDF
  - Sube a servidor temporal
  ↓
Send WhatsApp message con link
  ↓
Log en Airtable [Audit trail]
```

**Tiempo estimado:** 2-3 segundos ✅

### 5. Sincronización Contable (Xero)

Flujo de **pago de renta**:

```
Tenant: "Pagar $500 renta"
  ↓
Validate payment:
  - ¿Amount correcto?
  - ¿Property válida?
  - ¿Tenant activo?
  ↓ (Si todo OK)
  ↓
Create Invoice en Xero:
  - Contact: Tenant
  - Amount: $500
  - Description: "Rent for [Property]"
  - Date: Today
  - Status: DRAFT (o AUTHORISED)
  ↓
Update Airtable:
  - Mark payment as PENDING
  - Xero Invoice ID (link)
  - Payment deadline
  ↓
Send confirmation:
  "✅ Factura $500 creada. Xero ref: [ID]"
  ↓
Notify Owner:
  "Nuevo pago registrado de [Tenant] - $500"
```

### 6. Integración IA (Study Buddy)

Cuando tenant activa:

```
Tenant: "¿Cómo resuelvo una integral?"
  ↓
Smart Router → Role: tenant
  ↓
Extract previous messages (context)
  ↓
Build prompt para GPT-4o:

  System: "Eres un tutor amable. Explica
           conceptos de forma clara y paso
           a paso. Máximo 3 párrafos."

  User: "¿Cómo resuelvo una integral?"
  ↓
Call OpenAI API
  ↓
Stream response:
  "Una integral es el proceso opuesto
   a la derivada. Aquí te muestro paso
   a paso cómo resolver este tipo..."
  ↓
Send response a WhatsApp
  ↓
log interaction en Airtable
```

---

## 📊 Modelos de Datos (Airtable)

### Table: Properties

```
| ID | Name | Address | Type | Owner | Monthly Rent | Status |
|----+------+---------+------+-------+--------------+--------|
| P1 | College Apt 101 | 123 Main St | Student Housing | O1 | $1200 | Active |
```

### Table: Tenants

```
| ID | Name | Phone | Email | Property | Check-in | Check-out | Contract URL |
|----+------+-------+-------+----------+----------+-----------+--------------|
| T1 | John Doe | +1234... | john@... | P1 | 2025-09-01 | 2026-05-31 | [PDF link] |
```

### Table: Payments

```
| ID | Tenant | Property | Amount | Due Date | Status | Xero Ref | Created |
|----+--------+----------+--------+----------+--------+---------+---------|
| PY1| T1 | P1 | $1200 | 2026-03-05 | PENDING | INV-001 | 2026-02-20 |
```

### Table: Messages (Audit Log)

```
| ID | From | Type | Message | Response | Status | Timestamp |
|----|------|------|---------|----------|--------|-----------|
| M1 | T1 | contract_request | "Send contract" | PDF link | SUCCESS | [ts] |
```

### Table: Templates

```
| ID | Name | Type | HTML Content | Last Updated |
|----|------|------|--------------|--------------|
| TP1| Contract v1 | PDF | [HTML template] | 2026-03-01 |
```

---

## 🔐 Seguridad & Validación

### 1. Autenticación de Entrada

```javascript
// Verificar token webhook
const webhookToken = headers["x-webhook-token"];
if (webhookToken !== process.env.WEBHOOK_SECRET) {
  return { error: "Unauthorized", status: 401 };
}
```

### 2. Validación de Usuario

```javascript
// Número debe estar en base
if (!validNumbers.includes(phone)) {
  return createPublicResponse(phone);
  // Evita revelación de info privada
}
```

### 3. Rate Limiting

```javascript
// Max 20 requests/hora por usuario
const recentCalls = await checkAirtableLog(phone, "1hour");
if (recentCalls >= 20) {
  return { message: "Límite de solicitudes alcanzado" };
}
```

### 4. Validación de Datos

```javascript
// Before payment sync
if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
if (!validPropertyId.includes(propertyId)) throw new Error("Invalid property");
```

---

## 💾 Almacenamiento Temporal (PDFs)

### Opción 1: AWS S3 (Recomendado para escala)

```
PDF generado
  ↓
Sube a S3
  ↓
Genera presigned URL (válida 24h)
  ↓
Send URL a WhatsApp
  ↓
Auto-delete después de 24h
```

### Opción 2: Google Drive

```
PDF → Google Drive folder
  → Share link público
  → Send a WhatsApp
```

### Opción 3: Servidor local n8n

```
PDF → Carpeta /data/pdfs
  → serve vía HTTP
  → Limited a mensajes recientes
```

---

## 🚀 Flujos de Trabajo en n8n (Subgrafos)

### Subworkflow 1: Smart Router

**Entrada**: Phone number + Message  
**Salida**: User role, ID, permissions  
**Nodos**: ~8

### Subworkflow 2: PDF Generator

**Entrada**: Template name, data object  
**Salida**: PDF binary + URL  
**Nodos**: ~12

### Subworkflow 3: Xero Sync

**Entrada**: Payment data (amount, tenant, date)  
**Salida**: Xero invoice ID + confirmation  
**Nodos**: ~15

### Subworkflow 4: AI Companion

**Entrada**: User message + conversation history  
**Salida**: GPT-4o response  
**Nodos**: ~6

### Main Workflow

**Conecta todos los subgrafos**  
**Total: 100+ nodos** ✅

---

## 📈 Escalabilidad

### Limite Actual (Sin optimización)

- ~ 100 req/min
- ~1000 mensajes/día
- 5-10 segundos por solicitud compleja

### Con Optimizaciones

- **Caché de Airtable**: Local en memoria
- **Queue de pagos**: Procesa en background
- **Async PDF generation**: No bloquea webhook
- **Rate limiting**: 50 solicitudes concurrentes

Resultado:

- **1000+ req/min**
- **50,000+ mensajes/día**
- **<2s por solicitud**

---

## 🔗 Integraciones Externas

| API          | Uso          | Endpoint              | Auth          |
| ------------ | ------------ | --------------------- | ------------- |
| **Airtable** | CRUD datos   | `api.airtable.com/v0` | Bearer token  |
| **Xero**     | Contabilidad | `/api.xro/2.0`        | OAuth2        |
| **OpenAI**   | IA           | `api.openai.com/v1`   | Bearer token  |
| **Twilio**   | WhatsApp     | `/2010-04-01`         | Auth header   |
| **AWS S3**   | PDFs         | `s3.amazonaws.com`    | AWS Signature |

---

## 🛠️ Troubleshooting

### Problema: PDF tarda mucho

**Solución**:

- Caché de templates en memoria
- Pre-compile frente de HTML
- Usar headless browser vs pdf-lib

### Problema: Webhooks perdidos

**Solución**:

- Guardar en cola (Airtable/DB)
- Retry logic automático
- Ack webhook inmediatamente

### Problema: Rate limit Xero

**Solución**:

- Queue de pagos
- Sync nocturno en batch
- Error handling + retries

---

## 📊 Monitoreo

### Métricas Clave

- Tiempo promedio respuesta webhook
- Tasa de error por endpoint
- Uso de quota APIs externas
- Actividad por usuario/rol

### Logging

```javascript
// Cada operación se loguea
await airtable.log({
  timestamp: now(),
  user: phone,
  action: "payment_created",
  status: "success",
  metadata: { ... }
});
```

---

**Siguiente**: Ve a [USER_FLOWS.md](USER_FLOWS.md) para flujos concretos por usuario.
