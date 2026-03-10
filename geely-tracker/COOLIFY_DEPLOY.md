# 🚀 Desplegar Geely Tracker en Coolify

**Tiempo estimado:** 15 minutos

---

## 📋 Requisitos

- ✅ Coolify corriendo en VPS Hostinger
- ✅ Docker disponible (incluido en Coolify)
- ✅ Acceso a tu repositorio GitHub: `https://github.com/rosario06/n8n`

---

## ⚡ Opción Rápida: Conectar Repositorio GitHub

### Paso 1: Ir a Coolify (en tu VPS)

```
http://tu-vps-ip:3000
```

### Paso 2: Crear Nuevo Proyecto

1. Click en **+ New Project**
2. Nombre: `Geely Tracker`
3. Click **Create**

### Paso 3: Agregar Aplicación desde GitHub

1. Click en **+ Add Service**
2. Seleccionar **Docker Compose**
3. Conectar GitHub:
   - Click **GitHub** (conectar si es primera vez)
   - Repositorio: `rosario06/n8n`
   - Rama: `master`
   - Root path: `geely-tracker/`

### Paso 4: Configurar Variables de Entorno

En Coolify, ir a **Environment** y agregar:

```env
# Variables para Geely Tracker
VITE_N8N_BASE_URL=https://n8n.tu-dominio.com/webhook/
VITE_WEBHOOK_SAVE_INGRESO=save-ingreso
VITE_WEBHOOK_SAVE_GASTO=save-gasto
VITE_WEBHOOK_GET_ANALYSIS=get-analysis

# Database
DATABASE_USER=geely_user
DATABASE_PASSWORD=tu_contraseña_segura_aqui
DATABASE_NAME=geely_db
```

**Nota:** Si usas la app SIN webhooks (solo localStorage local), estos son opcionales.

### Paso 5: Desplegar

1. Click en **Deploy**
2. Esperar a que compile (2-3 minutos)
3. Cuando veas "✅ Running", abre la URL en tu navegador

---

## 🔗 Acceso a la Aplicación

Una vez desplegado, Coolify te dará una URL como:

```
https://geely-tracker.tu-dominio.com
```

O configurar un dominio personalizado en **Settings** → **Domain**

---

## 💾 Base de Datos Automática

El `docker-compose.yml` ya:

- ✅ Crea PostgreSQL automáticamente
- ✅ Ejecuta `setup_postgres.sql` en primer inicio
- ✅ Persiste datos en volumen `postgres_data`

No necesitas hacer nada manualmente.

---

## 🔐 Configurar API Keys (Asesor IA)

Para que funcione el Asesor IA dentro de la app:

1. Abre la app en el navegador
2. Ve a pestaña **Config** ⚙️
3. Pega tu API Key de Claude (obtenla en `console.anthropic.com`)
4. Pega tu API Key de OpenAI (obtenla en `platform.openai.com`)
5. Las keys se guardan localmente en tu navegador (100% seguro)

---

## 📱 Acceso en tu Teléfono

La app es 100% responsive. Solo abre la URL en tu teléfono:

```
https://geely-tracker.tu-dominio.com
```

Funciona offline (datos guardados en localStorage) ✨

---

## 🆘 Solución de Problemas

### "Error al conectar a base de datos"

```bash
# Verifica que PostgreSQL esté corriendo
docker ps | grep postgres

# Ve logs de la base de datos
docker logs geely-tracker-db-1
```

### "Puerto 5173 ya en uso"

En Coolify, go to **Settings** y cambiar Puerto a otro (ej: `5174`)

### "Build fallando"

```bash
# SSH en tu VPS y limpia Docker
docker system prune -a
```

---

## ✨ Siguiente: Integración con n8n (Opcional)

Si quieres guardar datos en n8n en lugar de localStorage:

1. Crea webhooks en n8n para:
   - `POST /webhook/save-ingreso`
   - `POST /webhook/save-gasto`
   - `GET /webhook/get-analysis`

2. Actualiza en Coolify:

   ```env
   VITE_N8N_BASE_URL=https://tu-n8n-url.com/webhook/
   ```

3. En el navegador, ve a **Config** y activa webhooks (cuando esté implementado)

---

**¿Preguntas?** Revisa `COOLIFY_INSTALL.md` para detalles avanzados.
