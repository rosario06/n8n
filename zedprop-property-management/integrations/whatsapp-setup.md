# WhatsApp Integration Setup Guide

## 🔧 Opción 1: Twilio (Recomendado para Desarrollo)

### Paso 1: Crear Cuenta Twilio

1. Ve a https://www.twilio.com/en-us/try-twilio
2. Crea cuenta gratuita (obtiene $15 crédito)
3. Verifica email y número celular

### Paso 2: Obtener Credenciales

1. Dashboard → Account Info
2. Copia tu **Account SID**
3. Copia tu **Auth Token**
4. Ve a Messaging → Try it out → WhatsApp
5. Verifica tu número (necesitarás código)
6. Obtén número Twilio WhatsApp (formato: `whatsapp:+1234567890`)

### Paso 3: Configurar n8n

```json
{
  "node_type": "Twilio",
  "action": "Send Message",
  "credentials": {
    "accountSid": "ACxxxxxxxxxxxxxxxxxxxxx",
    "authToken": "your_auth_token_here",
    "fromNumber": "whatsapp:+1234567890"
  },
  "message": {
    "to": "whatsapp:+destino",
    "body": "Message content"
  }
}
```

### Paso 4: Setup Webhook (Recibir Mensajes)

1. En Twilio Console → Messaging → Settings
2. URL: `https://tu-n8n.com/webhook/whatsapp-twilio`
3. HTTP POST
4. Método: POST
5. Guarda

### Ventajas Twilio

✅ Fácil de configurar  
✅ Excelente documentación  
✅ Soporte multimedia (fotos, archivos)  
✅ Bueno para desarrollo

### Limitaciones Twilio

⚠️ Requiere verificación de número destino (sandbox)  
⚠️ Límite 50 mensajes/día con cuenta free

---

## 🔓 Opción 2: Meta WhatsApp Business API (Producción)

### Requisitos

- Negocio registrado
- Página Facebook
- Número WhatsApp Business
- ID de aplicación Meta
- Revisión de Meta (2-7 días)

### Paso 1: Registrar Negocio

1. Ve a business.facebook.com
2. Crea cuenta si no tienes
3. Verifica tu negocio

### Paso 2: Crear App

1. Facebook Developers → Create App
2. Selecciona "Business"
3. Nombre tu app (ej: "ZedProp WhatsApp")
4. Copia **App ID** y **App Secret**

### Paso 3: Agregar WhatsApp Product

1. En tu app → Products
2. Agrega "WhatsApp" product
3. Configura Webhooks:
   - **Callback URL**: https://tu-n8n.com/webhook/whatsapp-meta
   - **Verify Token**: crear uno seguro (32+ caracteres)

### Paso 4: Conectar Número WhatsApp

1. Settings → Phone Number IDs
2. Obtén tu **Phone Number ID**
3. Obtén **Business Account ID**
4. Genera **Access Token** (válido 24 horas)

### Paso 5: Configurar en n8n

```json
{
  "node_type": "HTTP Request",
  "url": "https://graph.instagram.com/v18.0/[PHONE_ID]/messages",
  "headers": {
    "Authorization": "Bearer [ACCESS_TOKEN]",
    "Content-Type": "application/json"
  },
  "body": {
    "messaging_product": "whatsapp",
    "to": "recipient_phone_number",
    "type": "text",
    "text": {
      "body": "Message content"
    }
  },
  "method": "POST"
}
```

### Ventajas Meta

✅ Oficial y autorizado  
✅ Mejor deliverability  
✅ Sin limites de sandbox  
✅ Mejor estadísticas  
✅ Integración con Facebook Ads

### Limitaciones Meta

⚠️ Requiere verificación de negocio  
⚠️ Configuración más compleja  
⚠️ Revisión puede tardar días

---

## 📝 Webhook Configuration

### Estructura de Mensaje Recibido (Twilio)

