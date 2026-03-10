/**
 * CÓDIGO PARA NODO CODE EN n8n
 * Copia este código en el nodo "Code" de n8n para limpiar datos antes de insertar
 */

// Limpiar datos de ingreso - solo las columnas válidas
if (items[0].json.tipo === 'ingreso') {
  items[0].json = {
    monto: parseFloat(items[0].json.monto),
    categoria: items[0].json.fuente || items[0].json.categoria || '',
    descripcion: items[0].json.descripcion || '',
    fecha: items[0].json.fecha,
    user_id: items[0].json.user_id || 'test-user'
    // NO incluir: headers, output, id, created_at
  };
}

// Limpiar datos de gasto - solo las columnas válidas
if (items[0].json.tipo === 'gasto') {
  items[0].json = {
    monto: parseFloat(items[0].json.monto),
    categoria: items[0].json.categoria || '',
    descripcion: items[0].json.descripcion || '',
    fecha: items[0].json.fecha,
    user_id: items[0].json.user_id || 'test-user'
    // NO incluir: headers, output, id, created_at
  };
}

// Limpiar datos de análisis - solo las columnas válidas
if (items[0].json.tipo === 'analysis') {
  items[0].json = {
    user_id: items[0].json.user_id || 'test-user',
    analysis_date: new Date().toISOString().split('T')[0],
    total_ingreso: parseFloat(items[0].json.total_ingreso || 0),
    total_gasto: parseFloat(items[0].json.total_gasto || 0),
    plan_status: items[0].json.plan_status || 'pending',
    agent_recommendation: items[0].json.output || items[0].json.agent_recommendation || '',
    openai_response: items[0].json.openai_response || null
    // NO incluir: headers, output, id, created_at
  };
}

return items;
