# 🚀 n8n Setup - Paso a Paso Detallado

## 🎯 Objetivo

Crear workflows en n8n para que Geely Tracker funcione con PostgreSQL y OpenAI.

---

## ⚡ Rutas Rápidas

```
OPCIÓN A: Completar en 25 minutos
→ Solo Workflow Endpoints (webhooks para save/read)

OPCIÓN B: Completo en 40 minutos
→ Endpoints + Workflow Agente (análisis automático lunes 9am)

RECOMENDADO: OPCIÓN B (funcionalidad completa)
```

---

## 📍 EMPEZAR: Credenciales

Tu OpenAI key está en **CREDENTIALS.md**

### Paso 1: PostgreSQL Credential

En n8n Dashboard:

```
n8n.localhost:5678 → Credentials (icono llaves izquierda)
    ↓
[+ Create New Credential]
    ↓
Type: "PostgreSQL"
    ↓
Name: "🐘 Geely PostgreSQL"

Fields:
├─ Host:     72.62.161.96
├─ Port:     5432
├─ Database: geely_db
├─ User:     geely
├─ Password: Geely2026Seguro!
├─ SSL: Uncheck (local VPS)
└─ [Save]

LUEGO: [Test Connection] → Debe mostrar ✅
```

### Paso 2: OpenAI Credential

```
[+ Create New Credential]
    ↓
Type: "OpenAI"
    ↓
Name: "🤖 OpenAI GPT-4o"

Fields:
├─ API Key: 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
└─ [Save]

LUEGO: [Test Connection] → Debe mostrar ✅
```

---

## 🛠️ CREAR: Workflow Endpoints

### Paso 3: Crear Workflow Base

```
Dashboard → [+ New Workflow]
    ↓
Name: "📡 Geely Endpoints"
    ↓
[Save]
```

### Paso 4: Webhook #1 - POST /saveIngreso

**Nodo 1: Webhook Trigger**
```
[Add Node] → Search: "Webhook" 
    ↓
Node title: "Receive Ingreso"
    ↓
Method:         POST
Path:           /saveIngreso
Authentication: None
    ↓
[Save]
```

**Nodo 2: PostgreSQL Insert**
```
[+ Add Node] → Search: "Postgres"
    ↓
Node title: "Insert Ingreso"
    ↓
Credential:     🐘 Geely PostgreSQL
Operation:      Execute Query
    ↓
Query:
───────────────
INSERT INTO ingresos (user_id, monto, fuente, descripcion, fecha, created_at)
VALUES ({{ $json.user_id }}, {{ $json.monto }}, '{{ $json.fuente }}', '{{ $json.descripcion }}', '{{ $json.fecha }}', NOW())
RETURNING id, monto, fuente, fecha;
───────────────
    ↓
[Save]
```

**Nodo 3: Response**
```
[+ Add Node] → Search: "Respond"
    ↓
Node title: "Send Success"
    ↓
Body: Custom
    ↓
JSON:
───────────────
{
  "success": true,
  "id": {{ $json[0].id }},
  "monto": {{ $json[0].monto }},
  "fuente": "{{ $json[0].fuente }}"
}
───────────────
    ↓
[Save]
```

**Conectar nodos:**
```
Webhook Trigger → PostgreSQL Insert → Response
```

## Paso 5: Webhook #2 - POST /saveGasto

Copiar estructura del Paso 4, pero:

```
Path:  /saveGasto
Table: gastos
Fields: monto, categoria, descripcion, fecha
```

SQL:
```sql
INSERT INTO gastos (user_id, monto, categoria, descripcion, fecha, created_at)
VALUES ({{ $json.user_id }}, {{ $json.monto }}, '{{ $json.categoria }}', '{{ $json.descripcion }}', '{{ $json.fecha }}', NOW())
RETURNING id, monto, categoria, fecha;
```

## Paso 6: Webhook #3 - POST /saveAgentAnalysis

```
Path:  /saveAgentAnalysis

SQL:
INSERT INTO agent_history (user_id, week_of, target_income, actual_income, agent_analysis, suggestions, active_plans)
VALUES ({{ $json.user_id }}, '{{ $json.week_of }}', {{ $json.target_income }}, {{ $json.actual_income }}, '{{ $json.agent_analysis }}', '{{ JSON.stringify($json.suggestions) }}', ARRAY[{{ $json.active_plans }}])
RETURNING id, week_of, agent_analysis;
```

