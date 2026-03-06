# Marketing Skills VSCode Snippets Guide

## ¿Qué son estos snippets?

33 snippets de VSCode que insertan **prompts pre-escritos** optimizados para marketing. Cada snippet activa un "skill" específico del repositorio [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills).

**Categorías:** SEO & Content, CRO, Copy, Paid & Analytics, Growth & Retention, Sales & GTM, Strategy.

---

## Cómo usar los snippets en VSCode

### Insertar un snippet

1. Abre cualquier archivo (markdown, texto, notas)
2. Presiona **Ctrl + Space** (o Cmd + Space en Mac)
3. Busca por prefijo: `mkt-`
4. Selecciona el snippet que quieres
5. Presiona **Enter** para insertar

### Ejemplo: Snippet `mkt-page-cro`

```
📝 Busca: "mkt-page-cro"
↓
✅ Se inserta un prompt de CRO completo
↓
🎯 Llena los campos ${1:...} con tu URL, goal, traffic
↓
📋 Copia el prompt a Copilot Pro

```

---

## Los 33 Snippets por Categoría

### 🔍 SEO & CONTENT MARKETING (6 skills)

| Prefijo                | Skill             | Cuándo usar                                       |
| ---------------------- | ----------------- | ------------------------------------------------- |
| `mkt-seo-audit`        | SEO Audit         | Auditar y diagnosticar problemas SEO              |
| `mkt-ai-seo`           | AI SEO            | Optimizar para ChatGPT, Perplexity, Google Gemini |
| `mkt-site-arch`        | Site Architecture | Planear jerarquía de páginas, URLs, navegación    |
| `mkt-programmatic-seo` | Programmatic SEO  | Generar miles de páginas con templates + data     |
| `mkt-schema-markup`    | Schema Markup     | Añadir/arreglar JSON-LD, Rich snippets            |
| `mkt-content-strategy` | Content Strategy  | Planear estrategia de contenido, calendario       |

---

### 🔄 CRO - Conversion Rate Optimization (6 skills)

| Prefijo              | Skill           | Enfoque                                              |
| -------------------- | --------------- | ---------------------------------------------------- |
| `mkt-page-cro` ⭐    | Page CRO        | Value prop, headlines, CTAs, visual hierarchy        |
| `mkt-signup-cro`     | Signup Flow     | Form optimization, progressive profiling, activation |
| `mkt-onboarding-cro` | Onboarding CRO  | First-run experience, feature discovery, aha moment  |
| `mkt-form-cro`       | Form CRO        | Campos, fricción, validación, copy (NO login)        |
| `mkt-popup-cro`      | Popup CRO       | Modals, overlays, timing, psychology, testing        |
| `mkt-paywall-cro`    | Paywall Upgrade | In-app paywalls, upsells, pricing psychology         |

⭐ = Usa este si no sabes cuál elegir (impacto más alto)

---

### ✍️ CONTENT & COPY (4 skills)

| Prefijo              | Skill          | Cuándo usar                                  |
| -------------------- | -------------- | -------------------------------------------- |
| `mkt-copywriting`    | Copywriting    | Escribir marketing copy claro, compelling    |
| `mkt-copy-editing`   | Copy Editing   | Editar/mejorar copy existente                |
| `mkt-cold-email`     | Cold Email     | Escribir B2B cold emails + follow-ups        |
| `mkt-social-content` | Social Content | LinkedIn, Twitter, Instagram, TikTok content |

---

### 📊 PAID & MEASUREMENT (3 skills)

| Prefijo           | Skill              | Objetivo                                          |
| ----------------- | ------------------ | ------------------------------------------------- |
| `mkt-paid-ads`    | Paid Ads           | Google, Meta, LinkedIn, Twitter campaigns         |
| `mkt-ad-creative` | Ad Creative        | Headlines, descriptions, visuals, A/B testing     |
| `mkt-ab-test`     | A/B Testing        | Planear & diseñar tests, hypothesis, significance |
| `mkt-analytics`   | Analytics Tracking | Setup Google Analytics, events, dashboards        |

---

### 🚀 GROWTH & RETENTION (3 skills)

