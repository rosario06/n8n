import pkg from 'pg';
const { Client } = pkg;

const c = new Client({
  host: '72.62.161.96',
  port: 5432,
  user: 'edilver_admin',
  password: '12345678As',
  database: 'geely_db'
});

async function checkTable() {
  try {
    await c.connect();
    
    console.log('=== ESTRUCTURA TABLA AGENT_HISTORY ===');
    const result = await c.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'agent_history' 
      ORDER BY ordinal_position
    `);
    
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });
    
    await c.end();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkTable();
