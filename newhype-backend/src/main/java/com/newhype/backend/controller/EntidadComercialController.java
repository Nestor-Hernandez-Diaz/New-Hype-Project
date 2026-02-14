package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.entidad.EntidadEstadisticasResponse;
import com.newhype.backend.dto.entidad.EntidadRequest;
import com.newhype.backend.dto.entidad.EntidadResponse;
import com.newhype.backend.service.EntidadComercialService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/entidades")
@Tag(name = "Entidades Comerciales", description = "Gestión de clientes y proveedores")
public class EntidadComercialController {

    private final EntidadComercialService entidadService;

    public EntidadComercialController(EntidadComercialService entidadService) {
        this.entidadService = entidadService;
    }

    @PostMapping
    @Operation(summary = "Crear cliente o proveedor")
    public ResponseEntity<ApiResponse<EntidadResponse>> crear(@Valid @RequestBody EntidadRequest request) {
        EntidadResponse response = entidadService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Entidad creada", response));
    }

    @GetMapping
    @Operation(summary = "Listar entidades con filtros")
    public ResponseEntity<ApiResponse<List<EntidadResponse>>> listar(
            @RequestParam(required = false) String tipoEntidad,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<EntidadResponse> resultado = entidadService.listar(tipoEntidad, q,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        ApiResponse<List<EntidadResponse>> response = ApiResponse.<List<EntidadResponse>>builder()
                .success(true)
                .data(resultado.getContent())
                .pagination(ApiResponse.PaginationMeta.builder()
                        .page(resultado.getNumber())
                        .size(resultado.getSize())
                        .totalElements(resultado.getTotalElements())
                        .totalPages(resultado.getTotalPages())
                        .build())
                .build();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener entidad por ID")
    public ResponseEntity<ApiResponse<EntidadResponse>> obtenerPorId(@PathVariable Long id) {
        EntidadResponse response = entidadService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar entidad (no cambia documento)")
    public ResponseEntity<ApiResponse<EntidadResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EntidadRequest request) {
        EntidadResponse response = entidadService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Entidad actualizada", response));
    }

    @GetMapping("/buscar-documento")
    @Operation(summary = "Buscar por tipo y número de documento")
    public ResponseEntity<ApiResponse<EntidadResponse>> buscarPorDocumento(
            @RequestParam String tipo,
            @RequestParam String numero) {
        return entidadService.buscarPorDocumento(tipo, numero)
                .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("No encontrado", null)));
    }

    @GetMapping("/buscar-email")
    @Operation(summary = "Buscar por email")
    public ResponseEntity<ApiResponse<EntidadResponse>> buscarPorEmail(@RequestParam String email) {
        return entidadService.buscarPorEmail(email)
                .map(e -> ResponseEntity.ok(ApiResponse.ok(e)))
                .orElse(ResponseEntity.ok(ApiResponse.ok("No encontrado", null)));
    }

    @GetMapping("/estadisticas")
    @Operation(summary = "Estadísticas de entidades comerciales")
    public ResponseEntity<ApiResponse<EntidadEstadisticasResponse>> estadisticas() {
        EntidadEstadisticasResponse response = entidadService.estadisticas();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
