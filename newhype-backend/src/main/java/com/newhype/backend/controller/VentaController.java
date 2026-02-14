package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.venta.*;
import com.newhype.backend.service.ComprobanteService;
import com.newhype.backend.service.VentaService;
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
@RequestMapping("/api/v1/ventas")
@Tag(name = "Ventas", description = "Gestión de ventas y POS")
public class VentaController {

    private final VentaService ventaService;
    private final ComprobanteService comprobanteService;

    public VentaController(VentaService ventaService, ComprobanteService comprobanteService) {
        this.ventaService = ventaService;
        this.comprobanteService = comprobanteService;
    }

    @PostMapping
    @Operation(summary = "Crear venta (estado PENDIENTE)")
    public ResponseEntity<ApiResponse<VentaResponse>> crear(@Valid @RequestBody CrearVentaRequest request) {
        VentaResponse response = ventaService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Venta creada", response));
    }

    @GetMapping
    @Operation(summary = "Listar ventas con filtros")
    public ResponseEntity<ApiResponse<List<VentaResponse>>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<VentaResponse> resultado = ventaService.listar(estado, fechaDesde, clienteId,
                PageRequest.of(page, size));

        ApiResponse<List<VentaResponse>> response = ApiResponse.<List<VentaResponse>>builder()
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
    @Operation(summary = "Detalle de venta con productos, pagos y cliente")
    public ResponseEntity<ApiResponse<VentaResponse>> obtenerPorId(@PathVariable Long id) {
        VentaResponse response = ventaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de venta")
    public ResponseEntity<ApiResponse<VentaResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambiarEstadoVentaRequest request) {
        VentaResponse response = ventaService.cambiarEstado(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }

    @PostMapping("/{id}/confirmar-pago")
    @Operation(summary = "Confirmar pago → COMPLETADA, descuenta stock, registra kardex")
    public ResponseEntity<ApiResponse<VentaResponse>> confirmarPago(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmarPagoRequest request) {
        VentaResponse response = ventaService.confirmarPago(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Pago confirmado, venta completada", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar venta PENDIENTE")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        ventaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Venta eliminada", null));
    }

    @GetMapping("/{id}/comprobante/pdf")
    @Operation(summary = "Descargar comprobante PDF")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Long id) {
        VentaResponse venta = ventaService.obtenerPorId(id);
        String html = comprobanteService.generarHtml(venta);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=comprobante-" + venta.getCodigoVenta() + ".html")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(html.getBytes());
    }

    @GetMapping("/{id}/comprobante/preview")
    @Operation(summary = "Preview comprobante HTML")
    public ResponseEntity<String> previewComprobante(@PathVariable Long id) {
        VentaResponse venta = ventaService.obtenerPorId(id);
        String html = comprobanteService.generarHtml(venta);

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(html);
    }
}
