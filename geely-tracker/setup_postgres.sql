-- ==================== GEELY TRACKER DATABASE SETUP ====================
-- SQL para crear todas las tablas necesarias en PostgreSQL
-- Ejecutar en: psql -U geely -d geely_db -f this_file.sql

-- ==================== TABLA AGENT_HISTORY ====================
-- Guarda análisis semanales del agente IA
CREATE TABLE IF NOT EXISTS agent_history (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT 'juan' NOT NULL,
  week_of DATE NOT NULL,
  target_income BIGINT DEFAULT 33333,
  actual_income BIGINT DEFAULT 0,
  active_plans TEXT[],
  agent_analysis TEXT,
  suggestions JSONB,
  user_feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_history_user_week 
ON agent_history(user_id, week_of DESC);

-- ==================== TABLA INGRESOS ====================
-- Registro de ingresos extras
CREATE TABLE IF NOT EXISTS ingresos (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT 'juan' NOT NULL,
  monto BIGINT NOT NULL,
  fuente TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ingresos_user_fecha 
ON ingresos(user_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_ingresos_user 
ON ingresos(user_id);

-- ==================== TABLA GASTOS ====================
-- Registro de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT 'juan' NOT NULL,
  monto BIGINT NOT NULL,
  categoria TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gastos_user_fecha 
ON gastos(user_id, fecha DESC);

CREATE INDEX IF NOT EXISTS idx_gastos_user 
ON gastos(user_id);

-- ==================== TABLA PLANES_ACTIVOS ====================
-- Tracks which planes are active for each user
CREATE TABLE IF NOT EXISTS planes_activos (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT DEFAULT 'juan' NOT NULL,
  plan_id TEXT NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, plan_id)
);

CREATE INDEX IF NOT EXISTS idx_planes_user 
ON planes_activos(user_id);

-- ==================== SAMPLE DATA ====================
-- Datos de ejemplo (comentar si no quieres)

-- Ejemplo: insertar un ingreso
-- INSERT INTO ingresos (user_id, monto, fuente, descripcion, fecha) 
-- VALUES ('juan', 15000, 'Automatización n8n', 'Flujo para restaurante local', '2026-03-09');

-- Ejemplo: insertar un gasto
-- INSERT INTO gastos (user_id, monto, categoria, descripcion, fecha)
-- VALUES ('juan', 5000, 'Alimentación', 'Supermercado', '2026-03-09');

-- Ejemplo: insertar planes activos
-- INSERT INTO planes_activos (user_id, plan_id, activo)
-- VALUES 
--   ('juan', 'n8n_basico', true),
--   ('juan', 'agente_ia', true),
--   ('juan', 'curso_hotmart', false);

-- ==================== VERIFICATION ====================
-- Para verificar que se crearon correctamente:

-- \dt agent_history
-- \dt ingresos
-- \dt gastos
-- \dt planes_activos

-- SELECT COUNT(*) FROM ingresos;
-- SELECT COUNT(*) FROM gastos;
-- SELECT COUNT(*) FROM agent_history;
-- SELECT COUNT(*) FROM planes_activos;
