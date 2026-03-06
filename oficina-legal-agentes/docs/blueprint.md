# Blueprint técnico - Oficina Legal con Agentes

## 1) Arquitectura lógica

- **Canales de entrada:** WhatsApp, web, email.
- **Gateway de mensajes:** n8n Webhook.
- **Router de intención:** clasifica mensaje (consulta, cita, estado de caso, cobro, urgencia).
- **Agentes especializados:** recepción, intake, seguimiento, facturación/citas.
- **Capa de datos:** PostgreSQL + pgvector + storage documental.
- **Panel humano:** bandeja de revisión y aprobación.

## 2) Agentes propuestos

1. **Agente de recepción**
   - Saludo, identificación, consentimiento de datos, clasificación inicial.
2. **Agente de intake legal**
   - Recolecta hechos, documentos, fechas, contraparte, urgencia.
3. **Agente de seguimiento**
   - Estado de expediente, próximos hitos, recordatorios y faltantes.
4. **Agente de agenda/facturación**
   - Citas, recordatorios, confirmaciones, emisión y seguimiento de facturas.
5. **Agente de borradores**
   - Prepara borradores de escritos/correos con validación obligatoria de abogado.

## 3) Guardrails obligatorios

- No prometer resultados jurídicos.
- No emitir “consejo definitivo” sin revisión humana.
- Etiquetar salidas como “borrador” cuando aplique.
- Escalar a humano si hay: plazos críticos, potencial conflicto de interés, o riesgo reputacional.

## 4) Flujo de interacción mínimo

1. Cliente escribe por WhatsApp.
2. Recepción autentica y clasifica.
3. Intake recopila datos y crea caso.
4. Router asigna abogado responsable.
5. Seguimiento automatiza recordatorios y estados.
6. Documentos salen como borrador para revisión humana.

## 5) KPI iniciales

- Tiempo medio de primera respuesta.
- Porcentaje de intake completado sin intervención humana.
- Tasa de citas agendadas vs consultas entrantes.
- Tiempos de cumplimiento de plazos.
- Satisfacción del cliente (NPS/CSAT).
