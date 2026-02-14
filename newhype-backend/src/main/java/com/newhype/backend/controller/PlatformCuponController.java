package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.platform.*;
import com.newhype.backend.security.TenantContext;
import com.newhype.backend.service.CuponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform/cupones")
@Tag(name = "Platform - Cupones", description = "Gestión de cupones promocionales")
public class PlatformCuponController {

    private final CuponService cuponService;

    public PlatformCuponController(CuponService cuponService) {
        this.cuponService = cuponService;
    }

    private void requirePlatformScope() {
        if (!TenantContext.isPlatformScope()) {
            throw new SecurityException("Acceso denegado: se requiere scope platform");
        }
    }

    @PostMapping
    @Operation(summary = "Crear cupón promocional")
    public ResponseEntity<ApiResponse<CuponResponse>> crear(@Valid @RequestBody CrearCuponRequest request) {
        requirePlatformScope();
        CuponResponse response = cuponService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Cupón creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar cupones")
    public ResponseEntity<ApiResponse<List<CuponResponse>>> listar() {
        requirePlatformScope();
        List<CuponResponse> cupones = cuponService.listar();
        return ResponseEntity.ok(ApiResponse.ok(cupones));
    }
}
