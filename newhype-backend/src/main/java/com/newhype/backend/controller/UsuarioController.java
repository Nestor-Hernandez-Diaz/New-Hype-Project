package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.usuario.*;
import com.newhype.backend.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuarios", description = "Gestión de usuarios del tenant")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    @Operation(summary = "Crear usuario (password 8+ chars, mayúsc, minúsc, números)")
    public ResponseEntity<ApiResponse<UsuarioResponse>> crear(
            @Valid @RequestBody CrearUsuarioRequest request) {
        UsuarioResponse response = usuarioService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Usuario creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar usuarios con filtros")
    public ResponseEntity<ApiResponse<List<UsuarioResponse>>> listar(
            @RequestParam(required = false) Long rolId,
            @RequestParam(required = false) Boolean estado,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<UsuarioResponse> resultado = usuarioService.listar(rolId, estado, q,
                PageRequest.of(page, size));

        return ResponseEntity.ok(ApiResponse.<List<UsuarioResponse>>builder()
                .success(true)
                .data(resultado.getContent())
                .pagination(ApiResponse.PaginationMeta.builder()
                        .page(resultado.getNumber())
                        .size(resultado.getSize())
                        .totalElements(resultado.getTotalElements())
                        .totalPages(resultado.getTotalPages())
                        .build())
                .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de usuario con rol, permisos y último acceso")
    public ResponseEntity<ApiResponse<UsuarioResponse>> obtenerPorId(@PathVariable Long id) {
        UsuarioResponse response = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de usuario (email único en tenant)")
    public ResponseEntity<ApiResponse<UsuarioResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarUsuarioRequest request) {
        UsuarioResponse response = usuarioService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado", response));
    }

    @PatchMapping("/{id}/password")
    @Operation(summary = "Cambiar contraseña de usuario (solo Admin)")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @PathVariable Long id,
            @Valid @RequestBody CambiarPasswordRequest request) {
        usuarioService.cambiarPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada", null));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar/desactivar usuario (no puede desactivarse a sí mismo)")
    public ResponseEntity<ApiResponse<UsuarioResponse>> cambiarEstado(@PathVariable Long id) {
        UsuarioResponse response = usuarioService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }
}
