import pkg from 'pg';
const { Client } = pkg;

const N8N_URL = 'http://72.62.161.96:5678';
const N8N_API_URL = `${N8N_URL}/api/v1`;

const POSTGRES_CONFIG = {
  host: '72.62.161.96',
  port: 5432,
  user: 'edilver_admin',
  password: '12345678As',
  database: 'geely_db'
};

const OPENAI_KEY = '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';

async function makeRequest(method, endpoint, body = null) {
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
    const response = await fetch(`${N8N_API_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ n8n API error (${response.status}):`, data);
      return null;
    }
    return data;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

async function verifyDatabase() {
  console.log('🔍 Verificando PostgreSQL...');
  const client = new Client(POSTGRES_CONFIG);
  
  try {
    await client.connect();
    const result = await client.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(`✅ PostgreSQL OK - ${result.rows[0].count} tablas encontradas`);
    await client.end();
    return true;
  } catch (err) {
    console.error('❌ PostgreSQL error:', err.message);
    return false;
  }
}

async function createPostgresCredential() {
  console.log('\n🔐 Creando credencial PostgreSQL en n8n...');
  
  const credential = {
    name: 'PostgreSQL Geely',
    type: 'postgres',
    data: {
      host: POSTGRES_CONFIG.host,
      port: POSTGRES_CONFIG.port,
      user: POSTGRES_CONFIG.user,
      password: POSTGRES_CONFIG.password,
      database: POSTGRES_CONFIG.database,
      ssl: false,
      sslMode: 'disable'
    }
  };

  const result = await makeRequest('POST', '/credentials', credential);
  if (result && result.id) {
    console.log(`✅ Credencial PostgreSQL ID: ${result.id}`);
    return result.id;
  }
  return null;
}

async function createOpenAICredential() {
  console.log('🤖 Creando credencial OpenAI en n8n...');
  
  const credential = {
    name: 'OpenAI GPT-4o',
    type: 'openAiApi',
    data: {
      apiKey: OPENAI_KEY
    }
  };

  const result = await makeRequest('POST', '/credentials', credential);
  if (result && result.id) {
    console.log(`✅ Credencial OpenAI ID: ${result.id}`);
    return result.id;
  }
  return null;
}

async function createWebhooks() {
  console.log('\n🔗 Creando webhooks...');
  
  const webhooks = [
    { name: 'Save Ingreso', path: 'save-ingreso' },
    { name: 'Save Gasto', path: 'save-gasto' },
    { name: 'Get Analysis', path: 'get-analysis' }
  ];

  const results = {};
  
  for (const webhook of webhooks) {
    const payload = {
      name: webhook.name,
      path: webhook.path,
      isActive: true,
      httpMethod: 'POST',
      responseMode: 'onReceived'
    };

    const result = await makeRequest('POST', '/webhooks', payload);
    if (result && result.id) {
      console.log(`✅ Webhook "${webhook.name}" creado`);
      results[webhook.path] = result.id;
    } else {
      console.warn(`⚠️ Webhook "${webhook.name}" puede ya existir`);
    }
  }
  
  return results;
}

