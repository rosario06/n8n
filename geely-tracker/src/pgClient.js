// PostgreSQL Client para Geely Tracker
// Conexión via n8n webhooks (https://n8n.kelocode.com)

// n8n Base URL - Webhooks van a https://n8n.kelocode.com/webhook/
// Como estamos en frontend (Vite), usamos API REST via n8n
// NO podemos conectar directamente a PostgreSQL desde navegador (CORS + seguridad)

const N8N_BASE = 'https://n8n.kelocode.com/webhook/';

export const DB_CONFIG = {
  n8nUrl: N8N_BASE,
  webhooks: {
    saveIngreso: 'save-ingreso',
    saveGasto: 'save-gasto',
    getAnalysis: 'get-analysis'
  }
}

/**
 * Función para guardar ingresos en PostgreSQL (via n8n webhook)
 * @param {number} monto 
 * @param {string} fuente 
 * @param {string} descripcion 
 * @param {string} fecha YYYY-MM-DD
 */
export async function saveIngreso(monto, fuente, descripcion, fecha) {
  try {
    const response = await fetch(`${N8N_BASE}save-ingreso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto: parseFloat(monto),
        fuente,
        descripcion,
        fecha,
        user_id: 'test-user',
        categoria: fuente
      })
    })
    
    // Fallback a localStorage si n8n falla
    if (!response.ok) {
      console.warn('⚠️ n8n no disponible, usando localStorage');
      const ingresos = JSON.parse(localStorage.getItem('geely_ingresos') || '[]');
      const id = Date.now();
      ingresos.push({ id, monto, fuente, descripcion, fecha, user_id: 'test-user' });
      localStorage.setItem('geely_ingresos', JSON.stringify(ingresos));
      return { success: true, id, local: true };
    }
    
    const data = await response.json()
    return { success: true, id: data.id || Date.now(), remote: true }
  } catch (err) {
    console.warn('⚠️ Error posting a n8n, usando localStorage:', err.message);
    // Fallback a localStorage
    const ingresos = JSON.parse(localStorage.getItem('geely_ingresos') || '[]');
    const id = Date.now();
    ingresos.push({ id, monto: parseFloat(monto), fuente, descripcion, fecha, user_id: 'test-user' });
    localStorage.setItem('geely_ingresos', JSON.stringify(ingresos));
    return { success: true, id, local: true, error: err.message };
  }
}

/**
 * Función para guardar gastos en PostgreSQL (via n8n webhook)
 */
export async function saveGasto(monto, categoria, descripcion, fecha) {
  try {
    const response = await fetch(`${N8N_BASE}save-gasto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto: parseFloat(monto),
        categoria,
        descripcion,
        fecha,
        user_id: 'test-user'
      })
    })
    
    if (!response.ok) {
      console.warn('⚠️ n8n no disponible, usando localStorage');
      const gastos = JSON.parse(localStorage.getItem('geely_gastos') || '[]');
      const id = Date.now();
      gastos.push({ id, monto, categoria, descripcion, fecha, user_id: 'test-user' });
      localStorage.setItem('geely_gastos', JSON.stringify(gastos));
      return { success: true, id, local: true };
    }
    
    const data = await response.json()
    return { success: true, id: data.id || Date.now(), remote: true }
  } catch (err) {
    console.warn('⚠️ Error posting a n8n, usando localStorage:', err.message);
    const gastos = JSON.parse(localStorage.getItem('geely_gastos') || '[]');
    const id = Date.now();
    gastos.push({ id, monto: parseFloat(monto), categoria, descripcion, fecha, user_id: 'test-user' });
    localStorage.setItem('geely_gastos', JSON.stringify(gastos));
    return { success: true, id, local: true, error: err.message };
  }
}

/**
 * Función para guardar resultado del agente IA en PostgreSQL
 */
