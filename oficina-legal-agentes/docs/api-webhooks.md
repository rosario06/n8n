# Especificación de Webhooks - Oficina Legal Automatizada

Documentación OpenAPI-inspired para todos los endpoints webhook de los workflows n8n.

## Información General

- **Base URL**: `http://n8n-instance/webhook` (o tu URL configurada en n8n)
- **Authentication**: JWT Token (opcional, recomendado para producción)
- **Content-Type**: `application/json`
- **Timeout**: 30 segundos máximo
- **Rate Limit**: (Configurar según capacity de n8n)

## Tabla de Endpoints

| Workflow | Path                         | Método | Trigger                             | Estado    |
| -------- | ---------------------------- | ------ | ----------------------------------- | --------- |
| WF-01    | `/webhook/legal-recepcion`   | POST   | Mensaje de cliente (WhatsApp/Email) | ✅ Activo |
| WF-02    | `/webhook/legal-intake`      | POST   | Inicio de caso nuevo                | ✅ Activo |
| WF-03    | `/webhook/legal-estado`      | POST   | Consulta de estado de caso          | ✅ Activo |
| WF-04    | `/webhook/legal-agenda`      | POST   | Crear/editar cita                   | ✅ Activo |
| WF-05    | `/webhook/legal-urgencias`   | POST   | Escalación por urgencia             | ✅ Activo |
| WF-06    | `/webhook/legal-borradores`  | POST   | Generar borradores                  | ✅ Activo |
| WF-07    | `/webhook/legal-facturacion` | POST   | Crear factura                       | ✅ Activo |
| WF-08    | `/webhook/legal-auditoria`   | POST   | Registrar evento de auditoría       | ✅ Activo |

---

## WF-01: Recepción Omnicanal

**Descripción**: Recibe mensajes de clientes, clasifica intención, y responde automáticamente.

**Endpoint**: `POST /webhook/legal-recepcion`

### Request Body

#### Opción 1: Mensaje WhatsApp

```json
{
  "channel": "whatsapp",
  "phone": "+34612345678",
  "message": "Hola, necesito consultar sobre un contrato",
  "timestamp": "2026-03-03T14:30:00Z",
  "sender_name": "Carlos García"
}
```

#### Opción 2: Email