async function createWorkflow(postgresCredId, openaiCredId) {
  console.log('\n⚙️ Creando workflow "Agente Autónomo"...');

  const workflow = {
    name: 'Agente Autónomo Semanal',
    active: true,
    nodes: [
      {
        name: 'Webhook Ingreso',
        type: 'n8n-nodes-base.webhook',
        position: [250, 300],
        parameters: {
          httpMethod: 'POST',
          path: 'save-ingreso',
          responseMode: 'onReceived'
        }
      },
      {
        name: 'Insert Ingreso',
        type: 'n8n-nodes-base.postgres',
        position: [450, 300],
        parameters: {
          operation: 'insert',
          schema: 'public',
          table: 'ingresos',
          columns: 'user_id,fecha,categoria,monto,descripcion',
          values: '={{ $json.user_id }},={{ $json.fecha }},={{ $json.categoria }},={{ $json.monto }},={{ $json.descripcion }}',
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: {
            id: postgresCredId,
            name: 'PostgreSQL Geely'
          }
        }
      },
      {
        name: 'Webhook Gasto',
        type: 'n8n-nodes-base.webhook',
        position: [250, 750],
        parameters: {
          httpMethod: 'POST',
          path: 'save-gasto',
          responseMode: 'onReceived'
        }
      },
      {
        name: 'Insert Gasto',
        type: 'n8n-nodes-base.postgres',
        position: [450, 750],
        parameters: {
          operation: 'insert',
          schema: 'public',
          table: 'gastos',
          columns: 'user_id,fecha,categoria,monto,descripcion',
          values: '={{ $json.user_id }},={{ $json.fecha }},={{ $json.categoria }},={{ $json.monto }},={{ $json.descripcion }}',
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: {
            id: postgresCredId,
            name: 'PostgreSQL Geely'
          }
        }
      },
      {
        name: 'Cron Lunes 9AM',
        type: 'n8n-nodes-base.cron',
        position: [650, 500],
        parameters: {
          triggerTimes: {
            item: [
              {
                mode: 'everyWeek',
                dayOfWeek: 1,
                hour: 9,
                minute: 0
              }
            ]
          }
        }
      },
      {
        name: 'Get Weekly Ingresos',
        type: 'n8n-nodes-base.postgres',
        position: [850, 400],
        parameters: {
          operation: 'executeQuery',
          query: "SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE user_id = 'test-user' AND EXTRACT(WEEK FROM fecha) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)",
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: {
            id: postgresCredId,
            name: 'PostgreSQL Geely'
          }
        }
      },
      {
        name: 'Get Weekly Gastos',
        type: 'n8n-nodes-base.postgres',
        position: [850, 600],
        parameters: {
          operation: 'executeQuery',
          query: "SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE user_id = 'test-user' AND EXTRACT(WEEK FROM fecha) = EXTRACT(WEEK FROM CURRENT_DATE) AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)",
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: {
            id: postgresCredId,
            name: 'PostgreSQL Geely'
          }
        }
      },
      {
        name: 'Calculate Progress',
        type: 'n8n-nodes-base.function',
        position: [1050, 500],
        parameters: {
          code: `const ingreso = $input.first().json.data?.[0]?.total ?? 0;
const gasto = $input.last().json.data?.[0]?.total ?? 0;
const neto = ingreso - gasto;
const target = 9615;

return {
  ingreso: parseFloat(ingreso),
  gasto: parseFloat(gasto),
  neto: parseFloat(neto),
  target,
  onTrack: neto >= target,
  difference: Math.abs(target - neto)
};`
        }
      },
      {
        name: 'OpenAI Analysis',
        type: 'n8n-nodes-base.openaiChat',
        position: [1250, 500],
        parameters: {
          model: 'gpt-4o',
          messages: {
            messageValues: [
              {
                content: "{{ 'Éstas son las métricas financieras de esta semana:\\nIngresos: RD$' + $node['Calculate Progress'].json.ingreso + '\\nGastos: RD$' + $node['Calculate Progress'].json.gasto + '\\nNeto: RD$' + $node['Calculate Progress'].json.neto + '\\nMeta semanal: RD$' + $node['Calculate Progress'].json.target + '\\n\\nSi está fuera de meta, dame 3 estrategias para mejorar. Si está en meta, felicítalo y sugiere una estrategia para exceder la meta. Responde en español, máximo 150 palabras.' }}"
              }
            ]
          },
          credentialsId: openaiCredId
        },
        credentials: {
          openaiapi: {
            id: openaiCredId,
            name: 'OpenAI GPT-4o'
          }
        }
      },
      {
        name: 'Save Analysis',
        type: 'n8n-nodes-base.postgres',
        position: [1450, 500],
        parameters: {
          operation: 'insert',
          schema: 'public',
          table: 'agent_history',
          columns: 'user_id,analysis_date,total_ingreso,total_gasto,plan_status,agent_recommendation,openai_response',
          values: "'test-user',CURRENT_DATE,{{ $node['Calculate Progress'].json.ingreso }},{{ $node['Calculate Progress'].json.gasto }},'{{ $node['Calculate Progress'].json.onTrack ? 'On Track' : 'Needs Adjustment' }}','Weekly Analysis','{{ $node[\"OpenAI Analysis\"].json.choices[0].message.content }}'",
          credentialsId: postgresCredId
        },
        credentials: {
          postgresdb: {
            id: postgresCredId,
            name: 'PostgreSQL Geely'
          }
        }
      }
    ],
    connections: {
      'Webhook Ingreso': {
        main: [[{ node: 'Insert Ingreso', branch: 0 }]]
      },
      'Insert Ingreso': {
        main: [[{ node: 'Webhook Ingreso', branch: 0 }]]
      },
      'Webhook Gasto': {
        main: [[{ node: 'Insert Gasto', branch: 0 }]]
      },
      'Insert Gasto': {
        main: [[{ node: 'Webhook Gasto', branch: 0 }]]
      },
      'Cron Lunes 9AM': {
        main: [[{ node: 'Get Weekly Ingresos', branch: 0 }, { node: 'Get Weekly Gastos', branch: 0 }]]
      },
      'Get Weekly Ingresos': {
        main: [[{ node: 'Calculate Progress', branch: 0 }]]
      },
      'Get Weekly Gastos': {
        main: [[{ node: 'Calculate Progress', branch: 0 }]]
      },
      'Calculate Progress': {
        main: [[{ node: 'OpenAI Analysis', branch: 0 }]]
      },
      'OpenAI Analysis': {
        main: [[{ node: 'Save Analysis', branch: 0 }]]
      }
    }
  };

  const result = await makeRequest('POST', '/workflows', workflow);
  if (result && result.id) {
    console.log(`✅ Workflow creado: ID ${result.id}`);
    console.log(`🔗 Acceso: ${N8N_URL}/workflows/${result.id}`);
    return result.id;
  }
  return null;
}

