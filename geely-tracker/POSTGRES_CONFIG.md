# 🗄️ Configuración PostgreSQL para n8n

## Credenciales de Conexión

```
HOST:       72.62.161.96
PORT:       5432
USER:       geely
PASSWORD:   Geely2026Seguro!
DATABASE:   geely_db
```

## Tablas Creadas

### `agent_history`
- Análisis semanales del agente IA
- Guarda: análisis, sugerencias, feedback del usuario

### `ingresos`
- Registro de todos los ingresos extras registrados
- Sincronizado automáticamente desde Geely Tracker

### `gastos`
- Registro de todos los gastos
- Categorizado por tipo

### `planes_activos`
- Planes activos/inactivos
- Check-in semanal

---

## 📋 Pasos para conectar n8n a PostgreSQL

### **Paso 1: En n8n Dashboard**

```
New Workflow
    ↓
[Add Node]
    ↓
Search: "Postgres" or "PostgreSQL"
    ↓
Select and click
```

### **Paso 2: Configurar Credenciales**

```
Node Type: Postgres

Fields:
├─ Host:     72.62.161.96
├─ Port:     5432
├─ Database: geely_db
├─ User:     geely
├─ Password: Geely2026Seguro!
└─ [Test Connection]
```

Click **"Test"** → Debe mostrar ✅ Success

### **Paso 3: Query SQL en n8n**

Para leer ingresos de esta semana:

```sql
SELECT * FROM ingresos 
WHERE user_id = 'juan' 
  AND fecha >= date_trunc('week', CURRENT_DATE)
ORDER BY fecha DESC
```

Para guardar resultado de análisis:

```sql
INSERT INTO agent_history 
(user_id, week_of, target_income, actual_income, agent_analysis, suggestions, active_plans)
VALUES 
($1, $2, $3, $4, $5, $6, $7)
RETURNING id
```

---

## 🔌 Endpoints REST (para Geely Tracker)

El archivo `src/pgClient.js` espera estos endpoints en n8n:

```javascript
POST /api/n8n/saveIngreso
POST /api/n8n/saveGasto
POST /api/n8n/saveAgentAnalysis
GET  /api/n8n/getIngresos
GET  /api/n8n/getGastos
GET  /api/n8n/getAgentAnalysis
GET  /api/n8n/health
```

**Crear un endpoint webhook en n8n para cada uno.**

---

## 🤖 Workflow del Agente Autónomo

```
[CRON] Lunes 9:00 AM
    ↓
[READ] Postgres - Ingresos últimos 7 días
    ↓
[CALC] Estadísticas (SUM, %)
    ↓
[IF] ¿Meta cumplida?
    ├─ SI → "¡Excelente, continúa!"
    └─ NO → Llamar OpenAI
        ↓
    [HTTP] OpenAI API
        ├─ Model: gpt-4o
        ├─ Context: ingresos, planes activos, meta
        └─ Response: 3 sugerencias
        ↓
    [WRITE] Insert en agent_history
        ↓
    [WEBHOOK] Notificar a Frontend
```

---

## 📝 Variables de Entorno para n8n

Agregar en Coolify/n8n:

```
OPENAI_API_KEY=sk-proj-xxxxx
PG_HOST=72.62.161.96
PG_PORT=5432
PG_USER=geely
PG_PASSWORD=Geely2026Seguro!
PG_DATABASE=geely_db
```

---

## ✅ Checklist de Implementación

- [ ] PostgreSQL corriendo en Coolify
- [ ] Tablas creadas con SQL
- [ ] Credenciales guardadas (arriba)
- [ ] n8n conecta a PostgreSQL (test connection OK)
- [ ] Geely Tracker tiene `src/pgClient.js`
- [ ] Funciones `saveIngreso`, `saveGasto` funcionan
- [ ] Endpoints webhook creados en n8n
- [ ] Workflow del agente listo
- [ ] Cron trigger configurado (lunes 9am)

---

## 🧪 Test Manual

### Desde PowerShell:

```powershell
# Test conexión PostgreSQL
$conn = New-Object System.Data.SqlClient.SqlConnection
$conn.ConnectionString = "Host=72.62.161.96;Port=5432;Database=geely_db;User Id=geely;Password=Geely2026Seguro!"
$conn.Open()
$conn.Close()
Write-Host "✅ Conexión OK"
```

### Desde n8n:

```
Node: Postgres
Query: SELECT COUNT(*) FROM ingresos
Execute → Debe retornar number
```

### Desde Geely Tracker:

```javascript
// En browser console
import { testConnection } from './pgClient.js'
await testConnection()
// Debe mostrar: ✅ PostgreSQL conectada
```

---

## 🔐 Seguridad

⚠️ **Nota Importante**:
- Nunca expongas estas credenciales públicamente
- Las credenciales están en este archivo de configuración
- En producción, usar variables de entorno en Coolify
- El archivo `pgClient.js` usa endpoints /api/n8n (proxy seguro)

No conectar directamente desde frontend a PostgreSQL (malas prácticas de seguridad).