```json
{
  "channel": "email",
  "email": "cliente@example.com",
  "subject": "Consulta legal urgente",
  "body": "Tengo una pregunta sobre derecho laboral...",
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Response Codes

| Código | Descripción                                             |
| ------ | ------------------------------------------------------- |
| 200    | Mensaje procesado exitosamente                          |
| 400    | Payload inválido (falta channel, phone/email inválidos) |
| 500    | Error interno (BD, OpenAI)                              |

### Response Body (Success)

```json
{
  "status": "success",
  "message_id": "msg_12345",
  "classification": {
    "intent": "laboral",
    "confidence": 0.92,
    "needs_human": false
  },
  "response": "Gracias por contactarnos. Hemos clasificado tu caso como cuestión de derecho laboral. Un abogado se pondrá en contacto en 24 horas.",
  "escalation_to": null
}
```

### Response Body (Error)

```json
{
  "status": "error",
  "code": "INVALID_INPUT",
  "message": "El campo 'phone' es requerido para WhatsApp",
  "details": {
    "channel": "whatsapp",
    "missing_fields": ["phone"]
  }
}
```

### Intenciones soportadas

- `laboral` - Derecho del trabajo
- `mercantil` - Derecho comercial/contratos
- `civil` - Derecho civil (herencias, divorcios, propiedad)
- `administrativo` - Derecho administrativo (AEAT, Administración)
- `penal` - Derecho penal
- `otro` - No clasificable

---

## WF-02: Intake Legal

**Descripción**: Recopila información del cliente y abre expediente automáticamente.

**Endpoint**: `POST /webhook/legal-intake`

### Request Body

```json
{
  "full_name": "Ana María Pérez López",
  "email": "ana.perez@example.com",
  "phone": "+34612345678",
  "case_type": "laboral",
  "description": "Despido injustificado. Trabajé 8 años en la empresa",
  "has_documentation": true,
  "documents_urls": [
    "https://example.com/file1.pdf",
    "https://example.com/file2.pdf"
  ],
  "urgency_level": "alta",
  "expected_budget": 5000,
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Campos Requeridos

- `full_name` (string, min 3 caracteres)
- `case_type` (string, uno de: laboral, mercantil, civil, administrativo, penal)

### Campos Opcionales

- `email` (string, email format)
- `phone` (string, formato internacional)
- `description` (string, min 10 caracteres)
- `has_documentation` (boolean)
- `documents_urls` (array de strings)
- `urgency_level` (string: baja, normal, alta, urgente)
- `expected_budget` (number)

### Response Codes

| Código | Descripción                                   |
| ------ | --------------------------------------------- |
| 200    | Cliente y caso creados exitosamente           |
| 400    | Validación fallida (full_name requerido, etc) |
| 409    | Email ya existe en BD                         |
| 500    | Error interno                                 |

### Response Body (Success)

```json
{
  "status": "success",
  "client": {
    "id": 42,
    "full_name": "Ana María Pérez López",
    "email": "ana.perez@example.com",
    "created_at": "2026-03-03T14:30:00Z"
  },
  "case": {
    "id": 156,
    "case_type": "laboral",
    "status": "abierto",
    "created_at": "2026-03-03T14:30:00Z"
  },
  "next_steps": "Un abogado revisará tu documentación en 24 horas"
}
```

### Response Body (Error - Email Duplicado)

```json
{
  "status": "error",
  "code": "CLIENT_EXISTS",
  "message": "Este email ya está registrado",
  "details": {
    "email": "ana.perez@example.com",
    "existing_client_id": 40,
    "action": "Recuperar expedientes existentes o usar email diferente"
  }
}
```

---

## WF-03: Estado de Caso

**Descripción**: Consulta el estado actual de un caso por ID o contacto del cliente.

**Endpoint**: `POST /webhook/legal-estado`

### Request Body - Opción 1: Por ID del Caso

```json
{
  "case_id": 156,
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Request Body - Opción 2: Por Contacto del Cliente

```json
{
  "phone": "+34612345678",
  "timestamp": "2026-03-03T14:30:00Z"
}
```

O por email:

```json
{
  "email": "ana.perez@example.com",
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Response Codes

| Código | Descripción                  |
| ------ | ---------------------------- |
| 200    | Caso encontrado y recuperado |
| 404    | No existe caso coincidente   |
| 400    | Payload inválido             |
| 500    | Error interno                |

### Response Body (Success)

```json
{
  "status": "success",
  "case": {
    "id": 156,
    "case_type": "laboral",
    "status": "en_negociacion",
    "opening_date": "2026-03-01",
    "expected_close_date": "2026-06-01",
    "assigned_lawyer": "Dr. López García"
  },
  "deadlines": [
    {
      "id": 501,
      "description": "Contestación a demanda",
      "deadline_date": "2026-03-10",
      "status": "pendiente",
      "days_remaining": 7
    }
  ],
  "timeline": [
    {
      "date": "2026-03-01",
      "event": "Caso abierto"
    },
    {
      "date": "2026-03-02",
      "event": "Documentación revisada"
    }
  ]
}
```

### Response Body (Error - No Encontrado)

```json
{
  "status": "error",
  "code": "CASE_NOT_FOUND",
  "message": "No existe expediente para este cliente",
  "details": {
    "search_by": "phone",
    "phone": "+34612345678"
  }
}
```

---

## WF-04: Agenda y Recordatorios

**Descripción**: Crea citas, gestiona reminders, y confirma asistencia.

**Endpoint**: `POST /webhook/legal-agenda`

### Request Body

```json
{
  "case_id": 156,
  "appointment_type": "consulta",
  "scheduled_at": "2026-03-10T14:00:00Z",
  "duration_minutes": 60,
  "notes": "Revisar documentación adicional, traer certificados",
  "assigned_to": "abogado_principal",
  "reminder_before_hours": 24,
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Campos Requeridos

- `case_id` (number)
- `appointment_type` (string: consulta, junta, firma, mediacion)
- `scheduled_at` (ISO 8601 datetime)

### Campos Opcionales

- `duration_minutes` (number, default 60)
- `notes` (string)
- `assigned_to` (string, nombre del abogado)
- `reminder_before_hours` (number, default 24)

### Response Codes

| Código | Descripción              |
| ------ | ------------------------ |
| 200    | Cita creada exitosamente |
| 400    | Validación fallida       |
| 404    | Caso no existe           |
| 500    | Error interno            |

### Response Body (Success)

```json
{
  "status": "success",
  "appointment": {
    "id": 2501,
    "case_id": 156,
    "appointment_type": "consulta",
    "scheduled_at": "2026-03-10T14:00:00Z",
    "status": "programada"
  },
  "reminder": {
    "scheduled_for": "2026-03-09T14:00:00Z",
    "channel": "sms",
    "phone": "+34612345678"
  }
}
```

---

## WF-05: Escalado de Urgencias

**Descripción**: Detecta casos urgentes y escala para atención inmediata.

**Endpoint**: `POST /webhook/legal-urgencias`

### Request Body

```json
{
  "case_id": 156,
  "trigger_type": "deadline_approaching",
  "deadline_date": "2026-03-04",
  "priority_level": "alta",
  "description": "Vence plazo para contestación en 24 horas",
  "risk_score": 0.95,
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Trigger Types Soportados

- `deadline_approaching` - Plazo se acerca
- `client_communication` - Cliente requiere respuesta urgente
- `financial_risk` - Riesgo económico alto
- `jurisdictional` - Cuestión de jurisdicción que requiere urgencia
- `manual_escalation` - Escalación manual de abogado

### Priority Levels

- `baja` - Resolver en próximas 2 semanas
- `normal` - Resolver en próximos 7 días
- `alta` - Resolver en próximas 48 horas
- `urgente` - Acción inmediata (< 24 horas)

### Response Codes

| Código | Descripción                        |
| ------ | ---------------------------------- |
| 200    | Escalación registrada exitosamente |
| 400    | Validación fallida                 |
| 404    | Caso no existe                     |
| 500    | Error interno                      |

### Response Body (Success)

```json
{
  "status": "success",
  "escalation": {
    "id": 3201,
    "case_id": 156,
    "priority_level": "urgente",
    "escalated_to": "socio_principal",
    "timestamp": "2026-03-03T14:30:00Z"
  },
  "notifications_sent": ["email", "slack", "sms"],
  "sla_deadline": "2026-03-04T14:30:00Z"
}
```

---

## WF-06: Borradores Asistidos

**Descripción**: Genera borradores de documentos legales contextualmente.

**Endpoint**: `POST /webhook/legal-borradores`

### Request Body

```json
{
  "case_id": 156,
  "document_template": "demanda_laboral",
  "client_name": "Ana María Pérez López",
  "defendant": "Empresa XYZ S.L.",
  "claims": [
    "Pago de salarios adeudados",
    "Indemnización por daño moral",
    "Costas procesales"
  ],
  "damages_amount": 15000,
  "additional_context": "Cliente despedida sin causa aparente",
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Templates Soportados

- `demanda_laboral` - Demanda por conflictos laborales
- `demanda_civil` - Demanda civil general
- `contestacion_demanda` - Escrito de contestación
- `recurso_apelacion` - Recurso de apelación
- `poder_representacion` - Poder notarial
- `contrato_servicios` - Contrato de representación

### Response Codes

| Código | Descripción                    |
| ------ | ------------------------------ |
| 200    | Borrador generado exitosamente |
| 400    | Validación fallida             |
| 404    | Caso o template no existe      |
| 500    | Error OpenAI o interno         |

### Response Body (Success)

```json
{
  "status": "success",
  "document": {
    "id": 4102,
    "case_id": 156,
    "template": "demanda_laboral",
    "content": "[BORRADOR - CONTENIDO OMITIDO POR BREVEDAD]\n\nLUDO: Don/Doña Ana María Pérez López...",
    "generated_at": "2026-03-03T14:30:00Z"
  },
  "validation_checklist": {
    "tiene_fecha": true,
    "tiene_partes": true,
    "tiene_pretensiones": true,
    "tiene_hechos": true,
    "tiene_firma": false,
    "completitud": 0.92
  },
  "next_steps": "Revisar, completar puntos faltantes, y solicitar firma del cliente"
}
```

---

## WF-07: Facturación y Cobros

**Descripción**: Emite facturas y trackea pagos.

**Endpoint**: `POST /webhook/legal-facturacion`

### Request Body

```json
{
  "case_id": 156,
  "client_id": 42,
  "invoice_type": "horas_profesionales",
  "hours": 10,
  "rate": 150,
  "description": "Consulta inicial + revisión de documentos",
  "due_days": 30,
  "notes": "Pago antes de 30 días para acceder a descuento de 10%",
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Invoice Types

- `horas_profesionales` - Facturación por hora
- `retainer_fee` - Arancel de representación
- `gasto_procesal` - Gastos de procedimiento
- `anticipo` - Anticipo o provisión de fondos
- `descuento` - Nota de crédito/descuento

### Response Codes

| Código | Descripción                 |
| ------ | --------------------------- |
| 200    | Factura creada exitosamente |
| 400    | Validación fallida          |
| 404    | Cliente o caso no existe    |
| 500    | Error interno               |

### Response Body (Success)

```json
{
  "status": "success",
  "invoice": {
    "id": 5601,
    "invoice_number": "FAC-2026-001452",
    "case_id": 156,
    "amount": 1500.0,
    "currency": "EUR",
    "issue_date": "2026-03-03",
    "due_date": "2026-04-02",
    "status": "pendiente"
  },
  "payment_methods": [
    {
      "method": "stripe",
      "url": "https://checkout.stripe.com/...",
      "expires_in_hours": 720
    }
  ],
  "notification_sent_to": "ana.perez@example.com"
}
```

---

## WF-08: Auditoría

**Descripción**: Registra eventos de auditoría para compliance y trazabilidad.

**Endpoint**: `POST /webhook/legal-auditoria`

### Request Body

```json
{
  "actor_type": "usuario",
  "actor_id": "user_001",
  "action": "case_status_update",
  "resource_type": "case",
  "resource_id": 156,
  "metadata": {
    "old_status": "abierto",
    "new_status": "en_negociacion",
    "reason": "Cliente aceptó propuesta de transacción"
  },
  "ip_address": "192.168.1.100",
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Actor Types

- `usuario` - Abogado/staff interno
- `cliente` - Cliente final
- `sistema` - Proceso automatizado
- `integracion` - Sistema externo

### Action Types (Ejemplos)

- `case_created`, `case_updated`, `case_closed`
- `client_created`, `client_updated`
- `document_generated`, `document_signed`
- `payment_received`, `invoice_created`
- `deadline_missed`, `escalation_triggered`

### Response Codes

| Código | Descripción                    |
| ------ | ------------------------------ |
| 200    | Evento registrado exitosamente |
| 400    | Validación fallida             |
| 500    | Error interno                  |

### Response Body (Success)

```json
{
  "status": "success",
  "audit_log": {
    "id": 6801,
    "actor_type": "usuario",
    "actor_id": "user_001",
    "action": "case_status_update",
    "resource_type": "case",
    "resource_id": 156,
    "created_at": "2026-03-03T14:30:00Z"
  },
  "message": "Evento de auditoría registrado correctamente"
}
```

---

## Manejo de Errores Global

Todos los endpoints pueden retornar errores con esta estructura:

```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Descripción legible del error",
  "details": {
    "field": "campo_afectado",
    "expected": "tipo esperado",
    "received": "lo que se recibió"
  },
  "timestamp": "2026-03-03T14:30:00Z"
}
```

### Códigos de Error Comunes

| Código           | Descripción                                    | HTTP |
| ---------------- | ---------------------------------------------- | ---- |
| `INVALID_INPUT`  | Payload no es válido JSON                      | 400  |
| `MISSING_FIELD`  | Campo requerido faltante                       | 400  |
| `INVALID_FORMAT` | Formato de campo incorrecto (email, date, etc) | 400  |
| `DUPLICATE_KEY`  | Violación de constraint único                  | 409  |
| `NOT_FOUND`      | Recurso no existe                              | 404  |
| `UNAUTHORIZED`   | JWT inválido o ausente                         | 401  |
| `INTERNAL_ERROR` | Error no controlado en servidor                | 500  |

---

## Authentication (Producción)

Para producción, agregua JWT a header:

```bash
curl -X POST http://localhost:5678/webhook/legal-intake \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{...}'
```

En n8n, agrega nodo **Function** antes de lógica principal:

```javascript
const token = req.headers.authorization?.split(" ")[1];
if (!token) throw new Error("Missing JWT token");

// Validar token (usaría jsonwebtoken package en node.js)
// const decoded = jwt.verify(token, process.env.JWT_SECRET);
// $json.actor_id = decoded.user_id;

return $json;
```

---

## Rate Limiting

Implementación sugerida en n8n:

```javascript
// Guardar en una variable global o BD
const key = `${req.ip}_${new Date().getHours()}`;
let count = (global[key] || 0) + 1;
global[key] = count;

if (count > 100) {
  throw new Error("Rate limit exceeded: 100 requests/hour");
}
```

Or use middleware como nginx/CloudFlare.

---

## Ejemplos cURL

### WF-01: Recepción

```bash
curl -X POST http://localhost:5678/webhook/legal-recepcion \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "whatsapp",
    "phone": "+34612345678",
    "message": "Hola, necesito ayuda"
  }'
```

### WF-02: Intake

```bash
curl -X POST http://localhost:5678/webhook/legal-intake \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ana Pérez",
    "email": "ana@example.com",
    "case_type": "laboral",
    "description": "Despido injustificado"
  }'
```

---

## Testing Local

Usa el script PowerShell proporcionado:

```bash
cd tests
.\http-payloads.ps1 -BaseUrl "http://localhost:5678" -Verbose
```

Esto testea todos los 8 endpoints con payloads válidos.

---

## Versioning

- **API Version**: 1.0
- **Last Updated**: 2026-03-03
- **n8n Compatibility**: 1.0+

Para cambios breaking en futuro: utilizar versionado en path (`/v2/webhook/...`).