export async function saveAgentAnalysis(weekOf, targetIncome, actualIncome, analysis, suggestions, activePlans) {
  try {
    const response = await fetch(`${N8N_BASE}save-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        week_of: weekOf,
        target_income: targetIncome,
        actual_income: actualIncome,
        agent_analysis: analysis,
        suggestions: suggestions,
        active_plans: activePlans,
        user_id: 'test-user'
      })
    })
    
    if (!response.ok) {
      console.warn('⚠️ n8n no disponible, usando localStorage');
      const analysisRecords = JSON.parse(localStorage.getItem('geely_analysis') || '[]');
      const id = Date.now();
      analysisRecords.push({
        id,
        week_of: weekOf,
        target_income: targetIncome,
        actual_income: actualIncome,
        agent_analysis: analysis,
        suggestions: suggestions,
        active_plans: activePlans,
        user_id: 'test-user'
      });
      localStorage.setItem('geely_analysis', JSON.stringify(analysisRecords));
      return { success: true, id, local: true };
    }
    
    const data = await response.json()
    return { success: true, id: data.id || Date.now(), remote: true }
  } catch (err) {
    console.warn('⚠️ Error saving analysis, usando localStorage:', err.message);
    const analysisRecords = JSON.parse(localStorage.getItem('geely_analysis') || '[]');
    const id = Date.now();
    analysisRecords.push({
      id,
      week_of: weekOf,
      target_income: targetIncome,
      actual_income: actualIncome,
      agent_analysis: analysis,
      suggestions: suggestions,
      active_plans: activePlans,
      user_id: 'test-user'
    });
    localStorage.setItem('geely_analysis', JSON.stringify(analysisRecords));
    return { success: true, id, local: true, error: err.message };
  }
}

/**
 * Función para leer ingresos de PostgreSQL (via n8n webhook)
 */
export async function getIngresos(limit = 50) {
  try {
    const response = await fetch(`${N8N_BASE}get-ingresos?limit=${limit}`)
    
    if (!response.ok) {
      console.warn('⚠️ n8n no disponible, usando localStorage');
      const ingresos = JSON.parse(localStorage.getItem('geely_ingresos') || '[]');
      return ingresos.slice(-limit);
    }
    
    const data = await response.json()
    return data.ingresos || []
  } catch (err) {
    console.warn('⚠️ Error fetching ingresos, usando localStorage:', err.message);
    const ingresos = JSON.parse(localStorage.getItem('geely_ingresos') || '[]');
    return ingresos.slice(-limit);
  }
}

/**
 * Función para leer gastos de PostgreSQL (via n8n webhook)
 */
export async function getGastos(limit = 50) {
  try {
    const response = await fetch(`${N8N_BASE}get-gastos?limit=${limit}`)
    
    if (!response.ok) {
      console.warn('⚠️ n8n no disponible, usando localStorage');
      const gastos = JSON.parse(localStorage.getItem('geely_gastos') || '[]');
      return gastos.slice(-limit);
    }
    
    const data = await response.json()
    return data.gastos || []
  } catch (err) {
    console.warn('⚠️ Error fetching gastos, usando localStorage:', err.message);
    const gastos = JSON.parse(localStorage.getItem('geely_gastos') || '[]');
    return gastos.slice(-limit);
  }
}

/**
 * Función para leer últimos análisis del agente
 */
export async function getAgentAnalysis(limit = 10) {
  try {
    // Llamar al webhook GET /webhook/get-analysis
    const response = await fetch(`${N8N_BASE}get-analysis`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const text = await response.text();
    if (!text) {
      console.warn('⚠️ Webhook get-analysis devolvió respuesta vacía');
      const analysis = JSON.parse(localStorage.getItem('geely_analysis') || '[]');
      return analysis.slice(-limit);
    }

    const data = JSON.parse(text);
    console.log('✅ Análisis obtenido del webhook:', data);
    
    // Guardar en localStorage también para offline
    if (data) {
      localStorage.setItem('geely_analysis', JSON.stringify([data]));
    }
    
    return data || {};
  } catch (err) {
    console.warn('⚠️ Error fetching analysis del webhook, usando localStorage:', err.message);
    const analysis = JSON.parse(localStorage.getItem('geely_analysis') || '[]');
    return analysis.length > 0 ? analysis[0] : { error: 'No hay análisis disponible' };
  }
}

/**
 * Test de conexión a n8n
 */
export async function testConnection() {
  try {
    const response = await fetch(`${N8N_BASE}health`, { method: 'GET' })
    
    if (response.ok) {
      console.log('✅ n8n disponible');
      return { connected: true, backend: 'n8n' };
    } else {
      console.warn('⚠️ n8n no disponible, usando localStorage');
      return { connected: false, backend: 'localStorage', message: 'n8n unavailable' };
    }
  } catch (err) {
    console.warn('⚠️ n8n no accesible:', err.message);
    return { connected: false, backend: 'localStorage', message: err.message };
  }
}

export default {
  saveIngreso,
  saveGasto,
  saveAgentAnalysis,
  getIngresos,
  getGastos,
  getAgentAnalysis,
  testConnection
}
