# Airtable Configuration Guide

## 📋 Crear Base en Airtable

### Paso 1: Crear Nueva Base

1. Ve a airtable.com/create
2. Clickea "Create" → "Start from scratch"
3. Nombra tu base: "ZedProp Property Management"
4. Copia el **Base ID** (verás en URL: `https://airtable.com/app[BASE_ID]`)

### Paso 2: Crear Tablas

Airtable te proporciona "Grid" vacío. Crea estas tablas:

#### Tabla 1: Properties

| Campo        | Tipo                     | Requerido       |
| ------------ | ------------------------ | --------------- |
| ID           | Text                     | ✅ Sí (Primary) |
| Name         | Text                     | ✅ Sí           |
| Address      | Text                     | ✅ Sí           |
| City         | Text                     | ✅ Sí           |
| Type         | Select                   | ✅ Sí           |
| Monthly Rent | Currency                 | ✅ Sí           |
| Owner        | Link to Owners           | ✅ Sí           |
| Tenants      | Link to Tenants          | ⭕ Opcional     |
| Status       | Select (Active/Inactive) | ✅ Sí           |
| Created Date | Date                     | ✅ Sí           |

**Opciones Select - Type:**

- Single House
- Apartment
- Studio
- Condo
- Townhouse

**Opciones Select - Status:**

- Active
- Inactive
- Maintenance

#### Tabla 2: Owners

| Campo              | Tipo                   | Requerido       |
| ------------------ | ---------------------- | --------------- |
| ID                 | Text                   | ✅ Sí (Primary) |
| First Name         | Text                   | ✅ Sí           |
| Last Name          | Text                   | ✅ Sí           |
| Email              | Email                  | ✅ Sí           |
| Phone              | Phone Number           | ✅ Sí           |
| WhatsApp Phone     | Text                   | ✅ Sí           |
| Properties         | Link to Properties     | ⭕ Opcional     |
| Xero Contact ID    | Text                   | ⭕ Opcional     |
| Preferred Currency | Select (USD, EUR, etc) | ⭕ Opcional     |
| Created Date       | Date                   | ✅ Sí           |

#### Tabla 3: Tenants

| Campo          | Tipo                              | Requerido       |
| -------------- | --------------------------------- | --------------- |
| ID             | Text                              | ✅ Sí (Primary) |
| First Name     | Text                              | ✅ Sí           |
| Last Name      | Text                              | ✅ Sí           |
| Email          | Email                             | ✅ Sí           |
| Phone          | Phone Number                      | ✅ Sí           |
| WhatsApp Phone | Text                              | ✅ Sí           |
| Property       | Link to Properties                | ✅ Sí           |
| Owner          | Link to Owners                    | ✅ Sí           |
| Check-in Date  | Date                              | ✅ Sí           |
| Check-out Date | Date                              | ⭕ Opcional     |
| Monthly Rent   | Currency                          | ✅ Sí           |
| Status         | Select (Active/Inactive/Departed) | ✅ Sí           |
| Contract URL   | URL                               | ⭕ Opcional     |
| Created Date   | Date                              | ✅ Sí           |

#### Tabla 4: Payments

| Campo           | Tipo                          | Requerido       |
| --------------- | ----------------------------- | --------------- |
| ID              | Text                          | ✅ Sí (Primary) |
| Tenant          | Link to Tenants               | ✅ Sí           |
| Property        | Link to Properties            | ✅ Sí           |
| Owner           | Link to Owners                | ✅ Sí           |
| Amount          | Currency                      | ✅ Sí           |
| Due Date        | Date                          | ✅ Sí           |
| Paid Date       | Date                          | ⭕ Opcional     |
| Status          | Select (Pending/Paid/Overdue) | ✅ Sí           |
| Xero Invoice ID | Text                          | ⭕ Opcional     |
| Created Date    | Date                          | ✅ Sí           |

#### Tabla 5: Contracts

| Campo        | Tipo                            | Requerido       |
| ------------ | ------------------------------- | --------------- |
| ID           | Text                            | ✅ Sí (Primary) |
| Tenant       | Link to Tenants                 | ✅ Sí           |
| Property     | Link to Properties              | ✅ Sí           |
| Start Date   | Date                            | ✅ Sí           |
| End Date     | Date                            | ✅ Sí           |
| Monthly Rent | Currency                        | ✅ Sí           |
| PDF URL      | URL                             | ⭕ Opcional     |
| Status       | Select (Draft/Active/Completed) | ✅ Sí           |
| Created Date | Date                            | ✅ Sí           |

#### Tabla 6: Messages (Audit Log)

| Campo           | Tipo                                         | Requerido       |
| --------------- | -------------------------------------------- | --------------- |
| ID              | Text                                         | ✅ Sí (Primary) |
| From            | Text (Phone)                                 | ✅ Sí           |
| User Type       | Select (Owner/Tenant/Staff/Public)           | ✅ Sí           |
| Message Type    | Select (contract_request/payment/etc)        | ✅ Sí           |
| Message Body    | Long Text                                    | ✅ Sí           |
| Response        | Long Text                                    | ⭕ Opcional     |
| Status          | Select (Pending/Processing/Completed/Failed) | ✅ Sí           |
| Processing Time | Number                                       | ⭕ Opcional     |
| Created Date    | Date                                         | ✅ Sí           |

#### Tabla 7: Issues

| Campo         | Tipo                               | Requerido       |
| ------------- | ---------------------------------- | --------------- |
| ID            | Text                               | ✅ Sí (Primary) |
| Tenant        | Link to Tenants                    | ✅ Sí           |
| Property      | Link to Properties                 | ✅ Sí           |
| Description   | Long Text                          | ✅ Sí           |
| Severity      | Select (Low/Medium/High/Critical)  | ✅ Sí           |
| Category      | Select (Plumbing/Electrical/etc)   | ✅ Sí           |
| Status        | Select (Open/In Progress/Resolved) | ✅ Sí           |
| Created Date  | Date                               | ✅ Sí           |
| Resolved Date | Date                               | ⭕ Opcional     |

