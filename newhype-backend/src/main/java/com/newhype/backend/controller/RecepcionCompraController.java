package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.compra.CrearRecepcionRequest;
import com.newhype.backend.dto.compra.RecepcionCompraResponse;
import com.newhype.backend.service.RecepcionCompraService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/compras/recepciones")
@Tag(name = "Recepciones", description = "Gestión de recepciones de compra")
public class RecepcionCompraController {

    private final RecepcionCompraService recepcionCompraService;

    public RecepcionCompraController(RecepcionCompraService recepcionCompraService) {
        this.recepcionCompraService = recepcionCompraService;
    }

    @PostMapping
    @Operation(summary = "Registrar recepción de compra")
    public ResponseEntity<ApiResponse<RecepcionCompraResponse>> crear(
            @Valid @RequestBody CrearRecepcionRequest request) {
        RecepcionCompraResponse response = recepcionCompraService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Recepción registrada", response));
    }

    @GetMapping
    @Operation(summary = "Listar recepciones con filtros")
    public ResponseEntity<ApiResponse<List<RecepcionCompraResponse>>> listar(
            @RequestParam(required = false) Long ordenCompraId,
            @RequestParam(required = false) String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RecepcionCompraResponse> resultado = recepcionCompraService.listar(ordenCompraId, estado,
                PageRequest.of(page, size));

        ApiResponse<List<RecepcionCompraResponse>> response = ApiResponse.<List<RecepcionCompraResponse>>builder()
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
    @Operation(summary = "Detalle de recepción con productos recibidos/aceptados/rechazados")
    public ResponseEntity<ApiResponse<RecepcionCompraResponse>> obtenerPorId(@PathVariable Long id) {
        RecepcionCompraResponse response = recepcionCompraService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar recepción → incrementa stock + registra kardex + actualiza OC")
    public ResponseEntity<ApiResponse<RecepcionCompraResponse>> confirmar(@PathVariable Long id) {
        RecepcionCompraResponse response = recepcionCompraService.confirmar(id);
        return ResponseEntity.ok(ApiResponse.ok("Recepción confirmada, stock actualizado", response));
    }
}
