# ⚡ Quick Start - PostgreSQL + n8n Setup

## 🎯 Tu Situación

```
✅ VPS KMS2:     72.62.161.96
✅ PostgreSQL:   Coolify (port 5432)
✅ n8n:          Coolify (port 5678)
✅ OpenAI:       sk-proj-xxxxx
❌ Workflow:     NO configurado aún
```

---

## 30 SEGUNDOS: Qué va a pasar

```
TÚ registras ingreso en Geely Tracker
            ↓
Automáticamente se guarda en PostgreSQL
            ↓
Cada LUNES 9AM, n8n:
  - Lee tu progreso
  - Llama OpenAI
  - Sugiere nuevas estrategias
  - Guarda análisis
            ↓
TÚ ves resultado en tab "Agente Autónomo"
```

---

## 🔧 TODO LO QUE YA HICE POR TI

✅ Creados 3 archivos de configuración  
✅ Actualizado GeelyTracker.jsx  
✅ Creado pgClient.js (cliente DB)  
✅ Documentación completa de n8n  

---

## 📋 REMAINING: Tu parte

### **PASO 1: En PostgreSQL (5 min)**

```sql
-- Ejecutar en tu PostgreSQL
\c geely_db

-- Copy-paste el contenido de setup_postgres.sql
```

### **PASO 2: En n8n Credenciales (3 min)**

```
Dashboard → Credentials

[+ New]
Type:     PostgreSQL
Name:     Geely PostgreSQL
├─ Host:     72.62.161.96
├─ Port:     5432
├─ Database: geely_db
├─ User:     geely
├─ Password: Geely2026Seguro!
└─ [Test] → ✅

[+ New]
Type:     OpenAI
Name:     OpenAI GPT-4o
├─ API Key: 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
└─ [Test] → ✅
```

### **PASO 3: n8n Workflow (15 min)**

Sigue exactamente: **N8N_WORKFLOW_SETUP.md**

9 pasos principales:
1. Cron trigger (lunes 9am)
2. Lee ingresos
3. Lee gastos
4. Lee planes
5. Calcula stats
6. Decide si llamar OpenAI
7. OpenAI analysis
8. Guarda resultado
9. Notifica frontend

### **PASO 4: Test (2 min)**

```javascript
// En browser console de Geely Tracker
import { testConnection } from './pgClient.js'
await testConnection()
// Debe mostrar: ✅ PostgreSQL conectada
```

---

## 📁 Tus Archivos de Referencia

| Archivo | Qué hace |
|---------|----------|
| `POSTGRES_CONFIG.md` | Credenciales + config |
| `N8N_WORKFLOW_SETUP.md` | Cómo crear workflow |
| `setup_postgres.sql` | SQL para tablas |
| `src/pgClient.js` | Cliente JavaScript |
| `IMPLEMENTATION_SUMMARY.md` | Resumen completo |

---

## 🚀 Orden de Ejecución

```
1. SQL en PostgreSQL ................ 5 min
2. Credetenciales en n8n ............ 3 min
3. Workflow principal en n8n ........ 15 min
4. Test en Geely Tracker ............ 2 min
─────────────────────────────────────────
TOTAL ............................. 25 min
```

---

## ⚡ Comandos Útiles

```powershell
# Ver PostgreSQL corriendo
docker ps | findstr postgres

# Ver n8n corriendo
docker ps | findstr n8n

# Test PostgreSQL desde PowerShell
psql -h 72.62.161.96 -U geely -d geely_db -c "SELECT 1;"

# Ver logs de n8n
docker logs -f [n8n-container-id]
```

---

## 🎯 Validacion Rápida (despues de todo)

```
├─ PostgreSQL responde
│  └─ SELECT COUNT(*) FROM ingresos; → (0)
│
├─ n8n credenciales OK
│  └─ Test PostgreSQL → ✅
│  └─ Test OpenAI → ✅
│
├─ Geely Tracker conecta
│  └─ Console: testConnection() → ✅
│
└─ Registra un ingreso
   └─ SELECT * FROM ingresos; → 1 row
```

---

## ❌ Si algo falla

| Sintoma | Check |
|---------|-------|
| PostgreSQL no responde | IP correcta? Port 5432 abierto? |
| n8n credential falla | User/password correctos? |
| Webhook no llama | n8n corriendo? Frontend alcanza? |
| Cron no se ejecuta | Zona horaria en n8n correcta? |

---

## 💡 Resumen Ultra-Breve

```
PASO 1: Tablas en PG (copy-paste SQL)
PASO 2: Credenciales en n8n (5 clicks)
PASO 3: Workflow en n8n (seguir guía)
PASO 4: Test (un comando)

= Agente IA automático cada lunes
```

---

## 📞 Guias por Sección

Si necesitas ayuda específica:

- **PostgreSQL**: Ver `POSTGRES_CONFIG.md` sección 2
- **n8n setup**: Ver `N8N_WORKFLOW_SETUP.md` partes 1-2
- **Workflow principal**: Ver `N8N_WORKFLOW_SETUP.md` parte 3
- **Frontend**: Ver `IMPLEMENTATION_SUMMARY.md` paso 6
- **Troubleshooting**: Ver `IMPLEMENTATION_SUMMARY.md` sección "Troubleshooting Rápido"

---

**¿Listo para empezar?** 🚀

Comienza que paso 1 (SQL en PostgreSQL). Avísame cuando termines cada paso.
