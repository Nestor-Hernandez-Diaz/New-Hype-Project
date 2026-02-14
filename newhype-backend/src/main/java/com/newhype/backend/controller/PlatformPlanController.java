package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.platform.*;
import com.newhype.backend.security.TenantContext;
import com.newhype.backend.service.PlanSuscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform/planes")
@Tag(name = "Platform - Planes", description = "Gestión de planes de suscripción")
public class PlatformPlanController {

    private final PlanSuscripcionService planService;

    public PlatformPlanController(PlanSuscripcionService planService) {
        this.planService = planService;
    }

    private void requirePlatformScope() {
        if (!TenantContext.isPlatformScope()) {
            throw new SecurityException("Acceso denegado: se requiere scope platform");
        }
    }

    @PostMapping
    @Operation(summary = "Crear plan de suscripción")
    public ResponseEntity<ApiResponse<PlanResponse>> crear(@Valid @RequestBody CrearPlanRequest request) {
        requirePlatformScope();
        PlanResponse response = planService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Plan creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar planes con conteo de tenants")
    public ResponseEntity<ApiResponse<List<PlanResponse>>> listar() {
        requirePlatformScope();
        List<PlanResponse> planes = planService.listar();
        return ResponseEntity.ok(ApiResponse.ok(planes));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar plan (no afecta tenants existentes)")
    public ResponseEntity<ApiResponse<PlanResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CrearPlanRequest request) {
        requirePlatformScope();
        PlanResponse response = planService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Plan actualizado", response));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar/desactivar plan")
    public ResponseEntity<ApiResponse<PlanResponse>> cambiarEstado(@PathVariable Long id) {
        requirePlatformScope();
        PlanResponse response = planService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }
}
