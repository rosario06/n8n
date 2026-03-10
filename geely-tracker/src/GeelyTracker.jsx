import { useState, useEffect } from "react";
import { saveIngreso, saveGasto, saveAgentAnalysis, getAgentAnalysis, testConnection } from "./pgClient";

const META_TOTAL = 300000;
const SUELDO = 95000;
const MESES_RESTANTES = 9;
const META_MENSUAL = Math.ceil(META_TOTAL / MESES_RESTANTES);

const FUENTES_INGRESO = [
  "Automatización n8n",
  "Agente IA WhatsApp",
  "Mantenimiento cliente",
  "Curso Hotmart",
  "Flujos Gumroad",
  "Power BI / Dashboard",
  "Freelance Upwork",
  "Clases / Mentoría",
  "Bootcamp",
  "Venta activos",
  "Otro",
];
const CATEGORIAS_GASTO = [
  "Alimentación",
  "Transporte / Gasolina",
  "Servicios (luz, agua, internet)",
  "Entretenimiento",
  "Ropa / Personal",
  "Salud",
  "VPS / Herramientas tech",
  "Suscripciones",
  "Familia / Dependientes",
  "Ahorro Corolla",
  "Otro",
];

const PLANES_ALTERNATIVOS = [
  {
    id: "n8n_basico",
    nombre: "Automatización básica n8n",
    ingreso: 15000,
    horas: 5,
    dificultad: "Baja",
    descripcion: "1 flujo por semana para PYMEs locales",
    nicho: "Restaurantes, tiendas, clínicas",
  },
  {
    id: "agente_ia",
    nombre: "Agente IA WhatsApp",
    ingreso: 32000,
    horas: 8,
    dificultad: "Media",
    descripcion: "Bot completo con IA para atención al cliente",
    nicho: "Clínicas, inmobiliarias, academias",
  },
  {
    id: "curso_hotmart",
    nombre: "Curso grabado Hotmart",
    ingreso: 20000,
    horas: 3,
    dificultad: "Media",
    descripcion: "Ventas pasivas 24/7 sin atender clientes",
    nicho: "n8n, SQL, Power BI en español",
  },
  {
    id: "powerbi",
    nombre: "Dashboards Power BI",
    ingreso: 12000,
    horas: 4,
    dificultad: "Baja",
    descripcion: "2-3 dashboards mensuales para PYMEs",
    nicho: "Contadores, empresas, restaurantes",
  },
  {
    id: "upwork",
    nombre: "Freelance Upwork (.NET/SQL)",
    ingreso: 40000,
    horas: 10,
    dificultad: "Alta",
    descripcion: "Proyectos internacionales en USD",
    nicho: "Desarrollo, bases de datos, APIs",
  },
  {
    id: "clases",
    nombre: "Clases / Mentoría online",
    ingreso: 16000,
    horas: 6,
    dificultad: "Baja",
    descripcion: "4 alumnos × RD$4,000 al mes",
    nicho: "SQL, Power BI, certificaciones MS",
  },
  {
    id: "mantenimiento",
    nombre: "Mantenimiento mensual clientes",
    ingreso: 20000,
    horas: 4,
    dificultad: "Baja",
    descripcion: "Ingresos recurrentes sin buscar clientes nuevos",
    nicho: "Clientes anteriores de automatización",
  },
  {
    id: "gumroad",
    nombre: "Plantillas n8n en Gumroad",
    ingreso: 6000,
    horas: 2,
    dificultad: "Baja",
    descripcion: "Flujos prefabricados vendidos pasivamente",
    nicho: "Automatización, integraciones",
  },
];

const TAREAS_SEMANALES = [
  {
    semana: 1,
    mes: "Marzo",
    tareas: [
      "Instalar Postgres en Coolify",
      "Conectar n8n con WhatsApp Business API",
      "Crear cuenta Hotmart como productor",
      "Crear perfil Fiverr con stack n8n + IA",
    ],
  },
  {
    semana: 2,
    mes: "Marzo",
    tareas: [
      "Construir flujo demo: Lead capture → Sheets → Email",
      "Documentar flujo con capturas para portafolio",
      "Publicar post en LinkedIn sobre automatización",
      "Contactar 3 negocios locales para diagnóstico gratis",
    ],
  },
  {
    semana: 3,
    mes: "Marzo",
    tareas: [
      "Construir bot demo WhatsApp + IA",
      "Grabar video de 3 min mostrando el bot",
      "Publicar en grupos Facebook: Empresarios RD, PYMEs DO",
      "Definir precio de lanzamiento: RD$12,000 automatización básica",
    ],
  },
  {
    semana: 4,
    mes: "Abril",
    tareas: [
      "Ofrecer diagnóstico gratis a 5 negocios",
      "Cerrar primer cliente (meta: RD$12,000-18,000)",
      "Configurar Gumroad y subir primer flujo",
      "Actualizar LinkedIn con certificación Generative AI Leader",
    ],
  },
  {
    semana: 5,
    mes: "Abril",
    tareas: [
      "Entregar primer proyecto cliente",
      "Pedir testimonio en video al cliente",
      "Iniciar grabación módulo 1 del curso n8n",
      "Buscar segundo cliente con referido del primero",
    ],
  },
  {
    semana: 6,
    mes: "Mayo",
    tareas: [
      "Construir primer agente IA completo (WhatsApp + GPT)",
      "Precio: RD$25,000-40,000",
      "Publicar caso de éxito en LinkedIn",
      "Subir 2 flujos más a Gumroad",
    ],
  },
  {
    semana: 7,
    mes: "Mayo",
    tareas: [
      "Lanzar curso en Hotmart (mínimo 4 módulos grabados)",
      "Precio: RD$2,500-3,500",
      "Enviar a 10 contactos para primeras ventas",
      "Cerrar contrato de mantenimiento mensual con 2 clientes",
    ],
  },
  {
    semana: 8,
    mes: "Junio",
    tareas: [
      "Revisar progreso: ¿vas en camino a RD$33,333/mes?",
      "Ajustar estrategia según resultados reales",
      "Automatizar tu propio marketing con n8n",
      "Meta acumulada a esta semana: RD$100,000+",
    ],
  },
];

