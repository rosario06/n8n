# 🔐 Credenciales Completadas - Geely Tracker

## ✅ Todas las Credenciales Configuradas

---

## 📊 PostgreSQL (Coolify)

```
Host:       72.62.161.96
Port:       5432
Database:   geely_db
User:       geely
Password:   Geely2026Seguro!
```

**Verificación:**
```powershell
psql -h 72.62.161.96 -U geely -d geely_db -c "SELECT 1;"
```

---

## 🤖 OpenAI (Credencial Activa)

```
API Key:    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
Model:      gpt-4o
Endpoint:   https://api.openai.com/v1/chat/completions
```

**Status:** ✅ Activa con facturación

---

## 🛠️ n8n Setup (Próximos Pasos)

### **Paso 1: PostgreSQL Credential en n8n**

```
Ir a: n8n Dashboard → Credentials

[+ Create New]
├─ Type:     PostgreSQL
├─ Name:     Geely PostgreSQL
├─ Host:     72.62.161.96
├─ Port:     5432
├─ Database: geely_db
├─ User:     geely
├─ Password: Geely2026Seguro!
└─ [Test Connection] → ✅ Must say "Connection successful"
```

### **Paso 2: OpenAI Credential en n8n**

```
[+ Create New]
├─ Type:     OpenAI
├─ Name:     OpenAI GPT-4o
├─ API Key:  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
└─ [Test Connection] → ✅ Must say "Connection successful"
```

---

## 🎯 Workflow estructura (n8n)

Una vez credenciales OK:

```
Workflow: "Geely Agent IA Semanal"

[1] Cron Trigger
    └─ Lunes 9:00 AM (America/Santo_Domingo)

[2-4] PostgreSQL reads
    ├─ Lee ingresos (últimos 7 días)
    ├─ Lee gastos (últimos 7 días)
    └─ Lee planes activos

[5] Calc Stats
    └─ SUM ingresos, calcula %

[6] IF check
    └─ ¿cumplimiento >= 100%?

[7] OpenAI (si NO cumple)
    ├─ Credential: OpenAI GPT-4o
    ├─ Model: gpt-4o
    └─ Message: análisis + sugerencias

[8] PostgreSQL insert
    └─ Guarda agentHistory

[9] Webhook notification
    └─ Frontend update
```

---

## 📋 Checklist Final

### PostgreSQL
- [ ] Tablas creadas (ejecutar setup_postgres.sql)
- [ ] Conexión testeada desde PowerShell
- [ ] Usuario "geely" creado

### n8n
- [ ] PostgreSQL credential creada (test OK)
- [ ] OpenAI credential creada (test OK)
- [ ] Webhook endpoints configurados (5 endpoints)
- [ ] Workflow principal creado (9 nodos)
- [ ] Cron trigger en Lunes 9am

### Frontend (Geely Tracker)
- [ ] npm install pg ejecutado
- [ ] src/pgClient.js presente
- [ ] GeelyTracker.jsx actualizado
- [ ] npm run dev sin errores
- [ ] testConnection() retorna ✅

### Testing
- [ ] POST /api/n8n/saveIngreso responde
- [ ] SELECT * FROM ingresos muestra datos
- [ ] Workflow se ejecuta (manual + cron)
- [ ] agent_history se llena
- [ ] Tab "Agente Autónomo" muestra resultados

---

## 🚀 Quick Links

```
PostgreSQL Docs:        POSTGRES_CONFIG.md
n8n Workflow Setup:     N8N_WORKFLOW_SETUP.md
SQL Tables:             setup_postgres.sql
Frontend Client:        src/pgClient.js
Implementation:         IMPLEMENTATION_SUMMARY.md
Quick Start:            QUICKSTART.md
```

---

## ⚡ Orden de Ejecución

```
1. SQL en PostgreSQL ................ 5 min
2. n8n PostgreSQL credential ........ 2 min ← START HERE
3. n8n OpenAI credential ............ 1 min
4. n8n Webhooks endpoints ........... 10 min (seguir doc)
5. n8n Workflow principal ........... 15 min (seguir doc)
6. Frontend test .................... 2 min
─────────────────────────────────────────────
TOTAL ............................. 35 min
```

---

## 🎉 Estado: LISTO PARA CONFIGURAR

```
✅ Geely Tracker código actualizado
✅ PostgreSQL accesible
✅ OpenAI key validada
✅ n8n instalado
✅ Documentación completa

= Ahora solo falta: crear workflows en n8n
```

---

## 💡 Notas Importantes

1. **OpenAI Key es REAL**: Úsala directamente en n8n
2. **PostgreSQL Password**: Geely2026Seguro! (así se configuró)
3. **Zona horaria n8n**: America/Santo_Domingo (para lunes 9am)
4. **Frontend respuesta**: Webhooks en n8n deben estar accesibles

---

**¿Listo para crear los workflows en n8n?** 🚀

Ve a **N8N_WORKFLOW_SETUP.md** Parte 1, sección 1.2 (OpenAI credential está lista)
