package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.notacredito.CrearNotaCreditoRequest;
import com.newhype.backend.dto.notacredito.NotaCreditoResponse;
import com.newhype.backend.service.NotaCreditoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notas-credito")
@Tag(name = "Notas de Crédito", description = "Gestión de notas de crédito y devoluciones")
public class NotaCreditoController {

    private final NotaCreditoService notaCreditoService;

    public NotaCreditoController(NotaCreditoService notaCreditoService) {
        this.notaCreditoService = notaCreditoService;
    }

    @PostMapping
    @Operation(summary = "Emitir nota de crédito (devuelve stock)")
    public ResponseEntity<ApiResponse<NotaCreditoResponse>> crear(
            @Valid @RequestBody CrearNotaCreditoRequest request) {
        NotaCreditoResponse response = notaCreditoService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Nota de crédito emitida", response));
    }

    @GetMapping
    @Operation(summary = "Listar notas de crédito con filtros")
    public ResponseEntity<ApiResponse<List<NotaCreditoResponse>>> listar(
            @RequestParam(required = false) Long ventaOrigenId,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<NotaCreditoResponse> resultado = notaCreditoService.listar(ventaOrigenId, estado,
                PageRequest.of(page, size));

        ApiResponse<List<NotaCreditoResponse>> response = ApiResponse.<List<NotaCreditoResponse>>builder()
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
    @Operation(summary = "Detalle de nota de crédito con productos devueltos")
    public ResponseEntity<ApiResponse<NotaCreditoResponse>> obtenerPorId(@PathVariable Long id) {
        NotaCreditoResponse response = notaCreditoService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