const STORAGE_KEY = "geely_tracker_v2";

function loadData() {
  try {
    const r = localStorage.getItem(STORAGE_KEY);
    return r ? JSON.parse(r) : null;
  } catch {
    return null;
  }
}
function saveData(d) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {}
}

const defaultState = {
  ingresos: [],
  gastos: [],
  tareasCompletadas: {},
  planesActivos: ["n8n_basico", "agente_ia", "curso_hotmart"],
};

const fmt = (n) => "RD$" + Math.round(n).toLocaleString("es-DO");
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-DO", { day: "2-digit", month: "short" });

function calcStats(ingresos, gastos) {
  const totalIngresos = ingresos.reduce((a, b) => a + b.monto, 0);
  const totalGastos = gastos.reduce((a, b) => a + b.monto, 0);
  const pct = Math.min(100, (totalIngresos / META_TOTAL) * 100);
  const mesActual = new Date().getMonth();
  const ingMes = ingresos
    .filter((i) => new Date(i.fecha).getMonth() === mesActual)
    .reduce((a, b) => a + b.monto, 0);
  const gastMes = gastos
    .filter((g) => new Date(g.fecha).getMonth() === mesActual)
    .reduce((a, b) => a + b.monto, 0);
  const disponible = SUELDO - gastMes;
  const mesesParaMeta =
    totalIngresos >= META_TOTAL
      ? 0
      : Math.ceil((META_TOTAL - totalIngresos) / Math.max(ingMes || META_MENSUAL, 1));
  return { totalIngresos, totalGastos, pct, ingMes, gastMes, disponible, mesesParaMeta };
}

function getRecomendaciones(stats, planesActivos, ingresos) {
  const recs = [];
  const { ingMes, gastMes, disponible, totalIngresos } = stats;
  const pct = (totalIngresos / META_TOTAL) * 100;
  if (ingMes < META_MENSUAL * 0.5)
    recs.push({
      tipo: "alerta",
      icon: "⚠️",
      texto: `Este mes llevas ${fmt(ingMes)} de la meta de ${fmt(
        META_MENSUAL
      )}. Estás por debajo del 50%. Activa un plan de ingreso rápido esta semana.`,
    });
  if (gastMes > SUELDO * 0.7)
    recs.push({
      tipo: "gasto",
      icon: "💸",
      texto: `Tus gastos este mes (${fmt(
        gastMes
      )}) son más del 70% de tu sueldo. Solo quedan ${fmt(
        disponible
      )} libres. Revisa la categoría más alta.`,
    });
  if (ingMes >= META_MENSUAL)
    recs.push({
      tipo: "exito",
      icon: "🎯",
      texto: `¡Superaste la meta mensual con ${fmt(
        ingMes
      )}! Duplica la estrategia que más ingresos te dio.`,
    });
  if (pct < 20 && ingresos.length > 3)
    recs.push({
      tipo: "plan",
      icon: "🔄",
      texto:
        "Con el ritmo actual tardarías más de lo planeado. Activa el Curso Hotmart — genera ingresos pasivos sin tiempo adicional.",
    });
  if (planesActivos.length < 2)
    recs.push({
      tipo: "plan",
      icon: "🧩",
      texto:
        "Solo tienes 1 fuente activa. Diversifica con al menos 2 planes para no depender de un solo cliente.",
    });
  if (disponible > 30000)
    recs.push({
      tipo: "ahorro",
      icon: "🏦",
      texto: `Tienes ${fmt(
        disponible
      )} disponibles. Coloca al menos RD$20,000 en un certificado APAP al 7% anual.`,
    });
  if (recs.length === 0)
    recs.push({
      tipo: "exito",
      icon: "✅",
      texto: "Vas por buen camino. Mantén el ritmo y revisa el plan semanal.",
    });
  return recs;
}

async function callAI(systemPrompt, userMessage, claudeApiKey, openaiApiKey) {
  try {
    const key = claudeApiKey || localStorage.getItem("claudeKey");
    if (!key) throw new Error("Falta API key de Claude. Ve a Config → Parámetros IA");
    
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
    const data = await res.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error("Anthropic: respuesta vacía");
    return { texto: text, modelo: "Claude (Anthropic)" };
  } catch (errAnthropic) {
    console.warn("Anthropic no disponible, cambiando a OpenAI:", errAnthropic.message);
  }

  try {
    const key = openaiApiKey || localStorage.getItem("openaiKey");
    if (!key) throw new Error("Falta API key de OpenAI. Ve a Config → Parámetros IA");
    
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        max_tokens: 1000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenAI: respuesta vacía");
    return { texto: text, modelo: "GPT-4o (OpenAI)" };
  } catch (errOpenAI) {
    throw new Error(`Ambos servicios fallaron. OpenAI: ${errOpenAI.message}`);
  }
}

