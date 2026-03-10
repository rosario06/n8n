import pkg from 'pg';
const { Client } = pkg;

// PostgreSQL connection config
const client = new Client({
  host: '72.62.161.96',
  port: 5432,
  user: 'edilver_admin',
  password: '12345678As',
  database: 'geely_db'
});

async function setupDatabase() {
  try {
    console.log('🔗 Conectando a PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado a geely_db');

    // Read SQL file content (inline for portability)
    const setupSQL = `
-- Create tables
DROP TABLE IF EXISTS agent_history CASCADE;
DROP TABLE IF EXISTS ingresos CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS planes_activos CASCADE;

CREATE TABLE ingresos (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  fecha DATE NOT NULL,
  categoria VARCHAR(100),
  monto DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  fecha DATE NOT NULL,
  categoria VARCHAR(100),
  monto DECIMAL(10, 2) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE planes_activos (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  plan_name VARCHAR(200),
  meta_monto DECIMAL(15, 2),
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50),
  analysis_date DATE,
  total_ingreso DECIMAL(15, 2),
  total_gasto DECIMAL(15, 2),
  plan_status VARCHAR(50),
  agent_recommendation TEXT,
  openai_response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_ingresos_user ON ingresos(user_id);
CREATE INDEX idx_gastos_user ON gastos(user_id);
CREATE INDEX idx_planes_user ON planes_activos(user_id);
CREATE INDEX idx_agent_user ON agent_history(user_id);

-- Test insert
INSERT INTO ingresos (user_id, fecha, categoria, monto, descripcion) 
VALUES ('test-user', CURRENT_DATE, 'Salario', 15000, 'Ingreso inicial de prueba');

INSERT INTO gastos (user_id, fecha, categoria, monto, descripcion) 
VALUES ('test-user', CURRENT_DATE, 'Comida', 500, 'Gasto inicial de prueba');

COMMIT;
    `;

    console.log('\n📝 Ejecutando SQL schema...');
    await client.query(setupSQL);
    console.log('✅ Tablas creadas exitosamente');

    // Verify tables exist
    console.log('\n🔍 Verificando tablas...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Tablas en geely_db:');
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    // Count test data
    const ingresos = await client.query('SELECT COUNT(*) as count FROM ingresos');
    const gastos = await client.query('SELECT COUNT(*) as count FROM gastos');
    
    console.log('\n📊 Datos de prueba:');
    console.log(`  Ingresos: ${ingresos.rows[0].count}`);
    console.log(`  Gastos: ${gastos.rows[0].count}`);

    console.log('\n✅ ¡Base de datos configurada exitosamente!');
    console.log('\n📌 Próximos pasos:');
    console.log('  1. Configurar n8n credentials (PostgreSQL + OpenAI)');
    console.log('  2. Crear webhooks en n8n');
    console.log('  3. Crear workflow autónomo');
    console.log('  4. Ejecutar npm run dev y probar');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

setupDatabase();