#### Tabla 8: DocumentTemplates

| Campo         | Tipo                             | Requerido       |
| ------------- | -------------------------------- | --------------- |
| ID            | Text                             | ✅ Sí (Primary) |
| Name          | Text                             | ✅ Sí           |
| Type          | Select (Contract/Invoice/Notice) | ✅ Sí           |
| HTML Content  | Long Text                        | ✅ Sí           |
| Language      | Select (English/Spanish)         | ✅ Sí           |
| Is Active     | Checkbox                         | ✅ Sí           |
| Created Date  | Date                             | ✅ Sí           |
| Last Modified | Date                             | ✅ Sí           |

---

## 🔑 Generar API Key

### Paso 1: Acceder Token

1. Ve a airtable.com/account/tokens
2. Click "Create new token"

### Paso 2: Configurar Permisos

```
Token Name: "ZedProp n8n Integration"

Scopes Required:
✅ data.records:read
✅ data.records:write
✅ schema.bases:read
✅ webhook:manage

Bases Access:
✅ [Tu base ZedProp]
```

### Paso 3: Copiar y Guardar

1. Copia el token (visible SOLO UNA VEZ)
2. Guarda en `.env` como `AIRTABLE_API_KEY=pat_xxxxx`

---

## 🔗 Configurar en n8n

### Node 1: Airtable - Crear Registro

```json
{
  "nodeType": "Airtable",
  "action": "insert",
  "baseId": "${AIRTABLE_BASE_ID}",
  "table": "Tenants",
  "fields": {
    "ID": "T001",
    "First Name": "John",
    "Last Name": "Doe",
    "Email": "john@example.com",
    "WhatsApp Phone": "+1234567890",
    "Property": ["P001"],
    "Status": "Active",
    "Check-in Date": "2025-09-01",
    "Monthly Rent": 1200,
    "Created Date": "2026-03-06"
  }
}
```

### Node 2: Airtable - Buscar Registro

```json
{
  "nodeType": "Airtable",
  "action": "query",
  "baseId": "${AIRTABLE_BASE_ID}",
  "table": "Tenants",
  "filterByFormula": "{WhatsApp Phone} = '+1234567890'"
}
```

### Node 3: Airtable - Actualizar Registro

```json
{
  "nodeType": "Airtable",
  "action": "update",
  "baseId": "${AIRTABLE_BASE_ID}",
  "table": "Payments",
  "id": "${recordId}",
  "fields": {
    "Status": "Paid",
    "Paid Date": "2026-03-06"
  }
}
```

---

## 📊 Views y Filtros Útiles

### Vista 1: Pagos Pendientes

```
Filter: Status = "Pending" AND Due Date < TODAY()
Sort: Due Date ASC
```

### Vista 2: Inquilinos Activos

```
Filter: Status = "Active"
Sort: Last Name ASC
```

### Vista 3: Propiedades Ocupadas

```
Filter: Status = "Active"
Grouped: By Owner
```

### Vista 4: Mensajes Recientes

```
Sort: Created Date DESC
Limit: 100 records
```

---

## 🔐 Seguridad & Best Practices

### 1. Nunca exponga el API Key

```javascript
// ❌ MALO - API key visible
const key = "pat_xxxxx";

// ✅ BUENO - Usar variable de entorno
const key = process.env.AIRTABLE_API_KEY;
```

### 2. Usa Webhook para actualizaciones en tiempo real

```
En Airtable:
- Automations → Create automation
- When: Record is created/updated
- Then: Send webhook to n8n
```

### 3. Copia de Seguridad Regular

```
Airtable → Share → Download
Exporta CSV mensualmente
```

### 4. Rate Limiting

- Airtable: 5 req/seg máximo
- En n8n: Agregar delay entre requests en loops

```javascript
// En n8n Code node:
if (iterations > 4) {
  await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
}
```

---

## 📈 Sample Data para Testing

### Owner Sample

```json
{
  "ID": "O001",
  "First Name": "Maria",
  "Last Name": "Garcia",
  "Email": "maria@example.com",
  "Phone": "+1-555-0123",
  "WhatsApp Phone": "+15550123",
  "Created Date": "2025-01-01"
}
```

### Property Sample

```json
{
  "ID": "P001",
  "Name": "College Apt 101",
  "Address": "123 Main Street",
  "City": "Boston",
  "Type": "Apartment",
  "Monthly Rent": 1200,
  "Status": "Active",
  "Created Date": "2025-08-15"
}
```

### Tenant Sample

```json
{
  "ID": "T001",
  "First Name": "John",
  "Last Name": "Doe",
  "Email": "john.doe@email.com",
  "WhatsApp Phone": "+15551234",
  "Check-in Date": "2025-09-01",
  "Check-out Date": "2026-05-31",
  "Monthly Rent": 1200,
  "Status": "Active",
  "Created Date": "2025-08-20"
}
```

---

## ✅ Checklist de Setup

- [ ] Base creada en Airtable
- [ ] 8 Tablas creadas con campos correctos
- [ ] API Key generado y guardado en `.env`
- [ ] Links entre tablas configurados
- [ ] Views/filtros creados
- [ ] Datos de testing insertados
- [ ] n8n conectado a Airtable
- [ ] Test query exitoso
- [ ] Logs configurados

---

**Siguiente**: Ve a [SETUP_GUIDE.md](../docs/SETUP_GUIDE.md) para pasos completos.
