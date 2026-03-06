# n8n-skills VSCode Snippets Guide

## ¿Qué son estos snippets?

7 snippets de VSCode que insertan **prompts pre-escritos** optimizados para usar con Copilot Pro (o Claude API) al construir workflows n8n. Cada snippet activa un "skill" específico del repositorio [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills).

---

## Cómo usar los snippets en VSCode

### Insertar un snippet

1. Abre cualquier archivo (markdown, texto, comentario en código)
2. Presiona **Ctrl + Space** (o Cmd + Space en Mac)
3. Busca por prefijo: `n8n-`
4. Selecciona el snippet que quieres (verás la descripción)
5. Presiona **Enter** o **Tab** para insertar

### Ejemplo: Snippet `n8n-expression`

```
📝 Busca: "n8n-expression"
↓
✅ Se inserta un prompt completo con placeholders
↓
🎯 Llena los campos ${1:...} con tu contexto
↓
📋 Copia el prompt a Copilot Pro
```

---

## Los 7 Snippets

### 1️⃣ `n8n-expression`

- **Prefijo:** `n8n-expression`
- **Propósito:** Dominar expresiones n8n (`{{ }}`)
- **Cuándo usar:** Necesitas acceder datos con `$json.body`, mappear campos, usar variables
- **Gotcha clave:** Webhook data SIEMPRE está en `$json.body`

### 2️⃣ `n8n-mcp`

- **Prefijo:** `n8n-mcp`
- **Propósito:** Usar herramientas n8n-mcp eficientemente (búsqueda nodos, validación, templates)
- **Cuándo usar:** Buscas un nodo específico, necesitas config avanzada, validar workflow
- **Nota:** Formato correcto es `n8n-nodes-base.nombreNodo`

### 3️⃣ `n8n-pattern`

- **Prefijo:** `n8n-pattern`
- **Propósito:** Elegir arquitectura correcta (5 patrones: webhook, API, DB, AI, scheduled)
- **Cuándo usar:** Planificas un workflow nuevo desde cero
- **Salida esperada:** Diagrama ASCII, nodos clave, consideraciones de idempotencia

### 4️⃣ `n8n-validate`

- **Prefijo:** `n8n-validate`
- **Propósito:** Diagnosticar y arreglar errores de validación
- **Cuándo usar:** Validación falla, no sabes por qué
- **Entrega:** Causa raíz + 2-3 correcciones + test

### 5️⃣ `n8n-node`

- **Prefijo:** `n8n-node`
- **Propósito:** Configurar nodos correctamente (properties dependientes de operation)
- **Cuándo usar:** Necesitas setup específico de un nodo (ej: postgres executeQuery)
- **Nota:** Las properties dependen de la `operation` elegida

### 6️⃣ `n8n-code-js`

- **Prefijo:** `n8n-code-js`
- **Propósito:** Escribir JavaScript correcto en Code nodes
- **Cuándo usar:** Necesitas transformar datos, hacer HTTP requests, procesar payloads
- **Gotcha clave:** Return format es `[{ json: { ...output } }]` (array de items)
- **Funciones built-in:** `$helpers.httpRequest()`, `DateTime`, `$jmespath()`

### 7️⃣ `n8n-code-py`

- **Prefijo:** `n8n-code-py`
- **Propósito:** Python en Code nodes (muy limitado)
- **Cuándo usar:** Raramente (usa JS 95% de veces)
- **Limitación crítica:** SIN librerías externas (solo stdlib: json, datetime, re, etc)
- **Para HTTP:** Cambia a JavaScript

---

## Pasos prácticos: Prueba ahora

### Paso 1: Abre un archivo de prueba

```bash
# Crea o abre un archivo .txt en el workspace
# Ej: C:\...\proy\n8n-test.txt
```

### Paso 2: Inserta el snippet `n8n-pattern`

1. Presiona **Ctrl + Space**
2. Busca `n8n-pattern`
3. Presiona **Enter**

