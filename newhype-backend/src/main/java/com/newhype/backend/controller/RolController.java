package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.usuario.*;
import com.newhype.backend.service.RolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@Tag(name = "Roles", description = "Gestión de roles y permisos")
public class RolController {

    private final RolService rolService;

    public RolController(RolService rolService) {
        this.rolService = rolService;
    }

    @PostMapping
    @Operation(summary = "Crear rol con permisos JSON")
    public ResponseEntity<ApiResponse<RolResponse>> crear(
            @Valid @RequestBody CrearRolRequest request) {
        RolResponse response = rolService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Rol creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar roles con conteo de usuarios")
    public ResponseEntity<ApiResponse<List<RolResponse>>> listar() {
        List<RolResponse> roles = rolService.listar();
        return ResponseEntity.ok(ApiResponse.ok(roles));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar permisos del rol (no roles es_sistema)")
    public ResponseEntity<ApiResponse<RolResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CrearRolRequest request) {
        RolResponse response = rolService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Rol actualizado", response));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Desactivar rol (validar sin usuarios asignados, no es_sistema)")
    public ResponseEntity<ApiResponse<RolResponse>> cambiarEstado(@PathVariable Long id) {
        RolResponse response = rolService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }
}
