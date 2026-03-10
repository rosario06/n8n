import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const N8N_URL = 'http://72.62.161.96:5678';
const N8N_API = `${N8N_URL}/api/v1`;

// Configuración
const POSTGRES_CRED = {
  name: 'PostgreSQL Geely DB',
  type: 'postgres',
  data: {
    host: '72.62.161.96',
    port: 5432,
    user: 'edilver_admin',
    password: '12345678As',
    database: 'geely_db',
    ssl: 'disable',
    allowUnauthorizedCerts: false
  }
};

const  OPENAI_CRED = {
  name: 'OpenAI GPT-4o API',
  type: 'openAiApi',
  data: {
    apiKey: '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'
  }
};

// Workflow JSON template 
const WORKFLOW_TEMPLATE = {
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
      name: 'Insert Ingreso DB',
      type: 'n8n-nodes-base.postgres',
      position: [450, 300],
      parameters: {
        operation: 'insert',
        table: 'ingresos',
        columns: 'user_id,fecha,categoria,monto,descripcion',
        values: "='test-user'={{ $json.fecha }}={{ $json.categoria }}={{ $json.monto }}={{ $json.descripcion }}"
      }
    },
    {
      name: 'Webhook Gasto',
      type: 'n8n-nodes-base.webhook',
      position: [250, 600],
      parameters: {
        httpMethod: 'POST',
        path: 'save-gasto',
        responseMode: 'onReceived'
      }
    },
    {
      name: 'Insert Gasto DB',
      type: 'n8n-nodes-base.postgres',
      position: [450, 600],
      parameters: {
        operation: 'insert',
        table: 'gastos',
        columns: 'user_id,fecha,categoria,monto,descripcion',
        values: "='test-user'={{ $json.fecha }}={{ $json.categoria }}={{ $json.monto }}={{ $json.descripcion }}"
      }
    },
    {
      name: 'Cron: Lunes 9AM',
      type: 'n8n-nodes-base.cron',
      position: [650, 450],
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
      name: 'Query: Weekly Ingresos',
      type: 'n8n-nodes-base.postgres',
      position: [850, 350],
      parameters: {
        operation: 'executeQuery',
        query: "SELECT COALESCE(SUM(monto), 0) as total FROM ingresos WHERE user_id = 'test-user' AND date_trunc('week', fecha) = date_trunc('week', CURRENT_DATE)"
      }
    },
    {
      name: 'Query: Weekly Gastos',
      type: 'n8n-nodes-base.postgres',
      position: [850, 550],
      parameters: {
        operation: 'executeQuery',
        query: "SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE user_id = 'test-user' AND date_trunc('week', fecha) = date_trunc('week', CURRENT_DATE)"
      }
    },
    {
      name: 'Function: Calculate Neto',
      type: 'n8n-nodes-base.function',
      position: [1050, 450],
      parameters: {
        code: "const ing = Number($input.first().json[0]?.total || 0);\nconst gast = Number($input.last().json[0]?.total || 0);\nconst neto = ing - gast;\nconst target = 9615;\nreturn [{ingreso: ing, gasto: gast, neto, target, onTrack: neto >= target}];"
      }
    },
    {
      name: 'OpenAI: Generate Recommendations',
      type: 'n8n-nodes-base.openaiChat',
      position: [1250, 450],
      parameters: {
        model: 'gpt-4o',
        messages: {
          messageValues: [
            {
              content: "Analisis financiero semanal:\\n- Ingresos: RD${{ $node['Function: Calculate Neto'].json[0].ingreso }}\\n- Gastos: RD${{ $node['Function: Calculate Neto'].json[0].gasto }}\\n- Neto: RD${{ $node['Function: Calculate Neto'].json[0].neto }}\\n- Meta: RD${{ $node['Function: Calculate Neto'].json[0].target }}\\n\\nSi está fuera de meta, 3 estrategias de mejora. Si está en meta, felicita y sugiere exceder. Máximo 150 palabras en español."
            }
          ]
        }
      }
    },
    {
      name: 'Insert: Save Analysis',
      type: 'n8n-nodes-base.postgres',
      position: [1450, 450],
      parameters: {
        operation: 'insert',
        table: 'agent_history',
        columns: 'user_id,analysis_date,total_ingreso,total_gasto,plan_status,agent_recommendation',
        values: "'test-user',CURRENT_DATE={{ $node['Function: Calculate Neto'].json[0].ingreso }}={{ $node['Function: Calculate Neto'].json[0].gasto }}={{ $node['Function: Calculate Neto'].json[0].onTrack ? 'On Track' : 'Crítico' }}='AI Generated'"
      }
    }
  ],
  connections: {
    'Webhook Ingreso': { main: [[{ node: 'Insert Ingreso DB', branch: 0 }]] },
    'Insert Ingreso DB': { main: [[]] },
    'Webhook Gasto': { main: [[{ node: 'Insert Gasto DB', branch: 0 }]] },
    'Insert Gasto DB': { main: [[]] },
    'Cron: Lunes 9AM': { main: [[{ node: 'Query: Weekly Ingresos', branch: 0 }, { node: 'Query: Weekly Gastos', branch: 0 }]] },
    'Query: Weekly Ingresos': { main: [[{ node: 'Function: Calculate Neto', branch: 0 }]] },
    'Query: Weekly Gastos': { main: [[{ node: 'Function: Calculate Neto', branch: 0 }]] },
    'Function: Calculate Neto': { main: [[{ node: 'OpenAI: Generate Recommendations', branch: 0 }]] },
    'OpenAI: Generate Recommendations': { main: [[{ node: 'Insert: Save Analysis', branch: 0 }]] },
    'Insert: Save Analysis': { main: [[]] }
  }
};

