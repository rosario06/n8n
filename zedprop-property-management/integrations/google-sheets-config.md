# Google Sheets Configuration Guide

## 📊 Usar Google Sheets como Contabilidad (¡GRATIS!)

Esta es la opción **más rápida y barata** para reemplazar Xero.

---

## 🚀 Ventajas Sistema Google Sheets

✅ **100% GRATIS** (Google Drive es gratuito)  
✅ **Setup en 5 minutos** (vs 15 min Xero)  
✅ **Compatible con n8n** (Google Sheets connector)  
✅ **Gráficos automáticos** (visualizar ingresos)  
✅ **Colaborativo** (múltiples usuarios)  
✅ **Acceso desde cualquier dispositivo**  
✅ **Backup automático** (en Google Drive)

---

## 📋 Paso 1: Crear Google Sheet

### 1.1 Crear Spreadsheet

1. Ve a https://sheets.google.com
2. "Crear hoja de cálculo nueva"
3. Nombra: "ZedProp - Pagos y Facturas"

### 1.2 Crear Tabla 1: Payments

Copia esta estructura:

| Date       | Tenant   | Property | Owner        | Amount | Status | Month    | Notes      |
| ---------- | -------- | -------- | ------------ | ------ | ------ | -------- | ---------- |
| 2026-03-01 | John Doe | Apt 101  | Maria Garcia | 1200   | PAID   | Mar-2026 | Rent March |

**Instrucciones**:

1. Primera fila = headers
2. Usa formato de fecha: 2026-03-01
3. Status: PAID, PENDING, OVERDUE
4. Amount = número (no texto)

### 1.3 Crear Tabla 2: Monthly Summary

```
                 Enero    Febrero   Marzo    Total
Ingresos         3600     3600      3600     10,800
Propiedades      3        3         3        -
Pago Promedio    1200     1200      1200     1,200
```

**Fórmulas a usar** (en Google Sheets):

```
=SUM(rango)              # Suma
=COUNTIF(rango, "PAID")  # Contar pagos recibidos
=AVERAGE(rango)          # Promedio
=QUERY()                 # Filtros complejos
```

### 1.4 Crear Tabla 3: Properties Tracking

| Property | Owner        | Address     | Monthly Rent | Tenants | Status |
| -------- | ------------ | ----------- | ------------ | ------- | ------ |
| Apt 101  | Maria Garcia | 123 Main St | 1200         | 1       | Active |

---

## 🔗 Paso 2: Conectar n8n a Google Sheets

### 2.1 Otorgar Permisos a n8n

1. En Google Sheets: Clickea "Compartir"
2. Agrega email: `n8n@n8n.cloud` (si usas n8n.cloud)
   - O si es self-hosted, usa tu email de Google
3. Dale permiso "Editor"

### 2.2 Obtener ID del Sheet

La URL se ve así:

```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
                                        ^^^^^^^^
```

Copia ese SHEET_ID y guarda en `.env`:

```env
GOOGLE_SHEETS_ID=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

### 2.3 Conectar en n8n

En n8n:

1. Settings → Credentials
2. "Create new" → Google Sheets
3. Selecciona cuenta Google
4. Autoriza acceso a Drive
5. Nombre: "GoogleSheets-ZedProp"

---

## 📝 Paso 3: Node de n8n para Crear Pagos

### Node: Google Sheets - Append Row

```json
{
  "node": "Google Sheets",
  "action": "append",
  "spreadsheetId": "{{ $env.GOOGLE_SHEETS_ID }}",
  "sheet": "Payments",
  "values": [
    "{{ now().format('YYYY-MM-DD') }}", // Date
    "{{ $node.smartRouter.json.userName }}", // Tenant
    "{{ $node.smartRouter.json.property }}", // Property
    "{{ $node.smartRouter.json.owner }}", // Owner
    "{{ $input.json.amount }}", // Amount
    "PAID", // Status
    "{{ now().format('MMM-YYYY') }}", // Month
    "Pago renta via WhatsApp" // Notes
  ]
}
```

### Resultado

Nueva fila se agrega automáticamente al Sheet en tiempo real.

---

## 📊 Paso 4: Crear Gráficos

### Gráfico 1: Ingresos por Mes

En Google Sheets:

1. Selecciona datos (columnas Date + Amount)
2. Insert → Chart
3. Type: Line Chart
4. Title: "Ingresos Mensuales"
5. X-axis: Month
6. Y-axis: Amount

**Resultado**: Gráfico activo que se actualiza con cada pago.

### Gráfico 2: Pagos Pendientes

```
=COUNTIF(Payments!F:F, "PENDING")  // Cuenta pendientes
=SUMIF(Payments!F:F, "PENDING", Payments!E:E)  // Total pendiente
```

### Gráfico 3: Pagos por Propiedad

Usa QUERY:

```
=QUERY(Payments!A:H,
  "SELECT C, SUM(E) GROUP BY C LABEL SUM(E) 'Total'")
