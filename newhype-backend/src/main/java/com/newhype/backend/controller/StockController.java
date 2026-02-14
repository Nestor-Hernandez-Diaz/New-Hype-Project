package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.inventario.AjusteInventarioRequest;
import com.newhype.backend.dto.stock.KardexResponse;
import com.newhype.backend.dto.stock.StockResponse;
import com.newhype.backend.service.StockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/inventario")
@Tag(name = "Inventario", description = "Gestión de inventario, kardex, alertas, ajustes y exportación")
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

    @PostMapping("/ajustes")
    @Operation(summary = "Ajuste manual de inventario (ingreso/egreso + motivo)")
    public ResponseEntity<ApiResponse<KardexResponse>> ajusteInventario(
            @Valid @RequestBody AjusteInventarioRequest request) {
        KardexResponse response = stockService.ajusteInventario(request);
        return ResponseEntity.ok(ApiResponse.ok("Ajuste registrado", response));
    }

    @GetMapping("/stock/exportar")
    @Operation(summary = "Exportar stock a CSV")
    public ResponseEntity<byte[]> exportarStock(
            @RequestParam(required = false) Long almacenId) {
        List<List<String>> rows = stockService.exportarStockCsv(almacenId);

        StringBuilder csv = new StringBuilder();
        for (List<String> row : rows) {
            csv.append(String.join(",", row)).append("\n");
        }

        byte[] content = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock_export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(content.length)
                .body(content);
    }
}