async function createCreds(name, config) {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${N8N_API}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        timeout: 5000
      });

      if (response.ok || response.status === 400) { // 400 = already exists
        const data = await response.json();
        if (data.id) {
          console.log(`✅ ${name}: ID ${data.id}`);
          return data.id;
        } else if(response.status === 400) {
          console.log(`⚠️ ${name}: posiblemente ya existe`);
          return null; // Will use by name later
        }
      }
    } catch (err) {
      console.log(`⏳ Intento ${i+1}/${maxRetries}...`);
      if (i === maxRetries - 1) {
        console.error(`❌ ${name}: No accesible`);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function createWorkflow(config) {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`${N8N_API}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
        timeout: 5000
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Workflow: ID ${data.id}`);
        return data.id;
      }
    } catch (err) {
      console.log(`⏳ Intento ${i+1}/${maxRetries}...`);
      if (i === maxRetries - 1) {
        console.error(`❌ Workflow: No creado (n8n no accesible)`);
        return null;
      }
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function main() {
  console.log('\n🔧 ============ SETUP N8N ============\n');
  console.log('📌 n8n: http://72.62.161.96:5678');
  console.log('📌 PostgreSQL: 72.62.161.96:5432/geely_db\n');

  console.log('⏳ Creando credenciales en n8n...\n');
  
  const pgCred = await createCreds('PostgreSQL', POSTGRES_CRED);
  const aiCred = await createCreds('OpenAI', OPENAI_CRED);

  if (!pgCred && !aiCred) {
    console.log('\n⚠️ n8n no accesible. Generando json para importar manualmente...\n');
    
    // Save workflow json for manual import
    fs.writeFileSync(
      path.join(process.cwd(), 'n8n_workflow_import.json'),
      JSON.stringify(WORKFLOW_TEMPLATE, null, 2)
    );

    console.log('📋 Instrucciones manuales:\n');
    console.log('1. Abre http://72.62.161.96:5678 en navegador');
    console.log('2. Ve a Settings > Credentials');
    console.log('3. Crea PostgreSQL credential:');
    console.log('   - NAME: PostgreSQL Geely DB');
    console.log('   - HOST: 72.62.161.96, PORT: 5432');
    console.log('   - USER: edilver_admin, PASS: 12345678As');
    console.log('   - DATABASE: geely_db');
    console.log('4. Crea OpenAI credential:');
    console.log(`   - NAME: OpenAI GPT-4o API`);
    console.log(`   - API_KEY: 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`);
    console.log('5. Crea 3 Webhooks:');
    console.log('   - POST /webhook/save-ingreso');
    console.log('   - POST /webhook/save-gasto');
    console.log('   - GET /webhook/get-analysis');
    console.log('6. Importa el workflow: n8n_workflow_import.json\n');
    process.exit(0);
  }

  console.log('\n⏳ Creando workflow...\n');
  const workflowId = await createWorkflow(WORKFLOW_TEMPLATE);

  if (workflowId) {
    console.log('\n' + '='.repeat(50));
    console.log('✅ SETUP COMPLETADO');
    console.log('='.repeat(50));
    console.log(`\n🔗 Workflow: http://72.62.161.96:5678/workflows/${workflowId}`);
    console.log(`\n📌 Frontend: http://localhost:5173`);
    console.log(`\n🎯 Próximos pasos:`);
    console.log(`   1. Abre el workflow en n8n`);
    console.log(`   2. Activa el workflow`);
    console.log(`   3. Prueba desde frontend`);
  }
}

main().catch(console.error);