### Paso 3: Rellena los placeholders

Verás campos como `${1:Describe el caso de uso...}`. VS Code te los resalta en orden:

- Campo 1: Describe tu caso de uso (ej: "webhook que recibe datos de API y los inserta en PostgreSQL")
- Campo 2: Qué patrón recomiendas
- etc.

### Paso 4: Copia al Copilot Pro

1. Selecciona todo el texto insertado
2. Cópialo (Ctrl + C)
3. Abre [https://chatgpt.com](https://chatgpt.com) o tu cliente de Copilot
4. Pega el prompt
5. Presiona **Enter** y espera la respuesta

### Paso 5: Mejora iterativa

- Si el resultado no es perfecto, copypaste la respuesta en otro snippet relevante
- Ej: si obtuviste nodos pero errores de validación → usa `n8n-validate`

---

## Atajos rápidos

| Prefijo          | Skill              | Caso de uso                      |
| ---------------- | ------------------ | -------------------------------- |
| `n8n-expression` | Expression Syntax  | Mapeos de datos con `{{ }}`      |
| `n8n-mcp` ⭐     | MCP Tools Expert   | Buscar nodos, templates, validar |
| `n8n-pattern`    | Workflow Patterns  | Diseñar workflow nuevo           |
| `n8n-validate`   | Validation Expert  | Errores en validación            |
| `n8n-node`       | Node Configuration | Configurar un nodo específico    |
| `n8n-code-js`    | Code JavaScript    | Código en Code node              |
| `n8n-code-py`    | Code Python        | (Raro) Código Python en n8n      |

⭐ = Usa este primero si no sabes cuál elegir

---

## Dónde están los snippets

- **Archivo:** `.vscode/n8n-skills.code-snippets`
- **Ubicación absoluta:** `C:\Users\jrosario\OneDrive - Direccion General de Presupuesto Digepres\Desktop\proy\.vscode\n8n-skills.code-snippets`

Si necesitas editarlos:

1. Abre `.vscode/n8n-skills.code-snippets` en VSCode
2. Modifica los campos `"body"` (arrays de strings)
3. Guarda (Ctrl + S)
4. VSCode recarga automáticamente

---

## Dónde están los Skills origen (Claude/n8n-mcp)

Las skills originales están en:

```
C:\Users\jrosario\.claude\skills\
├── n8n-expression-syntax\
├── n8n-mcp-tools-expert\
├── n8n-node-configuration\
├── n8n-code-javascript\
├── n8n-code-python\
├── n8n-validation-expert\
└── n8n-workflow-patterns\
```

Estos pueden usarse directamente en Claude Code o con el MCP server n8n-mcp.

---

## Tips & Tricks

### Copyleft: Prompts están listos para reutilizar

- Cada snippet genera un prompt válido sin ediciones
- Si quieres, personaliza los placeholders antes de insertar

### Combina snippets

- Caso: necesitas patrón + configuración → usa `n8n-pattern` → luego `n8n-node` con el nodo específico
- Los snippets están hechos para encadenarse

### Debugging rápido

- Error en validación → `n8n-validate`
- Código JS roto → `n8n-code-js` + pega el error
- Expresión no funcionan → `n8n-expression` + pega el payload

---

## Siguientes pasos

- [ ] Prueba `n8n-pattern` para un workflow que necesites
- [ ] Prueba `n8n-mcp` para buscar un nodo específico
- [ ] Prueba `n8n-validate` si encuentras errores
- [ ] Comparte feedback en [issues del repo](https://github.com/czlonkowski/n8n-skills/issues)

---

**¿Preguntas?** Revisa:

- [README del repo n8n-skills](https://github.com/czlonkowski/n8n-skills)
- [Documentación de n8n](https://docs.n8n.io/)
- [n8n-mcp GitHub](https://github.com/czlonkowski/n8n-mcp)