## Paso 7: Webhook #4 - GET /getIngresos

```
Method: GET
Path:   /getIngresos

PostgreSQL Query:
SELECT id, monto, fuente, descripcion, fecha, created_at 
FROM ingresos 
WHERE user_id = 'juan'
ORDER BY fecha DESC 
LIMIT COALESCE({{ $url.query.limit }}, 50);

Response:
{
  "success": true,
  "ingresos": {{ $json }}
}
```

## Paso 8: Webhook #5 - GET /health

```
Method: GET
Path:   /health

No DB needed, just response webhook:
{
  "connected": true,
  "database": "PostgreSQL",
  "status": "healthy",
  "timestamp": {{ Date.now() }}
}
```

---

## 🤖 CREAR: Workflow Agente Principal

### Paso 9: Crear Workflow del Agente

```
[+ New Workflow]
    ↓
Name: "🔄 Geely Agent IA Semanal"
    ↓
[Save]
```

### Paso 10: Nodo 1 - CRON Trigger

```
[Add Node] → Search: "Cron"
    ↓
Node title: "Weekly Check"
    ↓
Trigger:  On a set interval
Interval: Weekly
Day:      Monday
Time:     09:00 (9:00 AM)
Timezone: America/Santo_Domingo
    ↓
[Save]
```

### Paso 11: Nodo 2 - Read Ingresos

```
[Add Node] → "Postgres"
    ↓
Node title: "Get Ingresos Semana"
    ↓
Credential: 🐘 Geely PostgreSQL
Operation:  Execute Query
    ↓
Query:
SELECT COALESCE(SUM(monto), 0) as total_ingresos, COUNT(*) as count
FROM ingresos
WHERE user_id = 'juan'
  AND fecha >= CURRENT_DATE - INTERVAL '7 days';
```

### Paso 12: Nodo 3 - Read Gastos

```
Similar a Nodo 2:
    ↓
Query:
SELECT COALESCE(SUM(monto), 0) as total_gastos
FROM gastos
WHERE user_id = 'juan'
  AND fecha >= CURRENT_DATE - INTERVAL '7 days';
```

### Paso 13: Nodo 4 - Read Planes

```
Query:
SELECT json_agg(plan_id) as plans
FROM planes_activos
WHERE user_id = 'juan' AND activo = true;
```

### Paso 14: Nodo 5 - Calc Stats (JavaScript)

```
[Add Node] → Search: "Execute Code"
    ↓
Node title: "Calculate"
    ↓
Language: Javascript
    
Code:
───────────────
const ingresos = {{ $node["Get Ingresos Semana"].json[0] }} || {};
const gastos = {{ $node["Get Gastos Semana"].json[0] }} || {};
const planes = {{ $node["Get Planes"].json[0] }} || {};

const meta_semanal = 7693;
const actual = ingresos.total_ingresos || 0;

return {
  total_ingresos: actual,
  total_gastos: gastos.total_gastos || 0,
  active_plans: planes.plans || [],
  meta: meta_semanal,
  cumplimiento: ((actual / meta_semanal) * 100).toFixed(1)
};
───────────────
```

### Paso 15: Nodo 6 - IF: Check Meta

```
[Add Node] → "If"
    ↓
Node title: "Meta Cumplida?"
    ↓
Condition: 
├─ Field:    {{ $node["Calculate"].json.cumplimiento }}
├─ Operator: < (menor que)
├─ Value:    100
└─ Output: true si NO cumplió, false si sí

IF TRUE → Llamar OpenAI
IF FALSE → Skip a Nodo 8 (Guardar éxito)
```

### Paso 16: Nodo 7 - OpenAI Analysis

```
[Add Node] → "OpenAI"
    ↓
Node title: "Analyze & Suggest"
    ↓
Credential:  🤖 OpenAI GPT-4o
Model:       gpt-4o
Temperature: 0.7
    ↓
Messages (Array):

System message:
"Eres asesor financiero de Juan Rosario (RD).
Meta semanal: RD${{ $node["Calculate"].json.meta }}
Esta semana: RD${{ $node["Calculate"].json.total_ingresos }}
Cumplimiento: {{ $node["Calculate"].json.cumplimiento }}%

Como NO cumplió, sugiere 3 PLANES DIFERENTES (no los actuales).
Responde JSON: {
  'analisis': 'diagnóstico en 1 párrafo',
  'planes': [
    {'nombre': '...', 'accion': '...', 'resultado': '...'},
    ...
  ]
}"

User message:
"Analiza y sugiere 3 alternativas"
```