async function main() {
  console.log('🚀 ============ SETUP N8N WORKFLOW ============\n');
  console.log(`📌 n8n URL: ${N8N_URL}`);
  console.log(`📌 PostgreSQL: ${POSTGRES_CONFIG.host}:${POSTGRES_CONFIG.port}/${POSTGRES_CONFIG.database}\n`);

  try {
    // Verify database
    const dbOk = await verifyDatabase();
    if (!dbOk) {
      console.error('❌ PostgreSQL no accesible. Verifica credenciales.');
      return;
    }

    // Test n8n availability
    console.log('\n📡 Verificando n8n...');
    const healthCheck = await fetch(`${N8N_URL}/healthz`);
    if (!healthCheck.ok) {
      console.error('❌ n8n no está accesible en', N8N_URL);
      console.log('⚠️ Asegúrate que n8n esté corriendo en Coolify');
      return;
    }
    console.log('✅ n8n accesible\n');

    // Create credentials
    const postgresCredId = await createPostgresCredential();
    const openaiCredId = await createOpenAICredential();

    if (!postgresCredId || !openaiCredId) {
      console.error('\n❌ Error creando credenciales');
      return;
    }

    // Create webhooks
    const webhooks = await createWebhooks();

    // Create workflow
    const workflowId = await createWorkflow(postgresCredId, openaiCredId);

    if (workflowId) {
      console.log('\n' + '='.repeat(50));
      console.log('✅ ¡SETUP COMPLETADO EXITOSAMENTE!');
      console.log('='.repeat(50));
      console.log('\n📋 Workflow creado:');
      console.log(`   ID: ${workflowId}`);
      console.log(`   URL: ${N8N_URL}/workflows/${workflowId}`);
      console.log('\n🎯 Próximos pasos:');
      console.log('   1. Abre el workflow en n8n');
      console.log('   2. Verifica que todos los nodos estén conectados');
      console.log('   3. Activa el workflow');
      console.log('   4. Prueba desde frontend (npm run dev)');
      console.log('\n📝 Frontend esperando en: http://localhost:5173');
    } else {
      console.error('\n❌ Error creando workflow');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
