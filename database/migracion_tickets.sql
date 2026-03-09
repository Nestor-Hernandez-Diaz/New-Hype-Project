-- ============================================================================
-- MIGRACIÓN: Módulo de Tickets de Soporte (Conversación)
-- Ejecutar en phpMyAdmin sobre la BD: ventas_newhype_prod
-- ============================================================================

-- 1. Agregar columna usuario_id a tickets_soporte (quién creó el ticket del lado tenant)
ALTER TABLE tickets_soporte
ADD COLUMN usuario_id BIGINT NULL COMMENT 'Quién creó el ticket (usuario tenant)' AFTER tenant_id,
ADD CONSTRAINT fk_tickets_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- 2. Agregar estado RESUELTO al enum (antes de CERRADO)
ALTER TABLE tickets_soporte
MODIFY COLUMN estado ENUM('ABIERTO','EN_PROCESO','RESUELTO','CERRADO') DEFAULT 'ABIERTO';

-- 3. Crear tabla de respuestas/conversación de tickets
CREATE TABLE respuestas_ticket (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    ticket_id       BIGINT          NOT NULL,
    autor_tipo      ENUM('TENANT','PLATFORM') NOT NULL,
    autor_id        BIGINT          NOT NULL,
    mensaje         TEXT            NOT NULL,
    created_at      DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_resp_ticket (ticket_id),
    CONSTRAINT fk_resp_ticket FOREIGN KEY (ticket_id) REFERENCES tickets_soporte(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificación
SELECT 'Migración completada exitosamente' AS resultado;
