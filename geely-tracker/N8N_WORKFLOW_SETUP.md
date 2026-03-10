# 🤖 n8n Workflow Setup - Geely Tracker

## 🎯 Objetivo

Configurar n8n para:
1. **Leer datos** desde PostgreSQL (ingresos/gastos/planes)
2. **Procesar con OpenAI** (análisis inteligente)
3. **Guardar resultados** en PostgreSQL (agent_history)
4. **Notificar al frontend** via webhook

---

## 📋 Pre-requisitos

✅ PostgreSQL corriendo en Coolify  
✅ Tablas creadas (`ingresos`, `gastos`, `agent_history`, `planes_activos`)  
✅ n8n instalado en Coolify  
✅ OpenAI API key disponible  

---

## 🔑 Credenciales

### PostgreSQL
```
Host:     72.62.161.96
Port:     5432
User:     geely
Password: Geely2026Seguro!
Database: geely_db
```

### OpenAI
```
API Key:  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
Model:    gpt-4o
```

---

## 🛠️ Parte 1: Configurar Conexiones en n8n

### **1.1 Crear Credencial PostgreSQL**

En n8n Dashboard → **Credentials** (izquierda)

```
[+ Create New Credential]
    ↓
Type: PostgreSQL
Name: "Geely PostgreSQL"

Campos:
├─ Host:     72.62.161.96
├─ Port:     5432
├─ Database: geely_db
├─ User:     geely
├─ Password: Geely2026Seguro!
├─ [Test Connection] → ✅ Success
└─ [Save]
```

### **1.2 Crear Credencial OpenAI**

```
[+ Create New Credential]
    ↓
Type: OpenAI
Name: "OpenAI GPT-4o"

Campos:
├─ API Key: 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
├─ [Test Connection] → ✅ Success
└─ [Save]
```

---

## 🛠️ Parte 2: Crear Webhook Endpoints

Estos endpoints son llamados por `src/pgClient.js` en Geely Tracker.

### **2.1 Crear Workflow Base**

```
Dashboard → [+ New Workflow]
Name: "Geely Endpoints"
```

### **2.2 Webhook: POST /saveIngreso**

Nodo 1: **Webhook Trigger**
```
Method:      POST
Path:        /saveIngreso
Authentication: None (localhost)
```

Nodo 2: **PostgreSQL - Insert**
```
Credential:  Geely PostgreSQL
Operation:   Execute Query
Query:
INSERT INTO ingresos 
(user_id, monto, fuente, descripcion, fecha, created_at)
VALUES 
({{ $json.user_id }}, {{ $json.monto }}, {{ $json.fuente }}, {{ $json.descripcion }}, {{ $json.fecha }}, NOW())
RETURNING id;
```

Nodo 3: **Respuesta**
```
Type:   Send Response to Webhook
Status: 200
Body:   { "success": true, "id": {{ $json.id }} }
```

### **2.3 Webhook: POST /saveGasto**

Copiar estructura de 2.2, cambiar tabla:
```sql
INSERT INTO gastos 
(user_id, monto, categoria, descripcion, fecha, created_at)
VALUES 
({{ $json.user_id }}, {{ $json.monto }}, {{ $json.categoria }}, {{ $json.descripcion }}, {{ $json.fecha }}, NOW())
RETURNING id;
```

### **2.4 Webhook: POST /saveAgentAnalysis**

```sql
INSERT INTO agent_history 
(user_id, week_of, target_income, actual_income, agent_analysis, suggestions, active_plans, created_at)
VALUES 
({{ $json.user_id }}, {{ $json.week_of }}, {{ $json.target_income }}, {{ $json.actual_income }}, {{ $json.agent_analysis }}, {{ JSON.stringify($json.suggestions) }}, {{ JSON.stringify($json.active_plans) }}, NOW())
RETURNING id;
```

### **2.5 Webhook: GET /getIngresos**

```
Method:      GET
Authentication: None
```

PostgreSQL Query:
```sql
SELECT * FROM ingresos 
WHERE user_id = 'juan'
ORDER BY fecha DESC 
LIMIT {{ $url.query.limit || 50 }};
```

Response:
```json
{ "success": true, "ingresos": {{ $json }} }
```

### **2.6 Webhook: GET /health**

```
Response:
{ "connected": true, "timestamp": {{ Date.now() }} }
```

---

## 🛠️ Parte 3: Crear Workflow Principal del Agente

### **3.1 Crear Nuevo Workflow**

```
Name: "Geely Agent IA Semanal"
```

### **3.2 Nodo 1: Cron Trigger**

```
Type:        Cron
Trigger:     On a set interval
Interval:    Weekly
Day:         Monday
Time:        09:00
Timezone:    America/Santo_Domingo
```

### **3.3 Nodo 2: Leer Ingresos**

```
Type:        PostgreSQL
Credential:  Geely PostgreSQL
Query:
SELECT COALESCE(SUM(monto), 0) as total_ingresos
FROM ingresos
WHERE user_id = 'juan'
  AND fecha >= date_trunc('week', CURRENT_DATE);
```

### **3.4 Nodo 3: Leer Gastos**

```
Query:
SELECT COALESCE(SUM(monto), 0) as total_gastos
FROM gastos
WHERE user_id = 'juan'
  AND fecha >= date_trunc('week', CURRENT_DATE);
```

### **3.5 Nodo 4: Leer Planes Activos**

```
Query:
SELECT plan_id FROM planes_activos 
WHERE user_id = 'juan' AND activo = true;
```

### **3.6 Nodo 5: Calcular Estadísticas**

