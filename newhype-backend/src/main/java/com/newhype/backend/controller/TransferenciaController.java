package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.transferencia.CrearTransferenciaRequest;
import com.newhype.backend.dto.transferencia.TransferenciaResponse;
import com.newhype.backend.service.TransferenciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transferencias")
@Tag(name = "Transferencias", description = "Transferencias de inventario entre almacenes")
public class TransferenciaController {

    private final TransferenciaService transferenciaService;

    public TransferenciaController(TransferenciaService transferenciaService) {
        this.transferenciaService = transferenciaService;
    }

    @PostMapping
    @Operation(summary = "Crear transferencia (estado PENDIENTE)")
    public ResponseEntity<ApiResponse<TransferenciaResponse>> crear(
            @Valid @RequestBody CrearTransferenciaRequest request) {
        TransferenciaResponse response = transferenciaService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Transferencia creada", response));
    }

    @GetMapping
    @Operation(summary = "Listar transferencias con filtros")
    public ResponseEntity<ApiResponse<List<TransferenciaResponse>>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Long almacenOrigenId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<TransferenciaResponse> resultado = transferenciaService.listar(estado, almacenOrigenId,
                PageRequest.of(page, size));

        ApiResponse<List<TransferenciaResponse>> response = ApiResponse.<List<TransferenciaResponse>>builder()
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
    @Operation(summary = "Detalle de transferencia con productos")
    public ResponseEntity<ApiResponse<TransferenciaResponse>> obtenerPorId(@PathVariable Long id) {
        TransferenciaResponse response = transferenciaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/aprobar")
    @Operation(summary = "Aprobar transferencia → mueve stock + registra kardex en ambos almacenes")
    public ResponseEntity<ApiResponse<TransferenciaResponse>> aprobar(@PathVariable Long id) {
        TransferenciaResponse response = transferenciaService.aprobar(id);
        return ResponseEntity.ok(ApiResponse.ok("Transferencia aprobada, stock movido", response));
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar transferencia pendiente")
    public ResponseEntity<ApiResponse<TransferenciaResponse>> cancelar(@PathVariable Long id) {
        TransferenciaResponse response = transferenciaService.cancelar(id);
        return ResponseEntity.ok(ApiResponse.ok("Transferencia cancelada", response));
    }
}
