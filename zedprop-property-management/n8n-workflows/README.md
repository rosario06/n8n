# n8n Workflows - ZedProp

## 📁 Estructura de Workflows

Este directorio contiene todos los workflows n8n para ZedProp:

```
n8n-workflows/
├── README.md (este archivo)
├── main-webhook-handler.json      # Flujo principal (~100 nodos)
├── sub-workflows/
│   ├── smart-routing.json         # Enrutamiento inteligente
│   ├── pdf-generator.json         # Generador dinámico de PDFs
│   ├── xero-sync.json             # Sincronización contable
│   └── ai-companion.json          # Asistente de IA
├── examples/
│   ├── rental-payment.json        # Ejemplo: procesar pago
│   └── contract-request.json      # Ejemplo: solicitar contrato
└── templates/
    └── [future workflow templates]
```

---

## 🚀 Importar Workflows en n8n

### Opción 1: Via UI

1. Abre n8n → "Create Workflow"
2. Click ⋯ (menu) → "Download"
3. Selectiona JSON `main-webhook-handler.json`
4. El workflow se importa con estructura completa

### Opción 2: Via API

```bash
curl -X POST https://your-n8n/api/v1/workflows/import \
  -H "X-N8N-API-KEY: your_api_key" \
  -H "Content-Type: application/json" \
  -d @main-webhook-handler.json
```

---

## 📝 Descripción de Workflows

### 1. Main Webhook Handler (Principal)

**Archivo**: `main-webhook-handler.json`  
**Propósito**: Recibe TODOS los mensajes WhatsApp y enruta  
**Nodos**: ~100+  
**Flujo**:

```
1. Webhook → Recibe mensaje
2. Smart Router → Identifica usuario
3. Menu Dispatcher → Decide qué hacer
4. Execute Sub-workflow → Procesa solicitud
5. Send Response → Envía resultado
6. Audit Log → Registra interacción
```

**Credenciales Necesarias**:

- ✅ Twilio/WhatsApp
- ✅ Airtable
- ✅ OpenAI (GPT-4o)
- ✅ Xero

---

### 2. Smart Router (Sub-workflow)

**Archivo**: `sub-workflows/smart-routing.json`  
**Propósito**: Identifica quién escribe (propietario/inquilino/público)  
**Nodos**: ~8  
**Entrada**:

```json
{
  "phone": "+1234567890",
  "message": "Hola, quiero mi contrato"
}
```

**Salida**:

```json
{
  "role": "tenant",
  "userId": "T001",
  "userName": "John Doe",
  "permissions": ["download_contract", "pay_rent", "..."]
}
```

**Lógica**:

1. Query Airtable [Owners] con phone
2. Si existe → Role: owner
3. Else query [Tenants] con phone
4. Si existe → Role: tenant
5. Else → Role: unknown

---

### 3. PDF Generator (Sub-workflow)

**Archivo**: `sub-workflows/pdf-generator.json`  
**Propósito**: Genera PDFs dinámicos (contratos, facturas)  
**Nodos**: ~12  
**Entrada**:

```json
{
  "template": "contract", // o "invoice", "notice"
  "data": {
    "tenant_name": "John Doe",
    "monthly_rent": 1200,
    "start_date": "2025-09-01"
  }
}
```

**Salida**:

```json
{
  "pdf_url": "https://...",
  "file_size": 245000,
  "generation_time_ms": 2800
}
```

**Pasos**:

1. Load template HTML (Airtable)
2. Inject variables con Handlebars
3. Convert HTML → PDF (puppeteer/pdf-lib)
4. Upload a S3/storage
5. Generate presigned URL
6. Return URL públicamente accesible

---

### 4. Xero Sync (Sub-workflow)

**Archivo**: `sub-workflows/xero-sync.json`  
**Propósito**: Sincroniza pagos con contabilidad  
**Nodos**: ~15  
**Entrada**:

```json
{
  "tenant_id": "T001",
  "amount": 1200,
  "payment_method": "whatsapp",
  "property_id": "P001"
}
```

**Salida**:

