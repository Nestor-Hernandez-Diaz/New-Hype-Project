package com.newhype.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Utilidad JWT para generación y validación de tokens.
 * Implementación completa en Fase 1 (módulo Auth).
 *
 * Responsabilidades futuras:
 *  - generateToken(userId, tenantId, role) → String
 *  - validateToken(token) → boolean
 *  - extractUserId(token) → Long
 *  - extractTenantId(token) → Long
 *  - extractRole(token) → String
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    // TODO: Implementar en Fase 1 — Auth endpoints
}
