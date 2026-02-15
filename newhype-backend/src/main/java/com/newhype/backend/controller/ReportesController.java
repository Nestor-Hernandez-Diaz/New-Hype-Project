package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.reporte.*;
import com.newhype.backend.service.ReportesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reportes")
@Tag(name = "Reportes", description = "Reportes y analítica del negocio")
public class ReportesController {

    private final ReportesService reportesService;

    public ReportesController(ReportesService reportesService) {
        this.reportesService = reportesService;
    }

    @GetMapping("/resumen")
    @Operation(summary = "Dashboard ejecutivo: ventas día/mes, stock bajo, alertas")
    public ResponseEntity<ApiResponse<ResumenDashboardResponse>> resumen() {
        return ResponseEntity.ok(ApiResponse.ok(reportesService.resumen()));
    }

    @GetMapping("/ventas")
    @Operation(summary = "Reporte de ventas con totales y tendencias")
    public ResponseEntity<ApiResponse<ReporteVentasResponse>> ventas(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) Long usuarioId,
            @RequestParam(required = false) Long clienteId,
            @RequestParam(required = false) String tipoComprobante) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportesService.reporteVentas(fechaDesde, fechaHasta, usuarioId, clienteId, tipoComprobante)));
    }

    @GetMapping("/inventario")
    @Operation(summary = "Estado del inventario + valorización")
    public ResponseEntity<ApiResponse<ReporteInventarioResponse>> inventario(
            @RequestParam(required = false) Long almacenId,
            @RequestParam(required = false) Long categoriaId) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportesService.reporteInventario(almacenId, categoriaId)));
    }

    @GetMapping("/compras")
    @Operation(summary = "Reporte de compras por proveedor")
    public ResponseEntity<ApiResponse<ReporteComprasResponse>> compras(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) Long proveedorId,
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportesService.reporteCompras(fechaDesde, fechaHasta, proveedorId, estado)));
    }

    @GetMapping("/financiero")
    @Operation(summary = "Balance: ingresos (ventas) vs egresos (compras)")
    public ResponseEntity<ApiResponse<ReporteFinancieroResponse>> financiero(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportesService.reporteFinanciero(fechaDesde, fechaHasta)));
    }

    @GetMapping("/caja")
    @Operation(summary = "Sesiones de caja: ventas, diferencias")
    public ResponseEntity<ApiResponse<ReporteCajaResponse>> caja(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) Long cajaId,
            @RequestParam(required = false) Long usuarioId) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportesService.reporteCaja(fechaDesde, fechaHasta, cajaId, usuarioId)));
    }

    @GetMapping("/productos-mas-vendidos")
    @Operation(summary = "Ranking top N productos más vendidos")
    public ResponseEntity<ApiResponse<ProductosMasVendidosResponse>> productosMasVendidos(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(defaultValue = "10") int top) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportesService.productosMasVendidos(fechaDesde, fechaHasta, categoriaId, top)));
    }
}
