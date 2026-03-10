import fetch from 'node-fetch';

// n8n configuration
const N8N_URL = 'http://72.62.161.96:5678/api/v1';
const ADMIN_KEY = 'n8n_demo_key'; // Default demo key, may need to change

// Database and API credentials
const POSTGRES_CONFIG = {
  host: '72.62.161.96',
  port: 5432,
  user: 'edilver_admin',
  password: '12345678As',
  database: 'geely_db'
};

const OPENAI_KEY = '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';

async function makeN8nRequest(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${N8N_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ n8n error (${response.status}):`, data);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

async function createPostgresCredential() {
  console.log('\n📝 Creando credencial PostgreSQL en n8n...');
  
  const credential = {
    name: 'PostgreSQL Geely',
    type: 'postgres',
    data: {
      host: POSTGRES_CONFIG.host,
      port: POSTGRES_CONFIG.port,
      user: POSTGRES_CONFIG.user,
      password: POSTGRES_CONFIG.password,
      database: POSTGRES_CONFIG.database,
      ssl: false
    }
  };

  const result = await makeN8nRequest('POST', '/credentials', credential);
  if (result) {
    console.log(`✅ Credencial PostgreSQL creada: ID ${result.id}`);
    return result.id;
  }
  return null;
}

async function createOpenAICredential() {
  console.log('\n🤖 Creando credencial OpenAI en n8n...');
  
  const credential = {
    name: 'OpenAI GPT-4o Geely',
    type: 'openAiApi',
    data: {
      apiKey: OPENAI_KEY
    }
  };

  const result = await makeN8nRequest('POST', '/credentials', credential);
  if (result) {
    console.log(`✅ Credencial OpenAI creada: ID ${result.id}`);
    return result.id;
  }
  return null;
}

async function createWebhook(name) {
  console.log(`\n🔗 Creando webhook: ${name}...`);
  
  const webhook = {
    name,
    path: `webhook-${name.toLowerCase().replace(/\s+/g, '-')}`,
    httpMethod: 'POST',
    isActive: true
  };

  const result = await makeN8nRequest('POST', '/webhooks', webhook);
  if (result) {
    console.log(`✅ Webhook creado: ${name}`);
    return result;
  }
  return null;
}

async function createMainWorkflow(postgresCredId, openaiCredId) {
  console.log('\n⚙️ Creando workflow principal (Agente Autónomo)...');

  // Workflow structure with n8n nodes
  const workflow = {
    name: 'Agente Autónomo Semanal - Geely Tracker',
    nodes: [
      {
        name: 'Start',
        type: 'n8n-nodes-base.start',
        position: [250, 300],
        parameters: {}
      },
      {
        name: 'Check Day',
        type: 'n8n-nodes-base.if',
        position: [450, 300],
        parameters: {
          conditions: {
            condition: 'expression',
            value1: '={{ new Date().getDay() === 1 }}'
          }
        }
      },
      {
        name: 'Get Ingresos',
        type: 'n8n-nodes-base.postgres',
        position: [650, 200],
        parameters: {
          operation: 'executeQuery',
          query: "SELECT SUM(monto) as total FROM ingresos WHERE user_id = 'test-user' AND EXTRACT(WEEK FROM fecha) = EXTRACT(WEEK FROM CURRENT_DATE)",
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: postgresCredId
        }
      },
      {
        name: 'Get Gastos',
        type: 'n8n-nodes-base.postgres',
        position: [650, 400],
        parameters: {
          operation: 'executeQuery',
          query: "SELECT SUM(monto) as total FROM gastos WHERE user_id = 'test-user' AND EXTRACT(WEEK FROM fecha) = EXTRACT(WEEK FROM CURRENT_DATE)",
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: postgresCredId
        }
      },
      {
        name: 'Calculate Progress',
        type: 'n8n-nodes-base.function',
        position: [850, 300],
        parameters: {
          code: `
const ingreso = $input.first().json.data[0]?.total || 0;
const gasto = $input.last().json.data[0]?.total || 0;
const neto = ingreso - gasto;
const target = 9615; // RD$300,000 / 26 semanas

return {
  ingreso,
  gasto,
  neto,
  target,
  onTrack: neto >= target,
  difference: target - neto
};
          `
        }
      },
      {
        name: 'Analyze with OpenAI',
        type: 'n8n-nodes-base.openai',
        position: [1050, 300],
        parameters: {
          model: 'gpt-4o',
          prompt: "{{ 'Analiza el progreso financiero: Ingreso ' + $node['Calculate Progress'].json.ingreso + ', Gasto ' + $node['Calculate Progress'].json.gasto + ', Neto: ' + $node['Calculate Progress'].json.neto + '. Meta semanal: ' + $node['Calculate Progress'].json.target + '. Dame 3 recomendaciones breves.' }}",
          credentialsId: openaiCredId
        },
        credentials: {
          openaiapi: openaiCredId
        }
      },
      {
        name: 'Save Analysis',
        type: 'n8n-nodes-base.postgres',
        position: [1250, 300],
        parameters: {
          operation: 'insert',
          table: 'agent_history',
          columns: 'user_id, analysis_date, total_ingreso, total_gasto, plan_status, agent_recommendation, openai_response',
          credentialsId: postgresCredId,
          values: "{{ 'test-user,' + \"'\" + new Date().toISOString().split('T')[0] + \"',\" + $node['Calculate Progress'].json.ingreso + ',' + $node['Calculate Progress'].json.gasto + \",\" + \"'\" + ($node['Calculate Progress'].json.onTrack ? 'On Track' : 'Needs Adjustment') + \"',\" + \"'\" + $node['Calculate Progress'].json.difference + \",\" + \"'\" + $node['Analyze with OpenAI'].json.choices[0].text + \"'\" }}"
        },
        credentials: {
          postgresdb: postgresCredId
        }
      },
      {
        name: 'Send Notification',
        type: 'n8n-nodes-base.webhook',
        position: [1450, 300],
        parameters: {
          method: 'POST',
          url: 'http://localhost:5173/api/agent-analysis',
          body: {
            data: '{{ $node["Save Analysis"].json }}'
          }
        }
      },
      {
        name: 'End Success',
        type: 'n8n-nodes-base.end',
        position: [1650, 300],
        parameters: {}
      }
    ],
    connections: {
      'Start': { main: [[{ node: 'Check Day', branch: 0 }]] },
      'Check Day': { main: [[{ node: 'Get Ingresos', branch: 0 }, { node: 'Get Gastos', branch: 0 }]] },
      'Get Ingresos': { main: [[{ node: 'Calculate Progress', branch: 0 }]] },
      'Get Gastos': { main: [[{ node: 'Calculate Progress', branch: 0 }]] },
      'Calculate Progress': { main: [[{ node: 'Analyze with OpenAI', branch: 0 }]] },
      'Analyze with OpenAI': { main: [[{ node: 'Save Analysis', branch: 0 }]] },
      'Save Analysis': { main: [[{ node: 'Send Notification', branch: 0 }]] },
      'Send Notification': { main: [[{ node: 'End Success', branch: 0 }]] }
    }
  };

  const result = await makeN8nRequest('POST', '/workflows', workflow);
  if (result) {
    console.log(`✅ Workflow creado: ID ${result.id}`);
    return result.id;
  }
  return null;
}

async function main() {
  console.log('🚀 Iniciando configuración de n8n...');
  console.log('📌 URL n8n:', N8N_URL);

  try {
    // Verify n8n is running
    const health = await fetch(`${N8N_URL.replace('/api/v1', '')}/health`);
    if (!health.ok) {
      console.error('❌ n8n no está accesible en', N8N_URL);
      console.log('\n⚠️ Verifica que n8n esté corriendo en http://72.62.161.96:5678');
      return;
    }

    console.log('✅ n8n está accesible\n');

    // Create credentials
    const postgresCredId = await createPostgresCredential();
    const openaiCredId = await createOpenAICredential();

    if (!postgresCredId || !openaiCredId) {
      console.error('❌ No se pudieron crear las credenciales');
      return;
    }

    // Create webhooks
    await createWebhook('Save Ingreso');
    await createWebhook('Save Gasto');
    await createWebhook('Get Analysis');

    // Create main workflow
    const workflowId = await createMainWorkflow(postgresCredId, openaiCredId);

    if (workflowId) {
      console.log('\n✅ ¡Configuración completada!');
      console.log('\n📋 Pasos que falta ejecutar manualmente en n8n:');
      console.log('  1. Abre http://72.62.161.96:5678');
      console.log('  2. Edita el workflow "Agente Autónomo Semanal - Geely Tracker"');
      console.log('  3. Añade triggers de Cron para lunes a las 9 AM');
      console.log('  4. Activa el workflow');
      console.log('  5. Prueba desde frontend');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

main();