```json
{
  "invoice_id": "INV-2026-001",
  "status": "AUTHORISED",
  "xero_ref": "https://xero.com/invoices/..."
}
```

**Pasos**:

1. Validate payment (Airtable)
2. Find/create Contact en Xero
3. Create Invoice en Xero
4. Create Payment
5. Update Airtable (linked Xero ID)
6. Send confirmation

---

### 5. AI Companion (Sub-workflow)

**Archivo**: `sub-workflows/ai-companion.json`  
**Propósito**: Chat con GPT-4o para tutoría/preguntas  
**Nodos**: ~6  
**Entrada**:

```json
{
  "message": "¿Cómo resuelvo una integral?",
  "user_id": "T001",
  "context": ["previous message 1", "previous message 2"]
}
```

**Salida**:

```json
{
  "response": "Una integral es...",
  "tokens_used": 156,
  "model": "gpt-4o"
}
```

**Pasos**:

1. Prepare system prompt (del archivo `prompts/`)
2. Include conversation history
3. Call OpenAI API
4. Stream response (opcional)
5. Save interaction en Airtable

---

## 📚 Ejemplos de Workflow

### Ejemplo 1: Solicitar Contrato

**Archivo**: `examples/contract-request.json`

**Flujo**:

```
Tenant: "Quiero mi contrato"
  ↓
Smart Router: "Eres inquilino T001"
  ↓
Query Airtable [Contracts]:
  WHERE tenant_id = "T001"
  ↓
PDF Generator:
  Template: "contract"
  Data: contract_fields
  ↓
PDF → URL
  ↓
Response: "Aquí está tu contrato: [link]"
  ↓
Audit log
```

Este archivo es un template funcional que puedes copiar y personalizar.

---

### Ejemplo 2: Procesar Pago de Renta

**Archivo**: `examples/rental-payment.json`

**Flujo**:

```
Tenant: "Pagar $1200 renta"
  ↓
Smart Router: "Eres inquilino T001 de P001"
  ↓
Validate:
  ✅ T001 existe
  ✅ P001 existe
  ✅ Renta = $1200
  ✓ Tenant activo
  ↓
Xero Sync:
  Create Invoice $1200
  ↓
Airtable:
  Currency Payment status: PENDING
  Xero ref: INV-001
  ↓
Response: "✅ Factura creada. Ref: INV-001"
  ↓
Notify Owner: "Pago $1200 de John Doe"
  ↓
Audit log
```

---

## 🔧 Customización

### Agregar Nuevo Flujo

1. Crea JSON en `sub-workflows/my-workflow.json`
2. Define entrada y salida esperadas
3. Link desde `main-webhook-handler.json`
4. Test en sandbox

### Extender Permiso

En `smart-routing.json`, agregar nueva tabla:

```javascript
// Ejemplo: agregar "contractors"
const contractorLookup = await airtable.query({
  table: "Contractors",
  filterByFormula: `{phone} = '${phone}'`
});

if (contractorLookup) {
  return { role: "contractor", permissions: [...] };
}
```

---

## 📊 Monitoring

Usa el Execution History de n8n para:

- Ver logs de cada ejecución
- Identificar errores
- Medir tiempos de respuesta
- Debuggear lógica

```
n8n → [Cada Workflow] → Executions
  → Clickea ejecución
  → Inspecciona variables en cada nodo
  → Ver logs de error
```

---

## 🚀 Deployment

### En Desarrollo

1. Importa todos los JSONs
2. Conecta credenciales de sandbox
3. Activa webhook en modo test

### En Producción

1. Audit todos los workflows
2. Conecta credenciales reales
3. Configura error handling
4. Activa logs y monitoring
5. Setup backups automáticos

---

## 📝 Próximos Workflows

Futuros templates:

- [ ] Workflow: Reportar Daño Propiedad
- [ ] Workflow: Visualizar Inquilinos Activos
- [ ] Workflow: Enviar Notificación Recordatorio
- [ ] Workflow: Crear Propiedad Nueva
- [ ] Workflow: Export a Excel/Google Sheets

---

**Siguiente**: Ve a [ARCHITECTURE.md](../docs/ARCHITECTURE.md) para detalles técnicos.
