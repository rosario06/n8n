# Guía de Contribución - Oficina Legal Automatizada

¡Gracias por tu interés en extender y mejorar este proyecto! Esta guía explica cómo contribuir de forma efectiva.

## Estructura del Proyecto

```
oficina-legal-agentes/
├── README.md                    # Descripción general y MVP
├── .env.example                # Variables de entorno
├── docs/
│   ├── blueprint.md            # Arquitectura del sistema
│   ├── roadmap-6-semanas.md    # Plan de desarrollo
│   ├── workflows.md            # Documentación de cada workflow
│   ├── setup.md                # Instrucciones de instalación
│   ├── api-webhooks.md         # (Crear) Especificación de webhooks
│   └── extending.md            # (Crear) Guía de extensiones
├── db/
│   ├── schema.sql              # Definición de tablas (DO NOT EDIT DIRECTLY)
│   └── migrate.sql             # Script idempotente de migración
├── prompts/
│   ├── agente_recepcion.md     # Prompt para agent de recepción
│   ├── agente_intake.md        # Prompt para agent de intake
│   ├── agente_seguimiento.md   # Prompt para agent de seguimiento
│   └── agente_borradores.md    # Prompt para agent de borradores
├── n8n/
│   └── workflows/
│       ├── README.md           # Instrucciones de importación
│       ├── wf-01-recepcion-template.json
│       ├── wf-02-intake-template.json
│       ├── ... (WF-03 a WF-08)
└── tests/
    ├── http-payloads.ps1       # Script de pruebas HTTP (Windows)
    └── (crear) http-payloads.sh # Script de pruebas HTTP (Linux/Mac)
```

## Tipos de Contribución

### 1. Mejorar Prompts de Agentes

**Ubicación**: `prompts/*.md`

**Objetivo**: Optimizar las instrucciones del sistema para que los agentes sean más precisos y útiles.

**Cómo contribuir**:

1. Abre el archivo correspondiente (ej: `prompts/agente_recepcion.md`)
2. Identifica la sección que necesita mejora:
   - **Descripción del rol**: ¿Es clara la responsabilidad del agente?
   - **Guardrails**: ¿Están los límites de autoridad bien definidos?
   - **Ejemplos**: ¿Da suficientes ejemplos de entradas/salidas?
3. Propón cambios que:
   - Sean más específicos y contextuales
   - Mejoren la precisión sin sacrificar velocidad
   - Incluyan ejemplos de casos reales
4. Prueba con OpenAI Playground o n8n antes de hacer PR

**Ejemplo de mejora**:

```markdown
# Antes

El agente debe clasificar la consulta legal en una de estas categorías.

# Después

El agente debe clasificar la consulta legal en una de estas categorías usando keywords:

- **Laboral**: "despido", "salario", "contrato de trabajo", "jornada"
- **Mercantil**: "factura", "contrato", "cliente", "proveedor"
- **Civil**: "herencia", "testamento", "divorcio", "propiedad"

Si la consulta tiene múltiples temas, prioriza en orden: urgencia legal > complejidad > ingresos esperados.
```

### 2. Crear Nuevos Workflows

**Ubicación**: `n8n/workflows/wf-0X-*.json`

**Objetivo**: Agregar funcionalidad que no existe en los 8 workflows base.

**Requisitos antes de empezar**:

1. ¿Es independiente de los workflows existentes o necesita datos de ellos?
2. ¿Tiene sus propios webhooks o depende de webhooks actuales?
3. ¿Requiere nuevas tablas? → Actualizar `schema.sql` primero
4. ¿Es ejecutado por webhook, cron, o manualmente?

**Checklist de creación**:

- [ ] Nodo inicial (Webhook o Cron)
- [ ] Nodo(s) de validación (Code con regex) → 400 si falla
- [ ] Nodo(s) de lógica (postgres, HTTP, Code)
- [ ] Nodo(s) de logging (INSERT en case_events o audit_logs)
- [ ] Nodo final (respond_to_webhook con HTTP 200/400/404)
- [ ] Error handling en cada rama
- [ ] Documentado en `docs/workflows.md` con payload de ejemplo

**Plantilla mínima**:

```json
{
  "name": "WF-0X: Descripción del workflow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook/descriptivo"
      },
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "code": "const validation = /.../;\nif (!validation.test($json.some_field)) {\n  throw new Error('Invalid input');\n}\nreturn $json;"
      },
      "name": "Validate Input",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [500, 300]
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "url": "={{ $node['Webhook Trigger'].json.responseUrl }}",
        "options": {},
        "requestOptions": {}
      },
      "name": "Respond Success",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [750, 200]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Validate Input", "type": "main", "index": 0 }]]
    },
    "Validate Input": {
      "main": [[{ "node": "Respond Success", "type": "main", "index": 0 }]]
    }
  }
}
```

### 3. Agregar Integraciones Externas

**Objetivo**: Conectar con servicios externos (Slack, Google Calendar, DOCUSIGN, etc).

**Pasos**:

1. Identifica el servicio y su API/credenciales requeridas
2. Agrega variables a `.env.example`:
   ```env
   SERVICE_NAME_API_KEY=...
   SERVICE_NAME_WEBHOOK_URL=...
   ```
3. Crea credenciales en n8n UI
4. Implementa nodos que usen esas credenciales
5. Prueba con datos ficticios
6. Documenta en `docs/api-webhooks.md` (crear si no existe)

**Ejemplo: Integración WhatsApp Business**

```json
{
  "name": "SendWhatsApp",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://graph.instagram.com/v18.0/{{ $env['WHATSAPP_PHONE_ID'] }}/messages",
    "method": "POST",
    "authentication": "none",
    "sendQuery": false,
    "headers": {
      "Authorization": "Bearer {{ $env['WHATSAPP_API_KEY'] }}"
    },
    "bodyParametersUi": "json",
    "body": {
      "messaging_product": "whatsapp",
      "recipient_type": "individual",
      "to": "{{ $json.phone }}",
      "type": "text",
      "text": { "preview_url": true, "body": "{{ $json.message }}" }
    }
  }
}
```

### 4. Mejorar Documentación

**Ubicación**: `docs/*.md`

**Cómo ayudar**:

- Clarificar instrucciones confusas
- Agregar ejemplos de casos reales
- Traducir documentación a otros idiomas
- Crear videos/screenshots de procesos

**Archivos de documentación a crear/mejorar**:

- [ ] `docs/api-webhooks.md` - Especificación OpenAPI de todos los endpoints
- [ ] `docs/extending.md` - Guía detallada para agregar features
- [ ] `docs/troubleshooting.md` - FAQ y solución de problemas
- [ ] `docs/performance.md` - Guía de optimización y escalado

### 5. Reportar Bugs

**Proceso**:

1. Verifica que el bug no esté ya reportado en `ISSUES.md` (crear)
2. Describe:
   - Qué esperabas que sucediera
   - Qué sucedió realmente
   - Pasos para reproducir
   - Logs (de n8n, PostgreSQL, etc)
3. Indica tu entorno (Windows/Linux, n8n version, PostgreSQL version)

**Formato ejemplo**:

```markdown
## Bug: WF-02 falla cuando email es NULL

### Descripción

Al ejecutar WF-02 con cliente sin email, el workflow falla en el nodo "Upsert Cliente"

### Pasos para reproducir

1. Enviar webhook a /webhook/legal-intake sin campo "email"
2. Nodo "Upsert Cliente" tira error FK constraint

### Logs
```

ERROR: duplicate key value violates unique constraint "uq_clients_email_not_null"

```

### Entorno
- OS: Windows 10
- n8n: 1.65.1
- PostgreSQL: 14.5
```

## Estándares de Código

### JavaScript en n8n Code Nodes

```javascript
// ✅ BUENO: Explícito, comentado, validación
const input = $json;
if (!input.email || !/^[\w\.\-]+@[\w\.\-]+/.test(input.email)) {
  throw new Error("Email inválido o faltante");
}
const normalized = {
  email: input.email.toLowerCase(),
  phone: input.phone?.replace(/\D/g, "") || null,
};
return normalized;

// ❌ MALO: Implícito, sin validación
return { email: $json.email?.toLocaleLowerCase() };
```

### SQL en PostgreSQL Nodes

