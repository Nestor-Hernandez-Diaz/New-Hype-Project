-- ============================================================
-- NewHype ERP - Seed Script para PRODUCCION (cPanel)
-- Base de datos: ventas_newhype_prod
-- Ejecutar DESPUES de importar el schema de 51 tablas
-- ============================================================

-- 1. Crear superadmin de plataforma
-- Password: SuperAdmin2026 (BCrypt strength 10, prefix $2a$)
INSERT INTO usuarios_plataforma
    (email, username, password_hash, nombre_completo, tiene_2fa, estado, created_at, updated_at)
VALUES
    ('superadmin@newhype.pe', 'superadmin',
     '$2a$10$rqgEn58GBDw37SDT6foEVOSlucHVgW1Q2EdIbuYjbegqqqHL.SlyW',
     'Super Administrador', 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 2. Verificar creacion
SELECT id, email, username, nombre_completo, estado
FROM usuarios_plataforma
WHERE email = 'superadmin@newhype.pe';

-- ============================================================
-- NOTA: Despues de ejecutar este seed, puedes hacer login como
-- superadmin via POST /New-Hype-Project/api/v1/platform/auth/login
-- con body: { "emailOrUsername": "superadmin@newhype.pe", "password": "SuperAdmin2026" }
-- ============================================================
