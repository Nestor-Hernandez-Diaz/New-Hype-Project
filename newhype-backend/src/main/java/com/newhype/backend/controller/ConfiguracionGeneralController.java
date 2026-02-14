package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.service.ConfiguracionEmpresaService;
import com.newhype.backend.service.SerieComprobanteService;
import com.newhype.backend.service.MetodoPagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/configuracion")
@Tag(name = "Configuración General", description = "Empresa, series SUNAT, métodos de pago, política devoluciones")
public class ConfiguracionGeneralController {

    private final ConfiguracionEmpresaService configuracionEmpresaService;
    private final SerieComprobanteService serieComprobanteService;
    private final MetodoPagoService metodoPagoService;

    public ConfiguracionGeneralController(ConfiguracionEmpresaService configuracionEmpresaService,
                                          SerieComprobanteService serieComprobanteService,
                                          MetodoPagoService metodoPagoService) {
        this.configuracionEmpresaService = configuracionEmpresaService;
        this.serieComprobanteService = serieComprobanteService;
        this.metodoPagoService = metodoPagoService;
    }

    // ── Empresa (2 endpoints) ──

    @GetMapping("/empresa")
    @Operation(summary = "Obtener datos de la empresa del tenant")
    public ResponseEntity<ApiResponse<ConfiguracionEmpresaResponse>> obtenerEmpresa() {
        ConfiguracionEmpresaResponse response = configuracionEmpresaService.obtener();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/empresa")
    @Operation(summary = "Actualizar datos empresa + config fiscal + SUNAT")
    public ResponseEntity<ApiResponse<ConfiguracionEmpresaResponse>> actualizarEmpresa(
            @RequestBody ConfiguracionEmpresaRequest request) {
        ConfiguracionEmpresaResponse response = configuracionEmpresaService.actualizar(request);
        return ResponseEntity.ok(ApiResponse.ok("Configuración actualizada", response));
    }

    // ── Series de Comprobantes (4 endpoints) ──

    @GetMapping("/series-comprobantes")
    @Operation(summary = "Listar series de comprobantes (?tipoComprobante=BOLETA)")
    public ResponseEntity<ApiResponse<List<SerieComprobanteResponse>>> listarSeries(
            @RequestParam(required = false) String tipoComprobante) {
        List<SerieComprobanteResponse> series = serieComprobanteService.listar(tipoComprobante);
        return ResponseEntity.ok(ApiResponse.ok(series));
    }

    @PostMapping("/series-comprobantes")
    @Operation(summary = "Crear serie (formato SUNAT: 4 chars)")
    public ResponseEntity<ApiResponse<SerieComprobanteResponse>> crearSerie(
            @Valid @RequestBody CrearSerieComprobanteRequest request) {
        SerieComprobanteResponse response = serieComprobanteService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Serie creada", response));
    }

    @PutMapping("/series-comprobantes/{id}")
    @Operation(summary = "Actualizar serie")
    public ResponseEntity<ApiResponse<SerieComprobanteResponse>> actualizarSerie(
            @PathVariable Long id,
            @Valid @RequestBody CrearSerieComprobanteRequest request) {
        SerieComprobanteResponse response = serieComprobanteService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Serie actualizada", response));
    }

    @PatchMapping("/series-comprobantes/{id}/estado")
    @Operation(summary = "Activar/desactivar serie")
    public ResponseEntity<ApiResponse<SerieComprobanteResponse>> cambiarEstadoSerie(
            @PathVariable Long id) {
        SerieComprobanteResponse response = serieComprobanteService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }

    // ── Métodos de Pago (4 endpoints) ──

    @GetMapping("/metodos-pago")
    @Operation(summary = "Listar métodos de pago activos")
    public ResponseEntity<ApiResponse<List<MetodoPagoResponse>>> listarMetodosPago() {
        List<MetodoPagoResponse> metodos = metodoPagoService.listar();
        return ResponseEntity.ok(ApiResponse.ok(metodos));
    }

    @PostMapping("/metodos-pago")
    @Operation(summary = "Crear método de pago")
    public ResponseEntity<ApiResponse<MetodoPagoResponse>> crearMetodoPago(
            @Valid @RequestBody CrearMetodoPagoRequest request) {
        MetodoPagoResponse response = metodoPagoService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Método de pago creado", response));
    }

    @PutMapping("/metodos-pago/{id}")
    @Operation(summary = "Actualizar método de pago")
    public ResponseEntity<ApiResponse<MetodoPagoResponse>> actualizarMetodoPago(
            @PathVariable Long id,
            @Valid @RequestBody CrearMetodoPagoRequest request) {
        MetodoPagoResponse response = metodoPagoService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Método de pago actualizado", response));
    }

    @PatchMapping("/metodos-pago/{id}/estado")
    @Operation(summary = "Activar/desactivar método de pago")
    public ResponseEntity<ApiResponse<MetodoPagoResponse>> cambiarEstadoMetodoPago(
            @PathVariable Long id) {
        MetodoPagoResponse response = metodoPagoService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }

    // ── Política de Devoluciones (2 endpoints) ──

    @GetMapping("/politica-devoluciones")
    @Operation(summary = "Ver política de devoluciones actual")
    public ResponseEntity<ApiResponse<PoliticaDevolucionesResponse>> obtenerPolitica() {
        PoliticaDevolucionesResponse response = configuracionEmpresaService.obtenerPolitica();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/politica-devoluciones")
    @Operation(summary = "Actualizar política de devoluciones")
    public ResponseEntity<ApiResponse<PoliticaDevolucionesResponse>> actualizarPolitica(
            @RequestBody PoliticaDevolucionesRequest request) {
        PoliticaDevolucionesResponse response = configuracionEmpresaService.actualizarPolitica(request);
        return ResponseEntity.ok(ApiResponse.ok("Política actualizada", response));
    }
}
