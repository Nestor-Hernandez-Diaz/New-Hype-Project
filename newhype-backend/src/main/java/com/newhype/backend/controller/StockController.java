package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.stock.KardexResponse;
import com.newhype.backend.dto.stock.StockResponse;
import com.newhype.backend.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/inventario")
@Tag(name = "Inventario", description = "Consulta de inventario, kardex y alertas")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/stock")
    @Operation(summary = "Consultar stock por almacén")
    public ResponseEntity<ApiResponse<List<StockResponse>>> consultarStock(
            @RequestParam(required = false) Long almacenId) {
        List<StockResponse> response = stockService.consultarStock(almacenId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/kardex")
    @Operation(summary = "Consultar kardex (movimientos) de un producto")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getKardex(
            @RequestParam Long productoId,
            @RequestParam(required = false) Long almacenId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<KardexResponse> result = stockService.getKardex(productoId, almacenId, page, size);

        Map<String, Object> data = Map.of(
                "movimientos", result.getContent(),
                "pagination", Map.of(
                        "page", result.getNumber(),
                        "size", result.getSize(),
                        "totalElements", result.getTotalElements(),
                        "totalPages", result.getTotalPages()
                )
        );

        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @GetMapping("/alertas")
    @Operation(summary = "Listar productos con stock bajo mínimo")
    public ResponseEntity<ApiResponse<List<StockResponse>>> getAlertas() {
        List<StockResponse> alertas = stockService.getAlertas();
        return ResponseEntity.ok(ApiResponse.ok(alertas));
    }
}
