package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.compra.*;
import com.newhype.backend.service.OrdenCompraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/compras")
@Tag(name = "Compras", description = "Gestión de órdenes de compra")
public class OrdenCompraController {

    private final OrdenCompraService ordenCompraService;

    public OrdenCompraController(OrdenCompraService ordenCompraService) {
        this.ordenCompraService = ordenCompraService;
    }

    @PostMapping("/ordenes")
    @Operation(summary = "Crear orden de compra")
    public ResponseEntity<ApiResponse<OrdenCompraResponse>> crear(
            @Valid @RequestBody CrearOrdenCompraRequest request) {
        OrdenCompraResponse response = ordenCompraService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Orden de compra creada", response));
    }

    @GetMapping("/ordenes")
    @Operation(summary = "Listar órdenes de compra con filtros")
    public ResponseEntity<ApiResponse<List<OrdenCompraResponse>>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long proveedorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<OrdenCompraResponse> resultado = ordenCompraService.listar(estado, proveedorId,
                PageRequest.of(page, size));

        ApiResponse<List<OrdenCompraResponse>> response = ApiResponse.<List<OrdenCompraResponse>>builder()
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

    @GetMapping("/ordenes/{id}")
    @Operation(summary = "Detalle de orden de compra con productos")
    public ResponseEntity<ApiResponse<OrdenCompraResponse>> obtenerPorId(@PathVariable Long id) {
        OrdenCompraResponse response = ordenCompraService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/ordenes/{id}")
    @Operation(summary = "Actualizar orden de compra pendiente")
    public ResponseEntity<ApiResponse<OrdenCompraResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CrearOrdenCompraRequest request) {
        OrdenCompraResponse response = ordenCompraService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Orden de compra actualizada", response));
    }

    @PatchMapping("/ordenes/{id}/estado")
    @Operation(summary = "Cambiar estado de OC (workflow: PENDIENTE→ENVIADA→CONFIRMADA→EN_RECEPCION→PARCIAL→COMPLETADA)")
    public ResponseEntity<ApiResponse<OrdenCompraResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoOCRequest request) {
        OrdenCompraResponse response = ordenCompraService.cambiarEstado(id, request.getEstado());
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }

    @DeleteMapping("/ordenes/{id}")
    @Operation(summary = "Cancelar orden de compra")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        ordenCompraService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Orden de compra cancelada", null));
    }

    @GetMapping("/ordenes/{id}/pdf")
    @Operation(summary = "Descargar OC como PDF/HTML")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Long id) {
        String html = ordenCompraService.generarHtmlOC(id);
        byte[] content = html.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=OC_" + id + ".html")
                .contentType(MediaType.TEXT_HTML)
                .contentLength(content.length)
                .body(content);
    }

    @GetMapping("/estadisticas")
    @Operation(summary = "Estadísticas de compras: totales por estado, montos")
    public ResponseEntity<ApiResponse<ComprasEstadisticasResponse>> estadisticas() {
        ComprasEstadisticasResponse response = ordenCompraService.estadisticas();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