function ProgressRing({ pct, color, size = 100 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0d1e30" strokeWidth={10} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
}

export default function GeelyTracker() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(() => loadData() || defaultState);
  const [formIngreso, setFormIngreso] = useState({
    monto: "",
    fuente: FUENTES_INGRESO[0],
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [formGasto, setFormGasto] = useState({
    monto: "",
    categoria: CATEGORIAS_GASTO[0],
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 10),
  });
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiModelo, setAiModelo] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [toast, setToast] = useState(null);
  const [claudeKey, setClaudeKey] = useState(() => {
    try {
      return localStorage.getItem("claudeKey") || "";
    } catch {
      return "";
    }
  });
  const [openaiKey, setOpenaiKey] = useState(() => {
    try {
      return localStorage.getItem("openaiKey") || "";
    } catch {
      return "";
    }
  });
  const [agenteAnalysis, setAgenteAnalysis] = useState(null);
  const [agenteLoading, setAgenteLoading] = useState(false);
  const [agenteError, setAgenteError] = useState("");

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem("claudeKey", claudeKey);
    } catch {}
  }, [claudeKey]);

  useEffect(() => {
    try {
      localStorage.setItem("openaiKey", openaiKey);
    } catch {}
  }, [openaiKey]);

  // Test conexión a PostgreSQL al montar
  useEffect(() => {
    const checkDB = async () => {
      const connected = await testConnection();
      if (!connected) {
        showToast("⚠️ PostgreSQL no disponible (relación solo local)", "err");
      }
    };
    checkDB();
  }, []);

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  const agregarIngreso = async () => {
    if (!formIngreso.monto || isNaN(+formIngreso.monto) || +formIngreso.monto <= 0)
      return showToast("Ingresa un monto válido", "err");
    
    const nuevoIngreso = { id: Date.now(), ...formIngreso, monto: +formIngreso.monto };
    
    // Guardar localmente
    setData((d) => ({
      ...d,
      ingresos: [...d.ingresos, nuevoIngreso],
    }));
    
    // Guardar en PostgreSQL
    const result = await saveIngreso(
      +formIngreso.monto,
      formIngreso.fuente,
      formIngreso.descripcion,
      formIngreso.fecha
    );
    
    setFormIngreso((f) => ({ ...f, monto: "", descripcion: "" }));
    
    if (result.success) {
      showToast("✅ Ingreso registrado (local + BD)");
    } else {
      showToast("⚠️ Ingreso local OK, BD con error", "err");
    }
  };

  const agregarGasto = async () => {
    if (!formGasto.monto || isNaN(+formGasto.monto) || +formGasto.monto <= 0)
      return showToast("Ingresa un monto válido", "err");
    
    const nuevoGasto = { id: Date.now(), ...formGasto, monto: +formGasto.monto };
    
    // Guardar localmente
    setData((d) => ({
      ...d,
      gastos: [...d.gastos, nuevoGasto],
    }));
    
    // Guardar en PostgreSQL
    const result = await saveGasto(
      +formGasto.monto,
      formGasto.categoria,
      formGasto.descripcion,
      formGasto.fecha
    );
    
    setFormGasto((f) => ({ ...f, monto: "", descripcion: "" }));
    
    if (result.success) {
      showToast("✅ Gasto registrado (local + BD)");
    } else {
      showToast("⚠️ Gasto local OK, BD con error", "err");
    }
  };

  const toggleTarea = (semana, idx) => {
    const key = `${semana}-${idx}`;
    setData((d) => ({
      ...d,
      tareasCompletadas: { ...d.tareasCompletadas, [key]: !d.tareasCompletadas[key] },
    }));
  };

  const togglePlan = (id) => {
    setData((d) => ({
      ...d,
      planesActivos: d.planesActivos.includes(id)
        ? d.planesActivos.filter((p) => p !== id)
        : [...d.planesActivos, id],
    }));
  };

  const eliminarItem = (tipo, id) =>
    setData((d) => ({ ...d, [tipo]: d[tipo].filter((x) => x.id !== id) }));

  const stats = calcStats(data.ingresos, data.gastos);
  const recomendaciones = getRecomendaciones(stats, data.planesActivos, data.ingresos);

  const gastosPorCat = CATEGORIAS_GASTO.map((cat) => ({
    cat,
    total: data.gastos.filter((g) => g.categoria === cat).reduce((a, b) => a + b.monto, 0),
  }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  const ingresosPorFuente = FUENTES_INGRESO.map((f) => ({
    f,
    total: data.ingresos.filter((i) => i.fuente === f).reduce((a, b) => a + b.monto, 0),
  }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxGasto = gastosPorCat[0]?.total || 1;

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("");
    setAiModelo("");
    setAiError("");

    const systemPrompt = `Eres un asesor financiero personal para Juan Rosario, ingeniero de software dominicano que quiere reunir RD$300,000 antes de diciembre 2026 para comprar una Geely GX Pro 2027 en Viamar RD.

Perfil de Juan:
- Sueldo: RD$95,000/mes en DIGEPRES (sector público — no puede hacer freelance para gobierno)
- VPS Hostinger con n8n + Coolify instalado, dominio propio, puede instalar Postgres
- Certificado Generative AI Leader de Google (completado Mar 2026, 5 módulos)
- 10 años experiencia: Dynamics 365 Business Central, SQL Server DBA, .NET, Angular, Azure, Power BI
- Solo puede trabajar 5-8 hrs/semana en proyectos extras
- Tiene Corolla 2010 tipo S (valor RD$490,000-550,000) que venderá para la inicial
- Préstamo Banreservas: RD$12,305 restantes (vence abril 2026) — al día 100%
- FUNDAPEC saldado dic 2025 — historial crediticio limpio
- Inglés: básico / inglés técnico (puede leer documentación)

Estado financiero actual del tracker:
- Ingresos extras acumulados: RD$${stats.totalIngresos.toLocaleString()}
- Ingresos extras este mes: RD$${stats.ingMes.toLocaleString()}
- Gastos registrados este mes: RD$${stats.gastMes.toLocaleString()}
- Progreso hacia meta: ${stats.pct.toFixed(1)}%
- Planes activos: ${data.planesActivos.join(", ") || "ninguno"}
- Meses estimados para completar meta: ${stats.mesesParaMeta}

Responde en español dominicano natural, directo y práctico. Máximo 200 palabras. Da consejos específicos para Juan, no genéricos. Si hay un riesgo real, dilo claramente.`;

    try {
      const { texto, modelo } = await callAI(systemPrompt, aiInput, claudeKey, openaiKey);
      setAiResponse(texto);
      setAiModelo(modelo);
    } catch (err) {
      setAiError(err.message);
    }
    setAiLoading(false);
  };

  const tabs = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "ingresos", icon: "💰", label: "Ingresos" },
    { id: "gastos", icon: "💸", label: "Gastos" },
    { id: "planes", icon: "⚡", label: "Planes" },
    { id: "tareas", icon: "✅", label: "Tareas" },
    { id: "agente", icon: "🔄", label: "Agente Autónomo" },
    { id: "ia", icon: "🤖", label: "Asesor IA" },
    { id: "config", icon: "⚙️", label: "Config" },
  ];

  const S = {
    app: {
      fontFamily: "'Georgia', serif",
      background: "#030508",
      minHeight: "100vh",
      color: "#c8d8e8",
      paddingBottom: "80px",
    },
    header: {
      background: "linear-gradient(180deg, #07090f 0%, #030508 100%)",
      padding: "20px 16px 16px",
      borderBottom: "1px solid #0a1020",
    },
    card: {
      background: "linear-gradient(135deg, #07090f, #030508)",
      border: "1px solid #0d1520",
      borderRadius: "14px",
      padding: "16px",
      marginBottom: "12px",
    },
    label: {
      fontSize: "10px",
      color: "#2a4a6a",
      textTransform: "uppercase",
      letterSpacing: "1px",
      marginBottom: "4px",
    },
    input: {
      background: "#030508",
      border: "1px solid #0d1520",
      borderRadius: "8px",
      padding: "10px 12px",
      color: "#c8d8e8",
      fontSize: "14px",
      width: "100%",
      fontFamily: "inherit",
      outline: "none",
      boxSizing: "border-box",
    },
    btn: (color = "#3b82f6") => ({
      background: color + "20",
      border: `1px solid ${color}50`,
      borderRadius: "8px",
      padding: "10px 16px",
      color,
      cursor: "pointer",
      fontSize: "13px",
      fontFamily: "inherit",
      fontWeight: "600",
    }),
    tabBar: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "#030508",
      borderTop: "1px solid #0a1520",
      display: "flex",
      zIndex: 100,
    },
    tabBtn: (active) => ({
      flex: 1,
      background: "none",
      border: "none",
      borderTop: active ? "2px solid #d4af37" : "2px solid transparent",
      padding: "10px 4px 8px",
      cursor: "pointer",
      color: active ? "#d4af37" : "#1a3a5a",
      fontFamily: "inherit",
    }),
  };

  return (
    <div style={S.app}>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            background: toast.tipo === "err" ? "#7f1d1d" : "#14532d",
            border: `1px solid ${toast.tipo === "err" ? "#dc2626" : "#16a34a"}`,
            borderRadius: "10px",
            padding: "10px 20px",
            fontSize: "13px",
            color: "#fff",
            zIndex: 999,
            whiteSpace: "nowrap",
          }}
        >
          {toast.msg}
        </div>
      )}

      <div style={S.header}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "3px",
              color: "#d4af37",
              marginBottom: "4px",
            }}
          >
            GEELY TRACKER · JUAN ROSARIO
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#f0f8ff" }}>
                Mi Geely GX Pro 2027
              </div>
              <div style={{ fontSize: "11px", color: "#2a4a6a" }}>
                Meta: {fmt(META_TOTAL)} · Diciembre 2026
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: "700",
                  color: stats.pct >= 100 ? "#4ade80" : "#d4af37",
                }}
              >
                {stats.pct.toFixed(1)}%
              </div>
              <div style={{ fontSize: "11px", color: "#2a4a6a" }}>
                {fmt(stats.totalIngresos)} reunidos
              </div>
            </div>
          </div>
          <div
            style={{
              height: "6px",
              background: "#0d1520",
              borderRadius: "3px",
              overflow: "hidden",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                width: `${stats.pct}%`,
                height: "100%",
                background: "linear-gradient(90deg, #d4af37, #f59e0b)",
                borderRadius: "3px",
                transition: "width 1s ease",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "16px" }}>
        {tab === "dashboard" && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              {[
                {
                  label: "Acumulado",
                  value: fmt(stats.totalIngresos),
                  sub: `de ${fmt(META_TOTAL)}`,
                  color: "#d4af37",
                },
                {
                  label: "Este mes",
                  value: fmt(stats.ingMes),
                  sub: `meta: ${fmt(META_MENSUAL)}`,
                  color: stats.ingMes >= META_MENSUAL ? "#4ade80" : "#f87171",
                },
                {
                  label: "Gastos mes",
                  value: fmt(stats.gastMes),
                  sub: `sueldo: ${fmt(SUELDO)}`,
                  color: "#60a5fa",
                },
                {
                  label: "Meses estimados",
                  value: stats.mesesParaMeta === 0 ? "¡Listo!" : `~${stats.mesesParaMeta}`,
                  sub: "para completar meta",
                  color:
                    stats.mesesParaMeta <= MESES_RESTANTES ? "#4ade80" : "#f87171",
                },
              ].map((k, i) => (
                <div key={i} style={{ ...S.card, marginBottom: 0 }}>
                  <div style={S.label}>{k.label}</div>
                  <div style={{ fontSize: "20px", fontWeight: "700", color: k.color }}>
                    {k.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "#2a4a6a", marginTop: "2px" }}>
                    {k.sub}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <ProgressRing pct={stats.pct} color="#d4af37" size={96} />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#d4af37" }}>
                    {stats.pct.toFixed(0)}%
                  </div>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: "Reunido", value: stats.totalIngresos, color: "#d4af37" },
                  {
                    label: "Falta",
                    value: Math.max(0, META_TOTAL - stats.totalIngresos),
                    color: "#f87171",
                  },
                  {
                    label: "Disponible mensual",
                    value: SUELDO - stats.gastMes,
                    color: "#4ade80",
                  },
                ].map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "4px 0",
                      borderBottom: i < 2 ? "1px solid #0a1520" : "none",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#3a5a7a" }}>{r.label}</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: r.color }}>
                      {fmt(r.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#3b82f6",
                letterSpacing: "2px",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              🤖 Recomendaciones
            </div>
            {recomendaciones.map((r, i) => (
              <div
                key={i}
                style={{
                  ...S.card,
                  borderLeft: `3px solid ${
                    r.tipo === "alerta"
                      ? "#f87171"
                      : r.tipo === "exito"
                      ? "#4ade80"
                      : r.tipo === "gasto"
                      ? "#f59e0b"
                      : "#3b82f6"
                  }`,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: "13px", color: "#8aaccc", lineHeight: "1.6" }}>
                  <span style={{ marginRight: "6px" }}>{r.icon}</span>
                  {r.texto}
                </div>
              </div>
            ))}

            {ingresosPorFuente.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#3b82f6",
                    letterSpacing: "2px",
                    margin: "16px 0 10px",
                    textTransform: "uppercase",
                  }}
                >
                  📊 Ingresos por fuente
                </div>
                <div style={S.card}>
                  {ingresosPorFuente.map((r, i) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#6a8aaa" }}>{r.f}</span>
                        <span style={{ fontSize: "12px", color: "#d4af37", fontWeight: "600" }}>
                          {fmt(r.total)}
                        </span>
                      </div>
                      <div style={{ height: "4px", background: "#0d1520", borderRadius: "2px" }}>
                        <div
                          style={{
                            width: `${(r.total / stats.totalIngresos) * 100}%`,
                            height: "100%",
                            background: "#d4af37",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "ingresos" && (
          <div>
            <div style={S.card}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#4ade80",
                  marginBottom: "14px",
                }}
              >
                ➕ Registrar Ingreso Extra
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>Monto (RD$)</div>
                <input
                  style={S.input}
                  type="number"
                  placeholder="Ej: 15000"
                  value={formIngreso.monto}
                  onChange={(e) =>
                    setFormIngreso((f) => ({ ...f, monto: e.target.value }))
                  }
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>Fuente</div>
                <select
                  style={S.input}
                  value={formIngreso.fuente}
                  onChange={(e) =>
                    setFormIngreso((f) => ({ ...f, fuente: e.target.value }))
                  }
                >
                  {FUENTES_INGRESO.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>Descripción breve (opcional)</div>
                <input
                  style={S.input}
                  placeholder="Ej: Bot WhatsApp para Clínica Piantini"
                  value={formIngreso.descripcion}
                  onChange={(e) =>
                    setFormIngreso((f) => ({ ...f, descripcion: e.target.value }))
                  }
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <div style={S.label}>Fecha</div>
                <input
                  style={S.input}
                  type="date"
                  value={formIngreso.fecha}
                  onChange={(e) =>
                    setFormIngreso((f) => ({ ...f, fecha: e.target.value }))
                  }
                />
              </div>
              <button style={{ ...S.btn("#4ade80"), width: "100%" }} onClick={agregarIngreso}>
                Registrar Ingreso
              </button>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#4ade80",
                letterSpacing: "2px",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Historial · {data.ingresos.length} registros · Total: {fmt(stats.totalIngresos)}
            </div>
            {data.ingresos.length === 0 && (
              <div
                style={{
                  ...S.card,
                  textAlign: "center",
                  color: "#2a4a6a",
                  fontSize: "13px",
                  padding: "24px",
                }}
              >
                Aún no hay ingresos. ¡Registra tu primer cliente! 🚀
              </div>
            )}
            {[...data.ingresos].reverse().map((ing) => (
              <div
                key={ing.id}
                style={{
                  ...S.card,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderLeft: "3px solid #4ade80",
                  padding: "12px 14px",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", color: "#dde8f8", fontWeight: "600" }}>
                    {ing.fuente}
                  </div>
                  {ing.descripcion && (
                    <div style={{ fontSize: "11px", color: "#3a5a7a", marginTop: "2px" }}>
                      {ing.descripcion}
                    </div>
                  )}
                  <div style={{ fontSize: "11px", color: "#1a3a5a", marginTop: "2px" }}>
                    {fmtDate(ing.fecha)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "#4ade80" }}>
                    {fmt(ing.monto)}
                  </span>
                  <button
                    onClick={() => eliminarItem("ingresos", ing.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "gastos" && (
          <div>
            <div style={S.card}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#f87171",
                  marginBottom: "14px",
                }}
              >
                ➕ Registrar Gasto
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>Monto (RD$)</div>
                <input
                  style={S.input}
                  type="number"
                  placeholder="Ej: 5000"
                  value={formGasto.monto}
                  onChange={(e) => setFormGasto((f) => ({ ...f, monto: e.target.value }))}
                />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>Categoría</div>
                <select
                  style={S.input}
                  value={formGasto.categoria}
                  onChange={(e) =>
                    setFormGasto((f) => ({ ...f, categoria: e.target.value }))
                  }
                >
                  {CATEGORIAS_GASTO.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>Descripción breve (opcional)</div>
                <input
                  style={S.input}
                  placeholder="Ej: Supermercado semana"
                  value={formGasto.descripcion}
                  onChange={(e) =>
                    setFormGasto((f) => ({ ...f, descripcion: e.target.value }))
                  }
                />
              </div>
              <div style={{ marginBottom: "14px" }}>
                <div style={S.label}>Fecha</div>
                <input
                  style={S.input}
                  type="date"
                  value={formGasto.fecha}
                  onChange={(e) => setFormGasto((f) => ({ ...f, fecha: e.target.value }))}
                />
              </div>
              <button style={{ ...S.btn("#f87171"), width: "100%" }} onClick={agregarGasto}>
                Registrar Gasto
              </button>
            </div>
            {gastosPorCat.length > 0 && (
              <>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#f59e0b",
                    letterSpacing: "2px",
                    marginBottom: "10px",
                    textTransform: "uppercase",
                  }}
                >
                  📊 Análisis por Categoría
                </div>
                <div style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "12px", color: "#3a5a7a" }}>Total gastos registrados</span>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#f87171" }}>
                      {fmt(stats.totalGastos)}
                    </span>
                  </div>
                  {gastosPorCat.map((g, i) => (
                    <div key={i} style={{ marginBottom: "10px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "3px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#6a8aaa" }}>{g.cat}</span>
                        <span style={{ fontSize: "12px", color: "#f59e0b", fontWeight: "600" }}>
                          {fmt(g.total)}
                        </span>
                      </div>
                      <div style={{ height: "4px", background: "#0d1520", borderRadius: "2px" }}>
                        <div
                          style={{
                            width: `${(g.total / maxGasto) * 100}%`,
                            height: "100%",
                            background: "#f59e0b",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div
              style={{
                fontSize: "11px",
                color: "#f87171",
                letterSpacing: "2px",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              Historial · {data.gastos.length} registros
            </div>
            {data.gastos.length === 0 && (
              <div
                style={{
                  ...S.card,
                  textAlign: "center",
                  color: "#2a4a6a",
                  fontSize: "13px",
                  padding: "24px",
                }}
              >
                No hay gastos registrados. Empieza a registrar para ver análisis 💸
              </div>
            )}
            {[...data.gastos].reverse().map((g) => (
              <div
                key={g.id}
                style={{
                  ...S.card,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderLeft: "3px solid #f87171",
                  padding: "12px 14px",
                }}
              >
                <div>
                  <div style={{ fontSize: "13px", color: "#dde8f8", fontWeight: "600" }}>
                    {g.categoria}
                  </div>
                  {g.descripcion && (
                    <div style={{ fontSize: "11px", color: "#3a5a7a", marginTop: "2px" }}>
                      {g.descripcion}
                    </div>
                  )}
                  <div style={{ fontSize: "11px", color: "#1a3a5a", marginTop: "2px" }}>
                    {fmtDate(g.fecha)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700", color: "#f87171" }}>
                    {fmt(g.monto)}
                  </span>
                  <button
                    onClick={() => eliminarItem("gastos", g.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#f87171",
                      cursor: "pointer",
                      fontSize: "18px",
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "planes" && (
          <div>
            <div style={{ ...S.card, borderLeft: "3px solid #d4af37", padding: "12px 14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#d4af37", marginBottom: "4px", fontWeight: "600" }}>
                💡 ¿Cómo usar esto?
              </div>
              <div style={{ fontSize: "12px", color: "#3a5a7a", lineHeight: "1.6" }}>
                Activa los planes que ejecutas. Si uno no funciona, desactívalo — el
                Dashboard mostrará recomendaciones automáticas.
              </div>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#3b82f6",
                letterSpacing: "2px",
                marginBottom: "10px",
                textTransform: "uppercase",
              }}
            >
              ⚡ Planes disponibles · {data.planesActivos.length} activos
            </div>
            {PLANES_ALTERNATIVOS.map((p) => {
              const activo = data.planesActivos.includes(p.id);
              return (
                <div
                  key={p.id}
                  style={{
                    ...S.card,
                    borderLeft: `3px solid ${activo ? "#4ade80" : "#0d1520"}`,
                    opacity: activo ? 1 : 0.6,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <div
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background: activo ? "#4ade80" : "#1a3a5a",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "700",
                            color: activo ? "#dde8f8" : "#3a5a7a",
                          }}
                        >
                          {p.nombre}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#2a4a6a", marginBottom: "4px" }}>
                        {p.descripcion}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "#4ade80" }}>
                          {fmt(p.ingreso)}/mes
                        </span>
                        <span style={{ fontSize: "11px", color: "#60a5fa" }}>{p.horas} hrs/sem</span>
                        <span
                          style={{
                            fontSize: "11px",
                            color:
                              p.dificultad === "Baja"
                                ? "#4ade80"
                                : p.dificultad === "Media"
                                ? "#f59e0b"
                                : "#f87171",
                          }}
                        >
                          Dificultad {p.dificultad}
                        </span>
                      </div>
                      <div style={{ fontSize: "11px", color: "#1a3a5a", marginTop: "4px" }}>
                        🎯 {p.nicho}
                      </div>
                    </div>
                    <button
                      onClick={() => togglePlan(p.id)}
                      style={{
                        ...S.btn(activo ? "#f87171" : "#4ade80"),
                        fontSize: "11px",
                        padding: "6px 12px",
                        flexShrink: 0,
                        marginLeft: "10px",
                      }}
                    >
                      {activo ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              );
            })}
            {data.planesActivos.length > 0 && (
              <div style={{ ...S.card, borderLeft: "3px solid #4ade80", marginTop: "8px" }}>
                <div style={{ fontSize: "12px", color: "#4ade80", marginBottom: "8px", fontWeight: "600" }}>
                  📈 Potencial mensual con planes activos
                </div>
                {PLANES_ALTERNATIVOS.filter((p) => data.planesActivos.includes(p.id)).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: "1px solid #0a1520",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#3a5a7a" }}>{p.nombre}</span>
                    <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "600" }}>
                      {fmt(p.ingreso)}/mes
                    </span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#dde8f8", fontWeight: "600" }}>
                    Total potencial
                  </span>
                  <span style={{ fontSize: "16px", color: "#d4af37", fontWeight: "700" }}>
                    {fmt(
                      PLANES_ALTERNATIVOS.filter((p) => data.planesActivos.includes(p.id)).reduce(
                        (a, p) => a + p.ingreso,
                        0
                      )
                    )}
                    /mes
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "tareas" && (
          <div>
            {TAREAS_SEMANALES.map((sem) => {
              const completadas = sem.tareas.filter((_, i) => data.tareasCompletadas[`${sem.semana}-${i}`]).length;
              const pctSem = (completadas / sem.tareas.length) * 100;
              return (
                <div
                  key={sem.semana}
                  style={{
                    ...S.card,
                    borderLeft: `3px solid ${pctSem === 100 ? "#4ade80" : pctSem > 0 ? "#f59e0b" : "#0d1520"}`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: pctSem === 100 ? "#4ade80" : "#dde8f8" }}>
                        Semana {sem.semana}
                      </span>
                      <span style={{ fontSize: "11px", color: "#2a4a6a", marginLeft: "8px" }}>
                        · {sem.mes}
                      </span>
                    </div>
                    <span style={{ fontSize: "11px", color: pctSem === 100 ? "#4ade80" : "#2a4a6a" }}>
                      {completadas}/{sem.tareas.length} ✓
                    </span>
                  </div>
                  <div style={{ height: "3px", background: "#0d1520", borderRadius: "2px", marginBottom: "10px" }}>
                    <div
                      style={{
                        width: `${pctSem}%`,
                        height: "100%",
                        background: pctSem === 100 ? "#4ade80" : "#f59e0b",
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  {sem.tareas.map((t, i) => {
                    const key = `${sem.semana}-${i}`;
                    const done = !!data.tareasCompletadas[key];
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTarea(sem.semana, i)}
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                          padding: "7px 0",
                          borderBottom: i < sem.tareas.length - 1 ? "1px solid #07090f" : "none",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "4px",
                            border: `1px solid ${done ? "#4ade80" : "#1a3a5a"}`,
                            background: done ? "#4ade80" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "1px",
                          }}
                        >
                          {done && <span style={{ fontSize: "11px", color: "#030508", fontWeight: "700" }}>✓</span>}
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: done ? "#2a5a3a" : "#6a8aaa",
                            textDecoration: done ? "line-through" : "none",
                            lineHeight: "1.5",
                          }}
                        >
                          {t}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {tab === "config" && (
          <div>
            <div style={{ ...S.card, borderLeft: "3px solid #d4af37", padding: "12px 14px", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#d4af37", marginBottom: "4px", fontWeight: "600" }}>
                🔐 Tus API Keys
              </div>
              <div style={{ fontSize: "12px", color: "#3a5a7a", lineHeight: "1.6" }}>
                Guarda aquí tus credenciales. Se almacenan localmente en tu navegador (nunca suben al servidor).
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#60a5fa", marginBottom: "14px" }}>
                🤖 Claude (Anthropic)
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>API Key de Claude</div>
                <input
                  style={S.input}
                  type="password"
                  placeholder="sk-ant-..."
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                />
                <div style={{ fontSize: "11px", color: "#1a3a5a", marginTop: "6px" }}>
                  📌 Obtén tu key en: <span style={{ color: "#60a5fa", fontWeight: "600" }}>console.anthropic.com</span>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#4ade80", marginBottom: "14px" }}>
                🔌 GPT (OpenAI)
              </div>
              <div style={{ marginBottom: "10px" }}>
                <div style={S.label}>API Key de OpenAI</div>
                <input
                  style={S.input}
                  type="password"
                  placeholder="sk-..."
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                />
                <div style={{ fontSize: "11px", color: "#1a3a5a", marginTop: "6px" }}>
                  📌 Obtén tu key en: <span style={{ color: "#4ade80", fontWeight: "600" }}>platform.openai.com</span>
                </div>
              </div>
              <button
                style={{ ...S.btn("#4ade80"), fontSize: "11px", padding: "6px 12px" }}
                onClick={async () => {
                  if (!openaiKey) {
                    alert("❌ Agrega una API key primero");
                    return;
                  }
                  try {
                    const res = await fetch("https://api.openai.com/v1/models/gpt-4o-mini", {
                      headers: { "Authorization": `Bearer ${openaiKey}` }
                    });
                    if (res.ok) {
                      alert("✅ API key válida y funcional");
                    } else if (res.status === 401) {
                      alert("❌ API key inválida (401). Verifica:\n- Que sea correcta\n- Que no tenga espacios\n- Que tenga crédito en tu cuenta OpenAI");
                    } else {
                      alert(`❌ Error HTTP ${res.status}`);
                    }
                  } catch (err) {
                    alert("❌ Error: " + err.message);
                  }
                }}
              >
                🧪 Probar Key
              </button>
            </div>

            <div style={{ ...S.card, background: "#030508", borderLeft: "3px solid #f59e0b" }}>
              <div style={{ fontSize: "12px", color: "#f59e0b", marginBottom: "8px", fontWeight: "600" }}>
                ⚠️ Importante
              </div>
              <ul style={{ fontSize: "11px", color: "#3a5a7a", lineHeight: "1.8", margin: "0", paddingLeft: "16px" }}>
                <li>Tus keys se guardan solo en tu navegador (localStorage)</li>
                <li>Nunca las compartimos con servidores</li>
                <li>Si cambias dispositivo, agrega nuevamente las keys</li>
                <li>Mantén tu navegador actualizado y confiable</li>
                <li>Si algo se vuelve sospechoso, regenera las keys en sus respectivas plataformas</li>
              </ul>
            </div>
          </div>
        )}

        {tab === "agente" && (
          <div>
            <div style={{ ...S.card, borderLeft: "3px solid #d4af37", padding: "12px 14px", marginBottom: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#d4af37", marginBottom: "6px" }}>
                🔄 Agente Autónomo Semanal
              </div>
              <div style={{ fontSize: "11px", color: "#3a5a7a", lineHeight: "1.6" }}>
                El agente IA analiza tu progreso cada <strong>lunes 9am</strong> e sugiere nuevas estrategias si los planes actuales no funcionan. Resultados visibles abajo.
              </div>
            </div>

            <button
              style={{ ...S.btn("#d4af37"), width: "100%", marginBottom: "14px" }}
              disabled={agenteLoading}
              onClick={async () => {
                setAgenteLoading(true);
                setAgenteError("");
                setAgenteAnalysis(null);

                try {
                  console.log('📡 Llamando webhook get-analysis...');
                  const result = await getAgentAnalysis();
                  console.log('✅ Respuesta del webhook:', result);
                  
                  if (result.error) {
                    setAgenteError(result.error);
                  } else {
                    setAgenteAnalysis(result);
                  }
                } catch (err) {
                  console.error('❌ Error:', err);
                  setAgenteError(err.message);
                } finally {
                  setAgenteLoading(false);
                }
              }}
            >
              {agenteLoading ? "⏳ Analizando..." : "📊 Analizar Ahora"}
            </button>

            {agenteError && (
              <div style={{ ...S.card, borderLeft: "3px solid #f87171", marginBottom: "14px", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", color: "#f87171", fontWeight: "600" }}>
                  ⚠️ {agenteError}
                </div>
              </div>
            )}

            {agenteAnalysis && (
              <div style={{ ...S.card, borderTop: "3px solid #d4af37", marginBottom: "14px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#d4af37", marginBottom: "14px" }}>
                  📈 ANÁLISIS DEL AGENTE
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                  <div style={{ ...S.card, background: "#0d1e30" }}>
                    <div style={{ fontSize: "10px", color: "#a0aec0", letterSpacing: "1px", marginBottom: "4px" }}>
                      INGRESOS
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#4ade80" }}>
                      RD${parseFloat(agenteAnalysis.total_ingreso || 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div style={{ ...S.card, background: "#0d1e30" }}>
                    <div style={{ fontSize: "10px", color: "#a0aec0", letterSpacing: "1px", marginBottom: "4px" }}>
                      GASTOS
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#f87171" }}>
                      RD${parseFloat(agenteAnalysis.total_gasto || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "10px", color: "#a0aec0", letterSpacing: "1px", marginBottom: "6px", textTransform: "uppercase" }}>
                    Estado: {agenteAnalysis.plan_status}
                  </div>
                  {agenteAnalysis.agent_recommendation && (
                    <div style={{ fontSize: "11px", color: "#8aaccc", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                      {agenteAnalysis.agent_recommendation}
                    </div>
                  )}
                </div>

                {agenteAnalysis.openai_response && (
                  <div style={{ borderTop: "1px solid #1a3a5a", paddingTop: "12px" }}>
                    <div style={{ fontSize: "10px", color: "#a0aec0", letterSpacing: "1px", marginBottom: "6px" }}>
                      RESPUESTA IA
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b8aae", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                      {agenteAnalysis.openai_response}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ ...S.card, borderTop: "2px solid #d4af37", paddingTop: "14px" }}>
              <div style={{ fontSize: "11px", color: "#d4af37", letterSpacing: "2px", marginBottom: "10px", textTransform: "uppercase" }}>
                📅 Próximo análisis automático
              </div>
              <div style={{ fontSize: "12px", color: "#3a5a7a" }}>
                Semana del {new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)).toLocaleDateString("es-DO")}
              </div>
              <div style={{ fontSize: "11px", color: "#1a3a5a", marginTop: "6px" }}>
                El sistema revisará si cumpliste la meta semanal y sugerirá ajustes.
              </div>
            </div>
          </div>
        )}

        {tab === "ia" && (
          <div>
            <div style={{ ...S.card, borderLeft: "3px solid #8b5cf6" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#8b5cf6", marginBottom: "6px" }}>
                🤖 Asesor IA con Fallback Automático
              </div>
              <div style={{ fontSize: "12px", color: "#3a5a7a", lineHeight: "1.6" }}>
                Intenta con <strong style={{ color: "#60a5fa" }}>Claude (Anthropic)</strong> primero.
                Si no está disponible, cambia automáticamente a{" "}
                <strong style={{ color: "#4ade80" }}>GPT-4o (OpenAI)</strong>. Siempre tendrás respuesta.
              </div>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
              {[
                "¿Voy bien para llegar a diciembre?",
                "¿Qué gasto debo reducir primero?",
                "¿Qué plan activo esta semana?",
                "¿Cómo consigo mi primer cliente de n8n?",
                "¿Cuánto puedo pedir de financiamiento?",
                "Dame un plan para esta semana",
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setAiInput(q)}
                  style={{
                    background: "#07090f",
                    border: "1px solid #0d1520",
                    borderRadius: "20px",
                    padding: "5px 12px",
                    fontSize: "11px",
                    color: "#3a5a7a",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "10px" }}>
              <textarea
                style={{ ...S.input, minHeight: "80px", resize: "vertical" }}
                placeholder="Escribe tu pregunta... (Ctrl+Enter para enviar)"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) askAI();
                }}
              />
            </div>
            <button
              style={{ ...S.btn("#8b5cf6"), width: "100%", marginBottom: "14px" }}
              onClick={askAI}
              disabled={aiLoading}
            >
              {aiLoading ? "⏳ Consultando IA..." : "Preguntar al Asesor →"}
            </button>

            {aiLoading && (
              <div style={{ ...S.card, textAlign: "center", padding: "24px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>🤖</div>
                <div style={{ fontSize: "12px", color: "#3a5a7a", marginBottom: "4px" }}>
                  Intentando Claude primero...
                </div>
                <div style={{ fontSize: "11px", color: "#1a3a5a" }}>
                  Si no responde, cambia automáticamente a GPT-4o
                </div>
              </div>
            )}

            {aiError && !aiLoading && (
              <div style={{ ...S.card, borderLeft: "3px solid #f87171", padding: "12px 14px" }}>
                <div style={{ fontSize: "12px", color: "#f87171", marginBottom: "8px" }}>⚠️ {aiError}</div>
                {aiError.includes("401") && (
                  <div style={{ fontSize: "11px", color: "#ea580c", lineHeight: "1.6", marginTop: "8px" }}>
                    <strong>Soluciones:</strong>
                    <ul style={{ margin: "4px 0", paddingLeft: "16px" }}>
                      <li>Ve a Config → Parámetros IA</li>
                      <li>Copia correctamente tu API key de OpenAI (sin espacios)</li>
                      <li>Verifica en openai.com que la key sea válida</li>
                      <li>Si deseas, coloca una key de Claude (Anthropic) primero</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {aiResponse && !aiLoading && (
              <div style={{ ...S.card, borderLeft: "3px solid #8b5cf6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#8b5cf6", letterSpacing: "2px" }}>
                    RESPUESTA DEL ASESOR
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: aiModelo.includes("Claude") ? "#3b82f620" : "#4ade8020",
                      color: aiModelo.includes("Claude") ? "#60a5fa" : "#4ade80",
                      border: `1px solid ${
                        aiModelo.includes("Claude") ? "#3b82f640" : "#4ade8040"
                      }`,
                    }}
                  >
                    {aiModelo}
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#8aaccc", lineHeight: "1.8", whiteSpace: "pre-wrap" }}>
                  {aiResponse}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={S.tabBar}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={S.tabBtn(tab === t.id)}>
            <div style={{ fontSize: "18px", marginBottom: "2px" }}>{t.icon}</div>
            <div style={{ fontSize: "9px" }}>{t.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
