package com.newhype.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ── Generate access token (tenant user) ──
    public String generateAccessToken(Long userId, Long tenantId, String role) {
        return buildToken(userId, tenantId, role, "tenant", "access", jwtExpirationMs);
    }

    // ── Generate access token (platform superadmin) ──
    public String generatePlatformAccessToken(Long userId) {
        return buildToken(userId, null, "SUPERADMIN", "platform", "access", jwtExpirationMs);
    }

    // ── Generate refresh token ──
    public String generateRefreshToken(Long userId, Long tenantId, String scope) {
        return buildToken(userId, tenantId, null, scope, "refresh", refreshExpirationMs);
    }

    private String buildToken(Long userId, Long tenantId, String role, String scope, String type, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("scope", scope)
                .claim("type", type)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey());

        if (tenantId != null) {
            builder.claim("tenantId", tenantId);
        }
        if (role != null) {
            builder.claim("role", role);
        }

        return builder.compact();
    }

    // ── Validation ──
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ── Extraction ──
    public Long extractUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    public Long extractTenantId(String token) {
        Object tenantId = parseClaims(token).get("tenantId");
        return tenantId != null ? ((Number) tenantId).longValue() : null;
    }

    public String extractRole(String token) {
        return (String) parseClaims(token).get("role");
    }

    public String extractScope(String token) {
        return (String) parseClaims(token).get("scope");
    }

    public String extractType(String token) {
        return (String) parseClaims(token).get("type");
    }

    public long getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