### Paso 17: Nodo 8 - Save Analysis

```
[Add Node] → "Postgres"
    ↓
Node title: "Save History"
    ↓
Query:
INSERT INTO agent_history 
(user_id, week_of, target_income, actual_income, agent_analysis, suggestions, active_plans)
VALUES (
  'juan',
  CURRENT_DATE - INTERVAL '7 days',
  {{ $node["Calculate"].json.meta }},
  {{ $node["Calculate"].json.total_ingresos }},
  '{{ $node["Analyze & Suggest"].json.message.content }}',
  '{{ JSON.stringify($node["Analyze & Suggest"].json) }}',
  '{{ JSON.stringify($node["Calculate"].json.active_plans) }}'
)
RETURNING id, week_of, agent_analysis;
```

### Paso 18: Nodo 9 - Notify Frontend

```
[Add Node] → "HTTP Request"
    ↓
Node title: "Webhook Frontend"
    ↓
Method:  POST
URL:     http://localhost:5173/api/agentUpdate
Headers:
  Content-Type: application/json
    ↓
Body (JSON):
{
  "weekOf": {{ $node["Save History"].json[0].week_of }},
  "analysis": {{ $node["Save History"].json[0].agent_analysis }},
  "id": {{ $node["Save History"].json[0].id }},
  "success": true
}
```

---

## 🔗 Conectar Nodos

```
Cron Trigger
    ↓ (3 paralelo)
├→ Read Ingresos
├→ Read Gastos
└→ Read Planes
    ↓ (todos convergen)
    └→ Calculate Stats
        ↓
        └→ IF Meta?
            ├─ TRUE → OpenAI → Save → Notify
            └─ FALSE → Save (éxito) → Notify
```

---

## 🧪 Testing

### Test Endpoints

```bash
# Test 1: Save Ingreso
curl -X POST http://localhost:5678/webhook/geely/saveIngreso \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "juan",
    "monto": 20000,
    "fuente": "Test n8n",
    "descripcion": "Prueba",
    "fecha": "2026-03-09"
  }'

# Esperado: { "success": true, "id": 1, ... }

# Test 2: Get Ingresos
curl http://localhost:5678/webhook/geely/getIngresos?limit=10

# Esperado: { "success": true, "ingresos": [...] }

# Test 3: Health
curl http://localhost:5678/webhook/geely/health

# Esperado: { "connected": true, "status": "healthy" }
```

### Test Workflow Agente

```
En n8n Dashboard:
1. Abrir workflow "Geely Agent IA Semanal"
2. Click [Execute Workflow] (arriba derecha)
3. Ver logs → debe completar sin errores
4. Verificar PostgreSQL: SELECT * FROM agent_history;
```

---

## ✅ Validación Final

```
Endpoints Workflow:
- [ ] N1-N3 saveIngreso OK
- [ ] N1-N3 saveGasto OK
- [ ] N1-N3 saveAgentAnalysis OK
- [ ] GET /getIngresos responde
- [ ] GET /health responde

Agent Workflow:
- [ ] CRON trigger configurado
- [ ] Read Ingresos OK
- [ ] Calculate Stats OK
- [ ] IF condition funciona
- [ ] OpenAI responde
- [ ] Save en agent_history
- [ ] Webhook notifica

Frontend:
- [ ] Geely Tracker npm run dev sin errores
- [ ] testConnection() → ✅
- [ ] Registrar ingreso → aparece en PostgreSQL
- [ ] Tab "Agente Autónomo" visible
```

---

## 🎉 ¡Listo!

Una vez completado:
- ✅ Geely Tracker sincroniza con PostgreSQL
- ✅ n8n ejecuta análisis cada lunes 9am
- ✅ OpenAI sugiere estrategias automáticamente
- ✅ Frontend muestra resultados en tiempo real

**Duración total: ~40 minutos** ⏱️

---

## 📞 Troubleshooting

| Problema | Solución |
|----------|----------|
| PostgreSQL connection error | Verificar IP 72.62.161.96, credenciales |
| OpenAI error 401 | API key incorrecta o expirada |
| Webhook no se ejecuta | Verificar URL en HTTP Request |
| Cron no dispara a las 9am | Timezone debe ser America/Santo_Domingo |
| Node no se conecta | Check credential test OK antes de usar |

---

**¿Listo para empezar?** Comienza por **Paso 1 - Credenciales** ↑
