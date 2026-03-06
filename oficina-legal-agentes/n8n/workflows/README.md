# Plantillas de workflows n8n

Este directorio contiene plantillas conceptuales para construir los workflows del MVP.

## Convención sugerida

- `wf-01-recepcion`
- `wf-02-intake`
- `wf-03-estado-caso`
- `wf-04-agenda-recordatorios`
- `wf-05-escalado-urgencias`
- `wf-06-borradores`
- `wf-07-facturacion`
- `wf-08-auditoria`

## Recomendación práctica

1. Construye primero WF-01 y WF-02.
2. Agrega logging en cada nodo crítico.
3. Valida con datos ficticios.
4. Activa producción por etapas.

## Templates listos

- `wf-01-recepcion-template.json`
- `wf-02-intake-template.json`
- `wf-03-estado-caso-template.json`
- `wf-04-agenda-recordatorios-template.json`
- `wf-05-escalado-urgencias-template.json`
- `wf-06-borradores-template.json`
- `wf-07-facturacion-template.json`
- `wf-08-auditoria-template.json`

## Importar en n8n

1. En n8n, crea workflow nuevo.
2. Menú `...` → `Import from File`.
3. Selecciona el template JSON.
4. Configura credenciales de PostgreSQL en los nodos `postgres`.
5. Activa el workflow cuando pase pruebas.

## Pruebas rápidas

### WF-02 Intake

POST a `/webhook/legal-intake` con:

```json
{
  "full_name": "Ana Perez",
  "phone": "+18095550111",
  "email": "ana@example.com",
  "consent_data_processing": true,
  "matter_type": "laboral",
  "priority": "alta",
  "summary": "Despido sin prestaciones",
  "preferred_channel": "whatsapp",
  "source_channel": "whatsapp"
}
```

### WF-03 Estado de caso

POST a `/webhook/legal-estado-caso` con `case_id`:

```json
{
  "case_id": 1
}
```

o por contacto:

```json
{
  "phone": "+18095550111"
}
```

### WF-04 Agenda

```json
{
  "client_id": 1,
  "case_id": 1,
  "starts_at": "2026-03-04T14:00:00Z",
  "ends_at": "2026-03-04T14:30:00Z",
  "location_type": "virtual",
  "meeting_link": "https://meet.example.com/abc"
}
```

### WF-05 Urgencias

```json
{
  "case_id": 1,
  "text": "Tengo audiencia mañana urgente",
  "deadline_in_hours": 24,
  "source_channel": "whatsapp"
}
```

### WF-06 Borradores

```json
{
  "case_id": 1,
  "doc_type": "correo_cliente",
  "instructions": "Redacta actualización clara del estado del caso"
}
```

### WF-07 Facturación

```json
{
  "client_id": 1,
  "case_id": 1,
  "amount": 3500,
  "currency": "DOP",
  "due_date": "2026-03-20"
}
```

### WF-08 Auditoría

```json
{
  "actor_type": "agent",
  "actor_id": "wf_02_intake",
  "action": "case_created",
  "resource_type": "case",
  "resource_id": "1",
  "metadata": { "source": "webhook" }
}
```