```sql
-- ✅ BUENO: Parameterizado, legible, comentarios
INSERT INTO case_events (case_id, event_type, event_payload, created_by)
VALUES (
  {{ $json.case_id || null }},  -- NULL si no existe caso
  'appointment_created',
  '{{ { ... }.toJsonString().replace(/'/g, "''") }}'::jsonb,
  'wf_agenda'
)
RETURNING id, created_at;

-- ❌ MALO: String interpolation directo (SQL injection risk)
INSERT INTO case_events VALUES ({{ $json.case_id }}, ...);
```

### JSON Validation en Workflows

Todos los workflows que reciben webhooks deben tener nodo de validación:

```javascript
// Validar estructura JSON antes de procesar
const schema = {
  required: ["full_name", "email"],
  properties: {
    full_name: { type: "string", minLength: 3 },
    email: { type: "string", pattern: "^\\S+@\\S+$" },
    phone: { type: "string", pattern: "^\\+?[0-9]{9,}$" },
  },
};

const errors = [];
if (!$json.full_name || $json.full_name.length < 3) {
  errors.push("full_name debe tener al menos 3 caracteres");
}
if (!$json.email || !/^\S+@\S+$/.test($json.email)) {
  errors.push("email inválido");
}

if (errors.length > 0) {
  throw new Error(errors.join("; "));
}
```

## Proceso de Contribución

### 1. Fork y Rama

```bash
git clone https://github.com/tu-usuario/oficina-legal-agentes.git
cd oficina-legal-agentes
git checkout -b feature/mejora-agentes
```

### 2. Realiza cambios

- Edita archivos según el tipo de contribución
- Prueba localmente:

  ```bash
  # Si editaste workflows
  cd tests && .\http-payloads.ps1 -BaseUrl "http://localhost:5678"

  # Si editaste schema.sql
  psql -U postgres legal_office_db -f db/migrate.sql
  ```

### 3. Documenta cambios

Actualiza la sección relevante en `docs/`:

```markdown
### Cambio realizado

- **Archivo**: `prompts/agente_recepcion.md`
- **Cambio**: Agregué ejemplos de consultas de propiedad
- **Razon**: Mejorar precisión de clasificación en casos civiles
- **Testing**: Testeado con OpenAI Playground en 5 consultas de prueba
```

### 4. Commit y Push

```bash
git add .
git commit -m "feat: mejorar clasificacion de agente recepcion

- Agregados 10 ejemplos de consultas de propiedad
- Ajustado prompt para priorizar urgencia legal
- Resultado: +15% de precisión en clasificación"

git push origin feature/mejora-agentes
```

### 5. Pull Request

En GitHub:

- Título claro: `feat:`, `fix:`, `docs:` según el tipo
- Descripción con contexto
- Enlaza issues relacionados (si existen)
- Espera revisión

## Code Review Checklist

Si revises PRs de otros:

- [ ] ¿El cambio está dentro del scope del proyecto?
- [ ] ¿Sigue los estándares de código?
- [ ] ¿Incluye tests/validación?
- [ ] ¿Actualiza documentación relevante?
- [ ] ¿Potencial de quebrantar configuraciones existentes?
- [ ] ¿Comentarios claros y útiles?

## Roadmap de Oportunidades

Areas donde hay demanda de contribuciones:

1. **RAG para WF-06**: Integrar embeddings OpenAI + similarity search en knowledge_chunks
2. **Dashboard de KPIs**: Frontend (React/Vue) que consume datos de case_events y invoices
3. **Google Calendar Sync**: WF-04 bi-directional con Google Calendar
4. **Docusign Integration**: WF-02 automatiza firma de poder y contrato de representación
5. **Multi-idioma**: Traducir prompts a EN, FR, PT
6. **Mobile App**: Flutter/React Native para clientes consulten estado de caso
7. **OpenAI Realtime API**: WF-01 con voz en tiempo real (WhatsApp Audio)
8. **Stripe Integration**: WF-07 pago automático de facturas vía link Checkout

## Preguntas?

- Revisa `README.md` para contexto general
- Revisa `docs/blueprint.md` para arquitectura
- Abre una issue de "pregunta" si necesitas clarificación

¡Gracias por contribuir! 🎉
