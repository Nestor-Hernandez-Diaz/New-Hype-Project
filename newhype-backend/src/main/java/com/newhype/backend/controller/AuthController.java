package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.auth.*;
import com.newhype.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "Auth", description = "Autenticación y registro")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/api/v1/auth/register")
    @Operation(summary = "Registrar nuevo usuario + tenant")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", response));
    }

    @PostMapping("/api/v1/auth/login")
    @Operation(summary = "Login de usuario tenant")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", response));
    }

    @PostMapping("/api/v1/platform/auth/login")
    @Operation(summary = "Login de superadmin (plataforma)")
    public ResponseEntity<ApiResponse<AuthResponse>> platformLogin(@Valid @RequestBody PlatformLoginRequest request) {
        AuthResponse response = authService.platformLogin(request);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", response));
    }

    @PostMapping("/api/v1/auth/refresh")
    @Operation(summary = "Renovar access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        AuthResponse response = authService.refresh(request);
        return ResponseEntity.ok(ApiResponse.ok("Token renovado", response));
    }

    @GetMapping("/api/v1/auth/me")
    @Operation(summary = "Información del usuario autenticado")
    public ResponseEntity<ApiResponse<UserInfoResponse>> me() {
        UserInfoResponse response = authService.me();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // ── New endpoints ──

    @PostMapping("/api/v1/auth/logout")
    @Operation(summary = "Invalidar token actual")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.ok("Sesión cerrada", null));
    }

    @GetMapping("/api/v1/auth/check-email")
    @Operation(summary = "Verificar si email está registrado")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmail(@RequestParam String email) {
        boolean exists = authService.checkEmail(email);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("exists", exists)));
    }

    @PostMapping("/api/v1/storefront/auth/login")
    @Operation(summary = "Login de cliente tienda (storefront)")
    public ResponseEntity<ApiResponse<AuthResponse>> storefrontLogin(@Valid @RequestBody StorefrontLoginRequest request) {
        AuthResponse response = authService.storefrontLogin(request);
        return ResponseEntity.ok(ApiResponse.ok("Login exitoso", response));
    }
}
