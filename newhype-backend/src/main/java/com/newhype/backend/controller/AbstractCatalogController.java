package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.catalog.CatalogRequest;
import com.newhype.backend.dto.catalog.CatalogResponse;
import com.newhype.backend.entity.CatalogBaseEntity;
import com.newhype.backend.service.AbstractCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

public abstract class AbstractCatalogController<T extends CatalogBaseEntity> {

    protected final AbstractCatalogService<T> service;

    protected AbstractCatalogController(AbstractCatalogService<T> service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar registros activos")
    public ResponseEntity<ApiResponse<List<CatalogResponse>>> listar() {
        List<CatalogResponse> response = service.listar();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping
    @Operation(summary = "Crear registro")
    public ResponseEntity<ApiResponse<CatalogResponse>> crear(@Valid @RequestBody CatalogRequest request) {
        CatalogResponse response = service.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Registro creado", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar registro")
    public ResponseEntity<ApiResponse<CatalogResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CatalogRequest request) {
        CatalogResponse response = service.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Registro actualizado", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar registro (soft delete)")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Registro eliminado", null));
    }
}
