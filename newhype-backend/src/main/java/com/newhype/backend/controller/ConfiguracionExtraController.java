package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.configuracion.*;
import com.newhype.backend.service.CajaRegistradoraService;
import com.newhype.backend.service.MotivoMovimientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/configuracion")
public class ConfiguracionExtraController {

    private final CajaRegistradoraService cajaRegistradoraService;
    private final MotivoMovimientoService motivoMovimientoService;

    public ConfiguracionExtraController(CajaRegistradoraService cajaRegistradoraService,
                                         MotivoMovimientoService motivoMovimientoService) {
        this.cajaRegistradoraService = cajaRegistradoraService;
        this.motivoMovimientoService = motivoMovimientoService;
    }

    // ── Cajas Registradoras (4 endpoints) ──

    @GetMapping("/cajas-registradoras")
    @Tag(name = "Cajas Registradoras", description = "Gestión de cajas registradoras")
    @Operation(summary = "Listar cajas registradoras del tenant")
    public ResponseEntity<ApiResponse<List<CajaRegistradoraResponse>>> listarCajas() {
        List<CajaRegistradoraResponse> cajas = cajaRegistradoraService.listar();
        return ResponseEntity.ok(ApiResponse.ok(cajas));
    }

    @PostMapping("/cajas-registradoras")
    @Tag(name = "Cajas Registradoras")
    @Operation(summary = "Crear caja registradora")
    public ResponseEntity<ApiResponse<CajaRegistradoraResponse>> crearCaja(
            @Valid @RequestBody CrearCajaRegistradoraRequest request) {
        CajaRegistradoraResponse response = cajaRegistradoraService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Caja registradora creada", response));
    }

    @PutMapping("/cajas-registradoras/{id}")
    @Tag(name = "Cajas Registradoras")
    @Operation(summary = "Actualizar caja registradora")
    public ResponseEntity<ApiResponse<CajaRegistradoraResponse>> actualizarCaja(
            @PathVariable Long id,
            @Valid @RequestBody CrearCajaRegistradoraRequest request) {
        CajaRegistradoraResponse response = cajaRegistradoraService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Caja registradora actualizada", response));
    }

    @PatchMapping("/cajas-registradoras/{id}/estado")
    @Tag(name = "Cajas Registradoras")
    @Operation(summary = "Activar/desactivar caja registradora")
    public ResponseEntity<ApiResponse<CajaRegistradoraResponse>> cambiarEstadoCaja(
            @PathVariable Long id) {
        CajaRegistradoraResponse response = cajaRegistradoraService.cambiarEstado(id);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }

    // ── Motivos de Movimiento (3 endpoints) ──

    @GetMapping("/motivos-movimiento")
    @Tag(name = "Motivos Movimiento", description = "Gestión de motivos de movimiento de inventario")
    @Operation(summary = "Listar motivos de movimiento (?tipo=ENTRADA)")
    public ResponseEntity<ApiResponse<List<MotivoMovimientoResponse>>> listarMotivos(
            @RequestParam(required = false) String tipo) {
        List<MotivoMovimientoResponse> motivos = motivoMovimientoService.listar(tipo);
        return ResponseEntity.ok(ApiResponse.ok(motivos));
    }

    @PostMapping("/motivos-movimiento")
    @Tag(name = "Motivos Movimiento")
    @Operation(summary = "Crear motivo de movimiento")
    public ResponseEntity<ApiResponse<MotivoMovimientoResponse>> crearMotivo(
            @Valid @RequestBody CrearMotivoMovimientoRequest request) {
        MotivoMovimientoResponse response = motivoMovimientoService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Motivo creado", response));
    }

    @PutMapping("/motivos-movimiento/{id}")
    @Tag(name = "Motivos Movimiento")
    @Operation(summary = "Actualizar motivo de movimiento")
    public ResponseEntity<ApiResponse<MotivoMovimientoResponse>> actualizarMotivo(
            @PathVariable Long id,
            @Valid @RequestBody CrearMotivoMovimientoRequest request) {
        MotivoMovimientoResponse response = motivoMovimientoService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Motivo actualizado", response));
    }
}