Tipo: Code/Javascript
```javascript
const ingresos = {{ $node["Nodo 2"].json }};
const gastos = {{ $node["Nodo 3"].json }};
const meta_semanal = 7693; // 33333/4.33 semanas

return {
  total_ingresos: ingresos?.[0]?.total_ingresos || 0,
  total_gastos: gastos?.[0]?.total_gastos || 0,
  meta_semanal: meta_semanal,
  cumplimiento: ((ingresos?.[0]?.total_ingresos || 0) / meta_semanal) * 100
};
```

### **3.7 Nodo 6: Decidir si llamar OpenAI**

```
Type:   If
Field:  {{ $node["Nodo 5"].json.cumplimiento }}
Operator: < (less than)
Value:  100

IF TRUE (< 100%) → Llamar OpenAI
IF FALSE (>= 100%) → Saltar a "Guardar Éxito"
```

### **3.8 Nodo 7: OpenAI Analysis**

```
Type:        OpenAI
Credential:  OpenAI GPT-4o
Model:       gpt-4o
Messages:
  System: 
    "Eres asesor financiero de Juan. Analiza su semana:
     Ingresos: RD${{ $node["Nodo 5"].json.total_ingresos }}
     Meta:     RD${{ $node["Nodo 5"].json.meta_semanal }}
     
     Como NO cumplió la meta, sugiere 3 planes DIFERENTES que podrían funcionar mejor.
     Sé específico: acción, duración, resultado esperado.
     Responde en JSON: { ideas: [{plan, accion, duracion, resultado}] }"
  
  User:
    "Sugiere alternativas accionables para esta semana"
```

### **3.9 Nodo 8: Guardar Análisis**

```
Type:        PostgreSQL
Query:
INSERT INTO agent_history 
(user_id, week_of, target_income, actual_income, agent_analysis, suggestions, active_plans)
VALUES 
('juan', 
 date_trunc('week', CURRENT_DATE)::DATE,
 7693,
 {{ $node["Nodo 5"].json.total_ingresos }},
 {{ JSON.stringify($node["Nodo 7"].json.message.content) }},
 {{ JSON.stringify($node["Nodo 7"].json.message.content) }},
 ARRAY[<% active_plans %>])
RETURNING id;
```

### **3.10 Nodo 9: Notificar Frontend (Webhook)**

```
Type:        HTTP Request
Method:      POST
URL:         http://localhost:5173/api/agentUpdate
Headers:
  Content-Type: application/json
Body (JSON):
{
  "weekOf": {{ $node["Nodo 8"].json.week_of }},
  "analysis": {{ $node["Nodo 8"].json.agent_analysis }},
  "success": true
}
```

---

## 🧪 Testing

### **Test 1: Verificar conexión PostgreSQL en n8n**

```
1. New Node → PostgreSQL
2. Write simple query: SELECT 1;
3. Execute → Debe retornar (1, 1)
```

### **Test 2: Disparar Webhook manualmente**

```bash
curl -X POST http://localhost:5678/webhook/geely/saveIngreso \
  -H "Content-Type: application/json" \
  -d '{"monto": 20000, "fuente": "Test", "descripcion": "Test", "fecha": "2026-03-09", "user_id": "juan"}'
```

Debe retornar:
```json
{ "success": true, "id": 123 }
```

### **Test 3: Ejecutar Workflow Agente**

```
1. Abrir workflow "Geely Agent IA Semanal"
2. Click [Execute Workflow] (arriba)
3. Ver logs → No debe haber errores
4. Verificar en PostgreSQL: SELECT * FROM agent_history;
```

---

## 📊 Flujo Completo

```
LUNES 9:00 AM
    ↓
[CRON] Dispara workflow
    ↓
[PG] Lee ingresos (últimos 7 días)
    ↓
[PG] Lee gastos (últimos 7 días)
    ↓
[CALC] Estadísticas y cumplimiento %
    ↓
[IF] ¿Meta cumplida?
    ├─ SÍ → Guardar "¡Excelente!"
    └─ NO → Llamar OpenAI
        ↓
    [OpenAI] Analiza y sugiere 3 planes
        ↓
    [PG] Guarda análisis en agent_history
        ↓
    [Webhook] Notifica frontend
        ↓
JUAN VE: Nueva tarjeta en tab "Agente Autónomo"
         con análisis y sugerencias
```

---

## 🔐 Variables de Entorno

En Coolify → n8n → Environment Variables:

```
OPENAI_API_KEY=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
PG_HOST=72.62.161.96
PG_PORT=5432
PG_USER=geely
PG_PASSWORD=Geely2026Seguro!
PG_DATABASE=geely_db
N8N_WEBHOOK_URL=http://localhost:5678
FRONTEND_URL=http://localhost:5173
```

---

## ❌ Troubleshooting

| Error | Solución |
|-------|----------|
| "Connection refused PostgreSQL" | Verificar IP 72.62.161.96, port 5432,  credenciales |
| "Webhook URL not responding" | Frontend debe estar corriendo, verificar CORS |
| "OpenAI rate limit" | Esperar 60 seg, verificar quota API key |
| "Invalid JSON" | Verificar format en nodos de código |
| "Cron no se ejecuta" | Verificar que n8n está activo, logs de n8n |

---

## 🚀 Próximos Pasos

1. ✅ Implementar 9 nodos del workflow principal
2. ✅ Ejecutar test manual
3. ✅ Verificar que agent_history se llena
4. ✅ Frontend lee análisis
5. ℹ️ Agregar notificaciones push (Phase 2)
6. ℹ️ App móvil React Native (Phase 3)

---

## 📞 Soporte

Ver archivo: `POSTGRES_CONFIG.md` para más detalles de credenciales.
