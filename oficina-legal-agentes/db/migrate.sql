-- =============================================================================
-- Migración SQL: Oficina Legal Automatizada
-- Descripción: Script idempotente para ejecutar schema.sql de forma segura
-- Uso: psql -U postgres -d legal_office_db -f db/migrate.sql
-- =============================================================================

BEGIN;

-- Transactions deshabilitadas para operaciones DDL (solo como precaución)
-- Mantener comentarios de auditoría

CREATE SCHEMA IF NOT EXISTS legal;
SET search_path TO legal, public;

-- ============================================================================
-- TABLA CLIENTS: Información de clientes
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(10),
    id_number VARCHAR(20) UNIQUE,
    birthdate DATE,
    contact_preference VARCHAR(50) DEFAULT 'email',
    consent_data_processing BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_clients_email_not_null 
    ON clients (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients (phone);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients (created_at DESC);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_clients_update_timestamp
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- TABLA CASES: Información de casos
-- ============================================================================

CREATE TABLE IF NOT EXISTS cases (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    case_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'abierto',
    description TEXT,
    opening_date DATE DEFAULT CURRENT_DATE,
    expected_close_date DATE,
    actual_close_date DATE,
    assigned_lawyer VARCHAR(255),
    estimated_hours DECIMAL(8,2),
    actual_hours DECIMAL(8,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases (client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases (status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases (created_at DESC);

CREATE TRIGGER trigger_cases_update_timestamp
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- TABLA DEADLINES: Plazos críticos
-- ============================================================================

CREATE TABLE IF NOT EXISTS deadlines (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    deadline_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente',
    reminder_sent_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines (case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_date ON deadlines (deadline_date);

CREATE TRIGGER trigger_deadlines_update_timestamp
    BEFORE UPDATE ON deadlines
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- TABLA APPOINTMENTS: Citas y reuniones
-- ============================================================================

CREATE TABLE IF NOT EXISTS appointments (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
    appointment_type VARCHAR(50),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    assigned_to VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'programada',
    reminder_sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_case_id ON appointments (case_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled_at ON appointments (scheduled_at);

CREATE TRIGGER trigger_appointments_update_timestamp
    BEFORE UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- TABLA INVOICES: Facturación
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
    client_id BIGINT NOT NULL REFERENCES clients(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_type VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(50) DEFAULT 'pendiente',
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_case_id ON invoices (case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices (due_date);

CREATE TRIGGER trigger_invoices_update_timestamp
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- ============================================================================
-- TABLA CASE_EVENTS: Registro de eventos de casos
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_events (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_payload JSONB,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON case_events (case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_event_type ON case_events (event_type);
CREATE INDEX IF NOT EXISTS idx_case_events_created_at ON case_events (created_at DESC);

-- ============================================================================
-- TABLA CONVERSATIONS: Historial de conversaciones
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT REFERENCES cases(id) ON DELETE SET NULL,
    client_id BIGINT NOT NULL REFERENCES clients(id),
    channel VARCHAR(50),
    incoming_message TEXT,
    outgoing_response TEXT,
    classification VARCHAR(100),
    sentiment VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_case_id ON conversations (case_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations (client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations (created_at DESC);

-- ============================================================================
-- TABLA KNOWLEDGE_CHUNKS: Base de conocimiento para RAG
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id BIGSERIAL PRIMARY KEY,
    chunk_type VARCHAR(100),
    title VARCHAR(255),
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(1536),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_type ON knowledge_chunks (chunk_type);

-- ============================================================================
-- TABLA AUDIT_LOGS: Registro de auditoría para compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_type VARCHAR(50),
    actor_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs (actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ============================================================================
-- COMENTARIOS DE TABLAS (Documentación)
-- ============================================================================

COMMENT ON TABLE clients IS 'Registro de clientes de la oficina legal';
COMMENT ON COLUMN clients.consent_data_processing IS 'RGPD: Consentimiento para procesar datos personales';

COMMENT ON TABLE cases IS 'Expedientes de casos legales';
COMMENT ON COLUMN cases.status IS 'Estados: abierto, en_negociacion, resuelto, cerrado';

COMMENT ON TABLE deadlines IS 'Plazos críticos (demandas, contestaciones, etc)';
COMMENT ON TABLE appointments IS 'Citas y reuniones agendadas';
COMMENT ON TABLE invoices IS 'Facturas y registros de pago';
COMMENT ON TABLE case_events IS 'Historial de eventos de cada caso (es flexible: case_id puede ser NULL)';
COMMENT ON TABLE conversations IS 'Conversaciones con clientes por canal (WhatsApp, email, etc)';
COMMENT ON TABLE knowledge_chunks IS 'Base de conocimiento para generar borradores (jurisprudencia, plantillas, etc)';
COMMENT ON TABLE audit_logs IS 'Registro de auditoría para compliance normativo (RGPD, ISO 27001)';

-- ============================================================================
-- Verificación final
-- ============================================================================

-- Esta línea se ejecuta solo si todo está correcto
DO $$
DECLARE
    table_count INT;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'legal';
    
    RAISE NOTICE 'Migración completada. % tablas creadas.', table_count;
END
$$;

COMMIT;