```

---

## 🔄 Flujo Completo: Pago de Renta

```
Tenant: "Pagar $1200 de renta"
  ↓
n8n valida en Airtable
  ↓
Append a Google Sheets:
  Row: [Date, John Doe, Apt 101, Maria, 1200, PAID, Mar-2026, note]
  ↓
Google Sheets calcula automáticamente:
  - Total mensual
  - Ingresos por propiedad
  - Status pagos
  ↓
Response: "✅ Pago registrado. Total recibido este mes: $3600"
  ↓
Propietario ve en tiempo real en Google Sheets
```

---

## 📱 Compartir Dashboard con Propietario

### Opción 1: Ver Público (Lectura)

1. Google Sheets → Compartir
2. "Cambiar" → "Cualquier persona con el enlace"
3. Permiso: "Visualizador" (solo lectura)
4. Copia link y envía a propietario

Propietario ve **datos actualizados en tiempo real** sin poder editar.

### Opción 2: Acceso Restringido

1. Compartir solo con email del propietario
2. Permiso: "Editor" (si quiere editar notas)

---

## 📈 Reportes Que Puedes Crear

### Reporte 1: Resumen Mensual

```
Mes: Marzo 2026
Total Ingresos: $3,600
Propiedades: 3
Pagos Recibidos: 3
Pagos Pendientes: 0
```

### Reporte 2: Por Propiedad

```
Apt 101:
- Owner: Maria Garcia
- Tenant: John Doe
- Estimated: $1,200/mes
- Recibido (Mar): $1,200 ✅

Apt 102:
- Owner: Maria Garcia
- Tenant: Jane Smith
- Estimado: $1,200/mes
- Recibido (Mar): $0 ⏳ PENDING
```

### Reporte 3: Inquilinos Morosos

```
=FILTER(Payments, Payments!F:F = "OVERDUE")
```

---

## 🔐 Seguridad con Google Sheets

### Proteger Hojas

1. Hoja "Payments" → Proteger rango
2. Solo tú puedes editar (n8n agrega automáticamente)
3. Propietarios ven pero NO pueden cambiar cifras

### Backup Automático

Google Drive hace backup automático cada 24h.

### Auditoría

Google Sheets no tiene auditoría nativa, pero puedes:

1. Ver "Historial de versiones" (clic en reloj)
2. Ver quién hizo cambios y cuándo

---

## 💾 Exportar Datos

### Descargar como CSV

1. File → Download → CSV
2. Usar en Excel, accounting software, etc.

### Integrar con Contrador (si necesita)

Propietario descarga CSV mensual y lo pasa a contador para impuestos.

---

## 🆚 Google Sheets vs Xero vs Wave

```
                Sheets    Wave      Xero
Costo           GRATIS    GRATIS    $15/mes
Setup           5 min     10 min    15 min
Reportes        Manual    Automático Avanzado
Gráficos        ✅ Sí     ✅ Sí      ✅ Sí
Escalabilidad   Hasta 5K  Ilimitado Ilimitado
Impuestos       ❌ No     ✅ Semi   ✅ Oficial
Para ZedProp    ✅ MVP    ⭐ Ideal  Para scale
```

---

## 🚀 Cuándo Migrar de Google Sheets

Migra a **Wave** cuando:

- [ ] Tengas >20 propiedades
- [ ] Necesites reportes automáticos
- [ ] Quieras oficializar para impuestos

Migra a **Xero** cuando:

- [ ] > 100 propiedades
- [ ] Múltiples negocios
- [ ] Auditoría fiscal requerida

---

## ✅ Checklist Setup Google Sheets

- [ ] Google Sheet creado ("ZedProp - Pagos")
- [ ] 3 tablas creadas (Payments, Summary, Properties)
- [ ] Fórmulas de resumen funcionan
- [ ] Gráficos creados (ingresos, pendientes)
- [ ] SHEET_ID guardado en `.env`
- [ ] n8n conectado a Google Sheets
- [ ] Test: Append una fila desde n8n
- [ ] Propietario tiene acceso (lectura)
- [ ] Backup verificado

---

## 📞 Troubleshooting

| Problema                 | Solución                             |
| ------------------------ | ------------------------------------ |
| "Permission denied"      | Verifica compartir, agrega n8n email |
| "Sheet not found"        | Verifica SHEET_ID exacto             |
| "Fórmula no funciona"    | Chequea sintaxis, rangos             |
| "Datos no se actualizan" | Actualiza página (F5), caché         |

---

**Siguiente**: Vuelve a [SETUP_GUIDE.md](../docs/SETUP_GUIDE.md) pero omite Fase 3 (Xero).