```json
{
  "messages": [
    {
      "from": "+1234567890",
      "body": "Hola, quiero mi contrato",
      "type": "text", // o "image", "document"
      "timestamp": 1234567890000,
      "media": {
        "url": "https://...", // si incluye foto/archivo
        "type": "image/jpeg"
      }
    }
  ]
}
```

### Estructura de Mensaje Recibido (Meta)

```json
{
  "entry": [
    {
      "changes": [
        {
          "value": {
            "messages": [
              {
                "from": "1234567890",
                "type": "text",
                "text": {
                  "body": "Hola, quiero mi contrato"
                },
                "timestamp": "1234567890"
              }
            ],
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "1234567890"
              }
            ]
          }
        }
      ]
    }
  ]
}
```

### n8n Webhook Node Configuración

```
1. Create Webhook Listener
   - Method: POST
   - Path: /webhook/whatsapp-{provider}
   - Response code: 200 (importante!)

2. Add validation:
   - Check X-Twilio-Signature header OR
   - Check request token matches VERIFY_TOKEN

3. Respondera inmediatamente (ack):
   - Send 200 OK response en <1 segundo
   - Procesar mensaje en background
```

---

## 🔐 Seguridad

### Validación de Webhook (Twilio)

```javascript
// npm install twilio
const twilio = require('twilio');

const validateTwilioRequest = (req, process.env.TWILIO_AUTH_TOKEN) => {
  const signature = req.get('X-Twilio-Signature');
  const url = req.protocol + '://' + req.get('host') + req.url;
  const isValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    signature,
    url,
    req.body
  );
  return isValid;
};
```

### Validación de Webhook (Meta)

```javascript
const validateMetaRequest = (req, verifyToken) => {
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (token === verifyToken) {
    return challenge; // Meta valida tu servidor
  }
  return "Invalid token";
};
```

---

## 📞 Pruebas Locales

### Opción 1: Ngrok (Exponer localhost)

```bash
# Instala ngrok
# https://ngrok.com/download

# Inicia servicio
ngrok http 5678  # Puerto donde corre n8n

# Output:
# Forwarding    https://abc123.ngrok.io -> http://localhost:5678

# Usa en Twilio/Meta:
# https://abc123.ngrok.io/webhook/whatsapp-twilio
```

### Opción 2: Postman (Simular Mensajes)

```json
POST https://tu-n8n.com/webhook/whatsapp-twilio

{
  "messages": [{
    "from": "+1234567890",
    "body": "Test message",
    "type": "text",
    "timestamp": 1234567890
  }]
}
```

---

## 📊 Monitoreo

### Métricas a Trackear

- Mensajes recibidos/enviados por hora
- Tasa de entrega (delivery rate)
- Tasa de lectura (read rate)
- Tiempo de respuesta promedio
- Errores de webhook

### Dashboard

Usa Airtable/Database para loguear:

- Timestamp
- Remitente
- Tipo mensaje
- Respuesta
- Tiempo procesamiento
- Status (success/error)

---

## ✅ Checklist de Despliegue

- [ ] Credenciales guardadas en `.env`
- [ ] Webhook URL configurada en proveedor
- [ ] Webhook validado (test message enviado)
- [ ] n8n listening en puerto correcto
- [ ] SSL/HTTPS habilitado
- [ ] Logs configurados
- [ ] Rate limiting activo
- [ ] Error handling implementado
- [ ] Mensajes de bienvenida configurados
- [ ] Soporte contactable (fallback)

---

## 🆘 Troubleshooting

| Problema                 | Solución                                |
| ------------------------ | --------------------------------------- |
| "Invalid webhook secret" | Regenera token, asegúrate que coincide  |
| "Message not delivered"  | Verifica número formato (+1234...)      |
| "Webhook timeout"        | Procesa en background, responde rápido  |
| "Rate limited"           | Twilio free = 50/día; usa pagopara más  |
| "Permission denied"      | Verifica credenciales y tokens vigentes |

---

**Siguiente**: Consulta [SETUP_GUIDE.md](../docs/SETUP_GUIDE.md) para pasos completos de instalación.
