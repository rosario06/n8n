# Xero Integration Setup Guide

## 📊 ¿Por Qué Xero?

- **Sincronización automática** de pagos de renta → facturas
- **Reportes financieros** en tiempo real
- **Gestión de flujo de caja** simple
- **Integración** con banca (algunos países)
- **Alternativa** a contadores manuales (costo: desde $15/mes)

---

## 🔐 Crear Aplicación Xero

### Paso 1: Registrarse en Xero

1. Ve a xero.com
2. Crea cuenta de prueba (30 días gratis)
3. Verifica email

### Paso 2: Acceder Xero Developer

1. Ve a developer.xero.com
2. Login con tu cuenta Xero
3. Click "My Apps" → "Create an app"

### Paso 3: Configurar Aplicación

```
App Name: ZedProp Property Manager
App Type: Web app
Integration Type: Choose from the following:
  ✅ OAuth 2.0 (recomendado)

Redirect URLs:
  https://your-n8n-instance.com/oauth/xero/callback
```

**Guarda estos valores:**

- Client ID: `xxxxxxxxxxxxxxxxxxxx`
- Client Secret: `yyyyyyyyyyyyyyyyyyyy` (⚠️ SECRET!)
- Redirect URI: `https://your-n8n-instance.com/oauth/xero/callback`

---

## 🔗 OAuth 2.0 Flow en n8n

### Node 1: Xero - Autenticar

```javascript
// En n8n: Connect Xero credential
{
  "credentialType": "xeroOauth2",
  "clientId": "${XERO_CLIENT_ID}",
  "clientSecret": "${XERO_CLIENT_SECRET}",
  "redirectUrl": "https://your-n8n.com/oauth/xero/callback"
}

// Primera conexión:
// 1. n8n redirige a xero.com/identity/connect
// 2. Usuario apruba acceso
// 3. Xero devuelve código
// 4. n8n intercambia por access_token
// 5. Token se guarda en secreto
```

### Node 2: Crear Contacto (Inquilino)

```json
{
  "method": "POST",
  "endpoint": "/api.xro/2.0/Contacts",
  "body": {
    "Contacts": [
      {
        "Name": "John Doe",
        "EmailAddress": "john@example.com",
        "Phones": [
          {
            "PhoneType": "MOBILE",
            "PhoneNumber": "+1-555-0123"
          }
        ],
        "Addresses": [
          {
            "AddressType": "STREET",
            "Street": "123 Main St",
            "City": "Boston"
          }
        ]
      }
    ]
  }
}
```

Como respuesta obtienes: `ContactID`

### Node 3: Crear Invoice (Factura de Renta)

```json
{
  "method": "POST",
  "endpoint": "/api.xro/2.0/Invoices",
  "body": {
    "Invoices": [
      {
        "Type": "ACCREC", // Accounts Receivable
        "Contact": {
          "ContactID": "${contactId}" // Del paso anterior
        },
        "InvoiceNumber": "RENT-2026-03-001",
        "Description": "Monthly Rent Payment",
        "DueDate": "2026-03-05",
        "LineItems": [
          {
            "Description": "Rent for 123 Main St - March 2026",
            "Quantity": 1,
            "UnitAmount": 1200,
            "AccountCode": "200" // Accounts Receivable
          }
        ],
        "Status": "AUTHORISED" // Inmediatamente aprobado
      }
    ]
  }
}
```

Como respuesta: `InvoiceID`

---

## 💰 Flujo de Pago de Renta → Xero

```
Tenant: "Quiero pagar mi renta"
  ↓
n8n valida pago (Airtable)
  ↓
Crea Invoice en Xero (paso 3)
  ↓
Obtiene InvoiceID
  ↓
Crea PaymentItem en Xero (pago aplicado)
  ↓
Invoice status → "SUBMITTED" (pagado)
  ↓
Actualiza Airtable (Payment → status: "PAID")
  ↓
Notifica Propietario: "Pago recibido de $1200"
```

---

## 📋 Cuentas Contables (Chart of Accounts)

Antes de crear invoices, necesitas saber los **código de cuentas**:

Ve a Xero → Settings → Chart of Accounts

**Cuentas Recomendadas:**

```
200  - Accounts Receivable (default)
400  - Income / Rental Income
401  - Late Payment Fees
500  - Repairs & Maintenance
510  - Utilities
520  - Property Tax
530  - Insurance
840  - Bank Account (para pinta de pagos)
```

En tu `config/.env`:

```
# Códigos de cuento Xero
XERO_ACCOUNT_RENTAL_INCOME=400
XERO_ACCOUNT_RECEIVABLE=200
XERO_ACCOUNT_BANK=840
XERO_ACCOUNT_MAINTENANCE=500
```

---

## 📈 Reportes desde Xero

### Ejemplo 1: Ver Invoices Pendientes

