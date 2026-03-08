package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.cotizacion.*;
import com.newhype.backend.dto.venta.VentaResponse;
import com.newhype.backend.service.CotizacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cotizaciones")
@Tag(name = "Cotizaciones", description = "Gestión de cotizaciones")
public class CotizacionController {

    private final CotizacionService cotizacionService;

    public CotizacionController(CotizacionService cotizacionService) {
        this.cotizacionService = cotizacionService;
    }

    @PostMapping
    @Operation(summary = "Crear cotización")
    public ResponseEntity<ApiResponse<CotizacionResponse>> crear(
            @Valid @RequestBody CrearCotizacionRequest request) {
        CotizacionResponse response = cotizacionService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping
    @Operation(summary = "Listar cotizaciones con filtros")
    public ResponseEntity<ApiResponse<List<CotizacionResponse>>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<CotizacionResponse> resultado = cotizacionService.listar(estado, fechaDesde, clienteId,
                PageRequest.of(page, size));

        ApiResponse<List<CotizacionResponse>> response = ApiResponse.<List<CotizacionResponse>>builder()
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
    @Operation(summary = "Obtener cotización por ID con detalles")
    public ResponseEntity<ApiResponse<CotizacionResponse>> obtenerPorId(
            @PathVariable Long id) {
        CotizacionResponse response = cotizacionService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar cotización")
    public ResponseEntity<ApiResponse<CotizacionResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CrearCotizacionRequest request) {
        CotizacionResponse response = cotizacionService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cambiar estado de cotización")
    public ResponseEntity<ApiResponse<CotizacionResponse>> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        String motivoRechazo = body.get("motivoRechazo");
        CotizacionResponse response = cotizacionService.cambiarEstado(id, estado, motivoRechazo);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/convert")
    @Operation(summary = "Convertir cotización a venta")
    public ResponseEntity<ApiResponse<VentaResponse>> convertirAVenta(
            @PathVariable Long id,
            @RequestBody ConvertirCotizacionRequest request) {
        VentaResponse response = cotizacionService.convertirAVenta(id, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar cotización")
    public ResponseEntity<ApiResponse<Void>> eliminar(
            @PathVariable Long id) {
        cotizacionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
