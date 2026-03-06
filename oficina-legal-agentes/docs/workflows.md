# Workflows n8n recomendados (MVP)

## WF-01 Recepción omnicanal

- Trigger: Webhook (WhatsApp/Web/Email)
- Pasos: normalizar payload -> clasificar intención -> crear/actualizar cliente -> registrar conversación -> enrutar
- Salidas: intent, requiere_humano, acción_siguiente

## WF-02 Intake legal automático

- Trigger: acción_siguiente=crear_intake
- Pasos: preguntas guiadas -> validar campos mínimos -> crear caso -> crear checklist documental
- Salidas: case_id, prioridad, faltantes
- Estado: implementado en `n8n/workflows/wf-02-intake-template.json`

## WF-03 Estado de caso para cliente

- Trigger: acción_siguiente=consultar_estado
- Pasos: consultar caso -> consultar próximos plazos -> generar respuesta cliente
- Salidas: estado actual, próximo hito, tareas cliente
- Estado: implementado en `n8n/workflows/wf-03-estado-caso-template.json`

## WF-04 Agenda y recordatorios

- Trigger: acción_siguiente=agendar + cron diario
- Pasos: crear cita -> notificar cliente -> recordatorio T-24h y T-2h
- Salidas: cita confirmada, recordatorios enviados
- Estado: implementado en `n8n/workflows/wf-04-agenda-recordatorios-template.json`

## WF-05 Detección de urgencia y escalado humano

- Trigger: cualquier mensaje entrante
- Reglas: plazo <=72h, conflicto potencial, tono de crisis
- Pasos: crear alerta interna -> notificar abogado -> pausar automatización sensible
- Estado: implementado en `n8n/workflows/wf-05-escalado-urgencias-template.json`

## WF-06 Borradores asistidos

- Trigger: solicitud abogado o estado del caso
- Pasos: cargar contexto expediente + RAG -> generar borrador -> enviar a cola de revisión
- Salidas: borrador versionado, checklist validación
- Estado: implementado en `n8n/workflows/wf-06-borradores-template.json`

## WF-07 Facturación y cobros

- Trigger: emisión de honorarios + cron
- Pasos: crear factura -> enviar -> seguimiento de pago -> recordatorios
- Salidas: factura, estado cobro, historial de contacto
- Estado: implementado en `n8n/workflows/wf-07-facturacion-template.json`

## WF-08 Auditoría de actividad

- Trigger: eventos de workflows
- Pasos: guardar evento -> guardar actor -> guardar timestamp
- Salidas: bitácora auditable
- Estado: implementado en `n8n/workflows/wf-08-auditoria-template.json`
