package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.caja.*;
import com.newhype.backend.service.CajaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/caja/sesiones")
@Tag(name = "Caja", description = "Sesiones de caja y movimientos")
public class CajaController {

    private final CajaService cajaService;

    public CajaController(CajaService cajaService) {
        this.cajaService = cajaService;
    }

    @PostMapping
    @Operation(summary = "Abrir sesión de caja")
    public ResponseEntity<ApiResponse<SesionCajaResponse>> abrirSesion(
            @Valid @RequestBody AbrirSesionRequest request) {
        SesionCajaResponse response = cajaService.abrirSesion(request);
        return ResponseEntity.ok(ApiResponse.ok("Sesión de caja abierta", response));
    }

    @GetMapping
    @Operation(summary = "Listar sesiones de caja")
    public ResponseEntity<ApiResponse<List<SesionCajaResponse>>> listarSesiones(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long cajaId) {
        List<SesionCajaResponse> response = cajaService.listarSesiones(estado, cajaId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/cerrar")
    @Operation(summary = "Cerrar sesión de caja")
    public ResponseEntity<ApiResponse<SesionCajaResponse>> cerrarSesion(
            @PathVariable Long id,
            @Valid @RequestBody CerrarSesionRequest request) {
        SesionCajaResponse response = cajaService.cerrarSesion(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Sesión de caja cerrada", response));
    }

    @PostMapping("/{id}/movimientos")
    @Operation(summary = "Registrar movimiento de caja (ingreso/egreso)")
    public ResponseEntity<ApiResponse<MovimientoCajaResponse>> registrarMovimiento(
            @PathVariable Long id,
            @Valid @RequestBody MovimientoCajaRequest request) {
        MovimientoCajaResponse response = cajaService.registrarMovimiento(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Movimiento registrado", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener sesión de caja por ID con movimientos")
    public ResponseEntity<ApiResponse<SesionCajaResponse>> obtenerSesion(
            @PathVariable Long id) {
        SesionCajaResponse response = cajaService.obtenerSesion(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}/movimientos")
    @Operation(summary = "Listar movimientos de una sesión de caja")
    public ResponseEntity<ApiResponse<List<MovimientoCajaResponse>>> listarMovimientos(
            @PathVariable Long id) {
        List<MovimientoCajaResponse> response = cajaService.listarMovimientos(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
