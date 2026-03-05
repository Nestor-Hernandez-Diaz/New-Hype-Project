package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Controller stub para Cotizaciones.
 * Evita el error 500 que ocurre cuando el frontend admin
 * intenta cargar cotizaciones al inicializar SalesContext.
 *
 * TODO: Implementar lógica completa de cotizaciones cuando se requiera.
 */
@RestController
@RequestMapping("/api/v1/cotizaciones")
@Tag(name = "Cotizaciones", description = "Gestión de cotizaciones (stub)")
public class CotizacionController {

    @GetMapping
    @Operation(summary = "Listar cotizaciones (stub - retorna lista vacía)")
    public ResponseEntity<ApiResponse<List<Object>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList()));
    }

    @PostMapping
    @Operation(summary = "Crear cotización (stub - no implementado)")
    public ResponseEntity<ApiResponse<Object>> crear(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(501).body(ApiResponse.error("Cotizaciones aún no implementado"));
    }
}
