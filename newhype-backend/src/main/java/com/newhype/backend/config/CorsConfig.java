package com.newhype.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Configuración CORS para NewHype Backend
 *
 * Permite:
 * - Desarrollo local: localhost:5174, localhost:5173, localhost:3000
 * - Producción: dominio frontend configurado
 *
 * Para cambiar orígenes permitidos, modifica ALLOWED_ORIGINS
 */
@Configuration
public class CorsConfig {

    // ── Orígenes permitidos ──
    private static final String[] ALLOWED_ORIGINS = {
            // Desarrollo local
            "http://localhost:3000",      // React/Next.js default
            "http://localhost:5173",      // Vite default
            "http://localhost:5174",      // Vite alternate
            "http://localhost:8080",      // Vue default
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            // Producción (reemplaza con tu dominio real)
            "https://tudominio.com",
            "https://www.tudominio.com",
            // Wildcard para desarrollo (descomenta solo en DEV)
            // "*"
    };

    // ── Métodos HTTP permitidos ──
    private static final String[] ALLOWED_METHODS = {
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS",
            "HEAD"
    };

    // ── Headers permitidos en requests ──
    private static final String[] ALLOWED_HEADERS = {
            "Authorization",
            "Content-Type",
            "Accept",
            "X-Requested-With",
            "X-CSRF-Token",
            "X-TenantId",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
    };

    // ── Headers expuestos en responses ──
    private static final String[] EXPOSED_HEADERS = {
            "Authorization",
            "Content-Type",
            "X-Total-Count",  // Para paginación
            "X-Page-Number",
            "X-Page-Size"
    };

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();

        // Configurar orígenes
        cors.setAllowedOrigins(Arrays.asList(ALLOWED_ORIGINS));

        // Configurar métodos
        cors.setAllowedMethods(Arrays.asList(ALLOWED_METHODS));

        // Configurar headers
        cors.setAllowedHeaders(Arrays.asList(ALLOWED_HEADERS));

        // Configurar headers expuestos
        cors.setExposedHeaders(Arrays.asList(EXPOSED_HEADERS));

        // Permitir credenciales (cookies, autenticación)
        cors.setAllowCredentials(true);

        // Tiempo máximo de caché (1 hora)
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicar a TODOS los endpoints
        source.registerCorsConfiguration("/**", cors);

        return source;
    }
}