```javascript
// Node: HTTP Request
{
  "method": "GET",
  "url": "https://api.xero.com/api.xro/2.0/Invoices",
  "params": {
    "where": "Status==\"SUBMITTED\" AND Type==\"ACCREC\"",
    "order": "DueDate ASC"
  },
  "headers": {
    "Authorization": "Bearer ${access_token}"
  }
}
```

### Ejemplo 2: Reporte de Ingresos

```javascript
{
  "method": "GET",
  "url": "https://api.xero.com/api.xro/2.0/TrackingCategories",
  // Usa Reports API para más complejidad
}
```

### Ejemplo 3: Sincronizar Pagos Recibidos

```javascript
// Cuando Propietario recibe $$$, log en Xero

// n8n recibe pago
  ↓
// Crea PaymentItem asociado a Invoice
  ↓
// Marca Invoice como recibido
  ↓
// Xero calcula automáticamente flujo de caja
```

---

## 🔍 Verificar Conexión

### Test 1: Obtener Tenant

```bash
curl -H "Authorization: Bearer ACCESS_TOKEN" \
  https://api.xero.com/api.xro/2.0/Contacts
```

Deberías ver lista de contactos

### Test 2: Crear Contacto Test

```json
POST /api.xro/2.0/Contacts
{
  "Contacts": [{
    "Name": "Test Tenant"
  }]
}
```

### Test 3: Crear Invoice Test

```json
POST /api.xro/2.0/Invoices
{
  "Invoices": [{
    "Type": "ACCREC",
    "Contact": { "ContactID": "test-id" },
    "DueDate": "2026-04-01",
    "LineItems": [{
      "Description": "Test",
      "Quantity": 1,
      "UnitAmount": 100
    }]
  }]
}
```

---

## ⚠️ Errores Comunes

| Error                  | Causa                 | Solución                            |
| ---------------------- | --------------------- | ----------------------------------- |
| "Invalid ContactID"    | Contacto no existe    | Crear contacto primero              |
| "OAuth token expired"  | Token > 30 días viejo | Refresh token automático            |
| "Invalid Contact"      | Datos faltantes       | Asegurar Name + EmailAddress        |
| "Status value invalid" | Typo en status        | Usar "AUTHORISED", "SUBMITTED", etc |
| "Empty LineItems"      | Invoice sin items     | Agregar ≥1 LineItem                 |

---

## 🎯 Casos de Uso ZedProp en Xero

### Caso 1: Gestión de Propiedades Múltiples

```
Cada Propietario tiene:
  ├─ Contacto en Xero (puede ser empresa)
  ├─ Multiple propiedades
  └─ Cada inquilino = Contacto en Xero

ZedProp trackea que inquilino vive en qué propiedad
Xero solo ve contactos e invoices
```

### Caso 2: Reportes de Ingresos por Propiedad

```
n8n puede agrupar invoices por:
  ├─ Propiedad (incluir en descripción invoice)
  ├─ Período (mes/trimestre/año)
  └─ Propietario

Luego exporta CSV para análisis
```

### Caso 3: Automatización de Cobranza

```
Recuerdo automático a Inquilino:
  3 días antes vencimiento → WhatsApp
  1 día después vencimiento → WhatsApp + email
  3 días después → escalación a Propietario

Xero calcula automáticamente atrasos
```

---

## 💳 Alternativas a Xero

Si no quieres usar Xero:

### Opción 1: QuickBooks Online

- Similar a Xero
- Más caro (desde $15/mes)
- Excelente en US

### Opción 2: Wave (GRATIS)

- Invoicing gratuito
- Banca integrada (US)
- Menos features
- ✅ Alternativa buena para LATAM

### Opción 3: Odoo (Open Source)

- 100% gratis
- Deployable en tu servidor
- Más complejo de setup

### Opción 4: Spreadsheet Manual

- Google Sheets / Excel
- ✅ Más simple para startups
- Sin features de cobranza automática

Para ZedProp: **Recomendamos Xero o Wave**

---

## 🚀 Deployment

1. **Desarrollo**: Usa Xero Sandbox (gratis, datos falsos)
2. **Producción**: Conecta Xero real

En n8n:

```javascript
// En Environment
NODE_ENV = production;

// Solo en producción
XERO_API_URL = "https://api.xero.com"; // Real
// No usar sandbox URLs
```

---

## ✅ Checklist Xero

- [ ] Cuenta Xero creada
- [ ] App registrada en Xero Developer
- [ ] Client ID y Secret guardados en `.env`
- [ ] Redirect URI configurada
- [ ] Chart of Accounts revisado
- [ ] Códigos de cuenta guardados en config
- [ ] n8n conectado a Xero (OAuth test)
- [ ] Test invoice creada y verificada
- [ ] Pagos sincronizados correctamente
- [ ] Reportes funcionar

---

**Siguiente**: Ve a [SETUP_GUIDE.md](../docs/SETUP_GUIDE.md) para configuración completa.