| Prefijo         | Skill              | Propósito                                      |
| --------------- | ------------------ | ---------------------------------------------- |
| `mkt-referral`  | Referral Program   | Crear programa de referral para growth viral   |
| `mkt-churn`     | Churn Prevention   | Reducir churn, win-back, save offers           |
| `mkt-free-tool` | Free Tool Strategy | Build herramientas gratuitas para lead gen/SEO |

---

### 💼 SALES & GTM (4 skills)

| Prefijo            | Skill                 | Enfoque                                       |
| ------------------ | --------------------- | --------------------------------------------- |
| `mkt-revops`       | RevOps                | Lead scoring, sales handoff, CRM, SLAs        |
| `mkt-sales-enable` | Sales Enablement      | Pitch decks, one-pagers, objection handling   |
| `mkt-launch`       | Launch Strategy       | Product launches, feature announcements       |
| `mkt-pricing`      | Pricing Strategy      | Pricing, packaging, value-based, psychology   |
| `mkt-competitor`   | Competitor Comparison | Crear competitor comparison/alternative pages |

---

### 🧠 STRATEGY (3 skills)

| Prefijo          | Skill                        | Cuándo usar                                      |
| ---------------- | ---------------------------- | ------------------------------------------------ |
| `mkt-ideas`      | Marketing Ideas              | Brainstorm creativo de ideas marketing           |
| `mkt-psychology` | Marketing Psychology         | Aplicar scarcity, social proof, reciprocity, etc |
| `mkt-context`    | 🔑 Product Marketing Context | **FOUNDATIONAL - Leer/crear primero**            |

---

## 🔑 Skill Foundational: Product Marketing Context

**IMPORTANTE:** El skill `mkt-context` es **lean by all other skills**.

Antes de usar otros skills, **crea tu Product Marketing Context**:

```bash
# Archivo: .agents/product-marketing-context.md
```

**Contenido mínimo:**

```markdown
# Product Marketing Context

## Product

- Name: [Nombre producto]
- Problem solved: [Qué problema]
- Differentiators: [# 1, 2, 3]

## Audience

- Persona 1: [Título, pain points]
- Persona 2: [Título, pain points]
- Objections: [Top 3]

## Positioning

- Positioning statement: [one sentence]
- Message pillars: [Top 3 themes]
- vs Competitors: [positioning diferente]
```

**Tip:** Una vez definido, otros skills van a leerlo automáticamente y te harán preguntas más específicas.

---

## Pasos prácticos: Tutorial paso a paso

### Paso 1: Crea Product Marketing Context (baseline)

1. Presiona Ctrl+Space → Busca `mkt-context`
2. Inserta el snippet
3. Copia el template a un archivo: `.agents/product-marketing-context.md`
4. Llena con tu producto

### Paso 2: Usa un skill específico

Ejemplo: **Optimizar una landing page con `mkt-page-cro`**

1. Presiona Ctrl+Space → Busca `mkt-page-cro`
2. Inserta el snippet
3. Llena los placeholders:
   - URL de tu página o HTML
   - Tu goal de conversión (signup, purchase)
   - De dónde viene el tráfico
4. Copia a Copilot Pro
5. Obtén recomendaciones priorizadas por impacto

### Paso 3: Itera y encadena

Si obtuviste recomendaciones de CRO pero necesitas **copy mejorado**:

- Usa `mkt-copywriting` para ese tema

Si la página tiene **muchas formas**:

- Usa `mkt-form-cro` complementario

Si quieres **A/B test** de cambios:

- Usa `mkt-ab-test` para planificar experimento

---

## Atajos rápidos: Busca por caso de uso

| Quiero...                      | Usa estos snippets en orden                                 |
| ------------------------------ | ----------------------------------------------------------- |
| Mejorar conversiones en página | `mkt-page-cro` → `mkt-copywriting` → `mkt-ab-test`          |
| Optimizar signup/trial         | `mkt-signup-cro` → `mkt-onboarding-cro`                     |
| Campaña de paid ads            | `mkt-paid-ads` → `mkt-ad-creative` → `mkt-ab-test`          |
| Contenido SEO                  | `mkt-site-arch` → `mkt-content-strategy` → `mkt-seo-audit`  |
| Email marketing                | `mkt-copywriting` → `mkt-cold-email` o `mkt-email-sequence` |
| Retener usuarios               | `mkt-churn` → `mkt-onboarding-cro` → `mkt-referral`         |
| Lanzar producto                | `mkt-launch` → `mkt-sales-enable` → `mkt-pricing`           |

