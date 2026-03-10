# 🚀 Instalar Geely Tracker en Coolify

## 📋 Requisitos Previos

- **Coolify** instalado y funcionando (https://coolify.io)
- **Docker** en el servidor (Coolify ya incluye)
- **n8n** configurado con webhooks activos (externa)
- **PostgreSQL** accesible (puede ser local o externo)

---

## 🔧 Paso 1: Preparar el Repositorio

El repositorio ya tiene todo configurado:

```bash
# Verificar archivos necesarios
ls -la Dockerfile .dockerignore .env.example docker-compose.yml
```

**Archivos incluidos:**
- ✅ `Dockerfile` - Compilación multi-stage de React
- ✅ `.dockerignore` - Optimización de imagen
- ✅ `docker-compose.yml` - Toda la infraestructura
- ✅ `.env.example` - Variables de ambiente

---

## 📦 Paso 2: Configurar en Coolify

### Opción A: Usando la UI de Coolify

1. **Crear nuevo proyecto:**
   - Click en **+ New Project** en Coolify
   - Nombre: `Geely Tracker`

2. **Agregar aplicación:**
   - Click en **+ Add Service**
   - Seleccionar **Docker Compose**
   - Pegar el contenido de `docker-compose.yml`
   
3. **O conectar repositorio Git:**
   - Click en **GitHub/GitLab** 
   - Conectar repo: `https://github.com/rosario06/n8n`
   - Rama: `master`
   - Root path: `geely-tracker/`

### Opción B: Despliegue Manual (CLI)

```bash
# 1. Clonar/descargar repositorio en el servidor
git clone https://github.com/rosario06/n8n.git
cd n8n/geely-tracker

# 2. Copiar variables de ambiente
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 3. Iniciar con docker-compose
docker-compose up -d

# 4. Verificar logs
docker-compose logs -f frontend
```

---

## 🔐 Paso 3: Configurar Variables de Ambiente

**En Coolify UI o en `.env`:**

```env
# n8n Base URL (EXTERNA)
VITE_N8N_BASE_URL=https://n8n.kelocode.com/webhook/

# Webhooks
VITE_WEBHOOK_SAVE_INGRESO=save-ingreso
VITE_WEBHOOK_SAVE_GASTO=save-gasto
VITE_WEBHOOK_GET_ANALYSIS=get-analysis

# OpenAI (opcional, si usas local)
VITE_OPENAI_API_KEY=sk-proj-YOUR_KEY

# Base de datos
DATABASE_USER=geely_user
DATABASE_PASSWORD=super_secure_password
DATABASE_NAME=geely_db
DATABASE_HOST=db
DATABASE_PORT=5432
```

**⚠️ IMPORTANTE:**
- Las URLs de n8n deben ser accesibles desde el servidor Coolify
- El OpenAI API key idealmente se maneja desde backend, no frontend
- Las credenciales de BD deben ser fuertes

---

## 🌐 Paso 4: Conectar Dominio (Opcional)

En Coolify:
1. Click en la aplicación **frontend**
2. **Domains** → **+ Add Domain**
3. Ingresa tu dominio: `geely-tracker.tudominio.com`
4. Espera a que genere HTTPS (Let's Encrypt)

---

## 🧪 Paso 5: Verificar Instalación

```bash
# Revisar contenedores corriendo
docker ps

# Ver logs del frontend
docker logs geely-tracker-frontend-1

# Acceder a la app
curl http://localhost:5173
# O abrir en navegador: http://tu-servidor:5173
```

**Puntos de control:**
- ✅ Frontend accesible en puerto 5173
- ✅ PostgreSQL corriendo en puerto 5432
- ✅ Webhooks de n8n respondiendo
- ✅ API Key de OpenAI válida (si aplica)

---

## 📊 Paso 6: Sincronizar Base de Datos

El archivo `setup_postgres.sql` se ejecuta automáticamente al iniciar. Pero puedes verificar manualmente:

```bash
# Entrar a PostgreSQL
docker exec -it geely-tracker-db-1 psql -U geely_user -d geely_db

# Listar tablas
\dt

# Salir
\q
```

**Tablas esperadas:**
- `ingresos` - Registro de ingresos
- `gastos` - Registro de gastos
- `agent_history` - Análisis del agente
- `planes_activos` - Planes activos del usuario

---

## 🔍 Troubleshooting

### Frontend no inicia
```bash
# Ver logs completos
docker-compose logs frontend

# Verificar puerto 5173 disponible
netstat -tulpn | grep 5173

# Reconstruir imagen
docker-compose build --no-cache frontend
```

### PostgreSQL no conecta
```bash
# Verificar container activo
docker-compose ps db

# Ver logs
docker-compose logs db

# Reiniciar
docker-compose restart db
```

### Webhooks no funcionan
```bash
# Verificar acceso a n8n desde el contenedor
docker exec geely-tracker-frontend-1 curl https://n8n.kelocode.com/webhook/get-analysis

# Revisar VITE_N8N_BASE_URL en variables
docker exec geely-tracker-frontend-1 env | grep N8N
```

### Certificado HTTPS falla
```bash
# En Coolify, ir a Domains
# Esperar a que Let's Encrypt genere certificado
# O usar Cloudflare SSL/TLS

# Para desarrollo local sin HTTPS:
# Modificar VITE_N8N_BASE_URL a http:// (no recomendado)
```

---

## 📈 Monitoreo en Coolify

Coolify incluye:
- **Logs** en tiempo real
- **CPU/Memoria** del contenedor
- **Errores** y avisos
- **Backups** automáticos de PostgreSQL

**Acceder:** Dashboard de Coolify → Aplicación → Monitoring

---

## 🔄 Actualizaciones Futuras

```bash
# Pull última versión
git pull origin master

# Reconstruir y reiniciar
docker-compose up -d --build

# Limpiar imágenes viejas
docker image prune -f
```

---

## 📞 Soporte

**Si algo falla:**

1. Revisar logs: `docker-compose logs`
2. Verificar archivos `.env` y credenciales
3. Validate conectividad a n8n
4. Probra en desarrollo local primero: `npm run dev`

---

## ✅ Checklist Post-Instalación

- [ ] Frontend accessible en http://servidor:5173
- [ ] PostgreSQL conectado y sincronizado  
- [ ] n8n webhooks funcionando (prueba desde UI)
- [ ] Variables de ambiente correctas
- [ ] HTTPS configurado (si es necesario)
- [ ] Backups de DB programados en Coolify
- [ ] Logs configurados
- [ ] Dominio apuntando (si aplica)

¡Listo! Geely Tracker está corriendo en Coolify! 🎉
