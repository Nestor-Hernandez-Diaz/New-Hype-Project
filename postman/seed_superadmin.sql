-- ============================================================
-- NewHype ERP - Seed Script para Prueba Final E2E
-- Ejecutar ANTES de correr la coleccion Postman
-- ============================================================

-- 1. Crear superadmin de plataforma
-- Password: SuperAdmin2026 (BCrypt strength 10)
INSERT INTO usuarios_plataforma
    (email, username, password_hash, nombre_completo, tiene_2fa, estado, created_at, updated_at)
VALUES
    ('superadmin@newhype.pe', 'superadmin',
     '$2a$10$rqgEn58GBDw37SDT6foEVOSlucHVgW1Q2EdIbuYjbegqqqHL.SlyW',
     'Super Administrador', 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Verificar que se creo correctamente
SELECT id, email, username, nombre_completo, estado
FROM usuarios_plataforma
WHERE email = 'superadmin@newhype.pe';