---

## 📂 Dónde están los snippets

- **Archivo:** `.vscode/marketing-skills.code-snippets`
- **Ubicación absoluta:** `C:\Users\jrosario\OneDrive - Direccion General de Presupuesto Digepres\Desktop\proy\.vscode\marketing-skills.code-snippets`

Para editarlos:

1. Abre `.vscode/marketing-skills.code-snippets`
2. Modifica los `"body"` arrays (campos del prompt)
3. Guarda (Ctrl+S) - VSCode recarga automáticamente

---

## 📖 Dónde están los Skills origen

Las skills originales están en:

```
C:\Users\jrosario\marketingskills\skills\
├── ab-test-setup\
├── ad-creative\
├── ai-seo\
├── analytics-tracking\
├── churn-prevention\
├── cold-email\
├── competitor-alternatives\
├── content-strategy\
├── copy-editing\
├── copywriting\
├── email-sequence\
├── form-cro\
├── free-tool-strategy\
├── launch-strategy\
├── marketing-ideas\
├── marketing-psychology\
├── onboarding-cro\
├── page-cro\
├── paid-ads\
├── paywall-upgrade-cro\
├── popup-cro\
├── pricing-strategy\
├── product-marketing-context\
├── programmatic-seo\
├── referral-program\
├── revops\
├── sales-enablement\
├── schema-markup\
├── seo-audit\
├── signup-flow-cro\
├── site-architecture\
└── social-content\
```

Accede a ellos si quieres leer la documentación full de cada skill.

---

## 💡 Tips & Tricks

### Contextualización: Copy-paste a Copilot

Cada snippet genera un **prompt completo listo para usar**. Puedes:

- Copiar directamente a Copilot Pro / ChatGPT
- O guardar en un archivo `.md` para análisis offline

### Marketing Skills se conectan entre sí

Ejemplo: Si tienes una página que no convierte →

1. **`mkt-page-cro`** te da estructura, problemas
2. **`mkt-copywriting`** mejora el texto
3. **`mkt-ab-test`** te ayuda a validar cambios
4. **`mkt-analytics`** te da métricas post-launch

### Primero: Product Marketing Context

**IMPORTANTE:** Si es la PRIMERA vez, crea `product-marketing-context.md` primero. Todos los otros skills van a leerla y van a ser más efectivos.

---

## Siguientes pasos

- [ ] Crea `.agents/product-marketing-context.md` con tu producto
- [ ] Elige 1-2 skills según tu prioridad (ej: `mkt-page-cro` si necesitas conversiones)
- [ ] Inserta el snippet, llena placeholders, copia a Copilot
- [ ] Implementa las recomendaciones
- [ ] Repite con otros skills según lo que siga

---

## Preguntas frecuentes

**P: ¿Puedo personalizar los snippets?**  
R: Sí. Abre `.vscode/marketing-skills.code-snippets`, edita el `"body"`, guarda. VSCode recarga automáticamente.

**P: ¿Qué skills combinar?**  
R: Ve tabla "Atajos rápidos" arriba. O lee el README del repo original: [github.com/coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills).

**P: ¿Debo usar todos los 33 skills?**  
R: No. Empieza con 1-2 según tu prioridad inmediata. Los skills están diseñados para encadenarse si los necesitas.

---

## Más recursos

- [README del repo](https://github.com/coreyhaines31/marketingskills)
- [Documentación de skills originales](https://github.com/coreyhaines31/marketingskills/tree/main/skills)
- [Coding for Marketers](https://codingformarketers.com) - Companion guide
- [Conversion Factory](https://conversionfactory.co) - Agencia por Corey Haines

---

**¿Listo?** Inserta `mkt-context` ahora para comenzar. 🚀
