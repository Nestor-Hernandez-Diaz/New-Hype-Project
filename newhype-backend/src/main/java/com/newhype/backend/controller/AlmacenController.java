package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.service.AlmacenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/almacenes")
@Tag(name = "Almacenes", description = "Gestión de almacenes del tenant")
public class AlmacenController {

    private final AlmacenService almacenService;

    public AlmacenController(AlmacenService almacenService) {
        this.almacenService = almacenService;
    }

    @GetMapping
    @Operation(summary = "Listar almacenes del tenant")
    public ResponseEntity<ApiResponse<List<AlmacenResponse>>> listar() {
        List<AlmacenResponse> almacenes = almacenService.listar();
        return ResponseEntity.ok(ApiResponse.ok(almacenes));
    }

    @PostMapping
    @Operation(summary = "Crear almacén")
    public ResponseEntity<ApiResponse<AlmacenResponse>> crear(
            @Valid @RequestBody CrearAlmacenRequest request) {
        AlmacenResponse response = almacenService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Almacén creado", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar almacén")
    public ResponseEntity<ApiResponse<AlmacenResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CrearAlmacenRequest request) {
        AlmacenResponse response = almacenService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Almacén actualizado", response));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar/desactivar almacén")
    public ResponseEntity<ApiResponse<AlmacenResponse>> cambiarEstado(@PathVariable Long id) {
        AlmacenResponse response = almacenService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }
}
