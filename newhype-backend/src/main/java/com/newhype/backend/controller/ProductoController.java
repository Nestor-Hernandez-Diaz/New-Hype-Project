package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.producto.*;
import com.newhype.backend.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
@Tag(name = "Productos", description = "CRUD de productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    @Operation(summary = "Crear producto")
    public ResponseEntity<ApiResponse<ProductoResponse>> crear(@Valid @RequestBody ProductoRequest request) {
        ProductoResponse response = productoService.crear(request);
        return ResponseEntity.ok(ApiResponse.ok("Producto creado", response));
    }

    @GetMapping
    @Operation(summary = "Listar productos con filtros y paginación")
    public ResponseEntity<ApiResponse<List<ProductoResponse>>> listar(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ProductoResponse> resultado = productoService.listar(nombre, categoriaId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        ApiResponse<List<ProductoResponse>> response = ApiResponse.<List<ProductoResponse>>builder()
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
    @Operation(summary = "Obtener producto por ID")
    public ResponseEntity<ApiResponse<ProductoResponse>> obtenerPorId(@PathVariable Long id) {
        ProductoResponse response = productoService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar producto")
    public ResponseEntity<ApiResponse<ProductoResponse>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {
        ProductoResponse response = productoService.actualizar(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Producto actualizado", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar producto (soft delete)")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto eliminado", null));
    }

    // ── New endpoints ──

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de producto")
    public ResponseEntity<ApiResponse<ProductoResponse>> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody EstadoRequest request) {
        ProductoResponse response = productoService.cambiarEstado(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado", response));
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar productos por nombre o SKU")
    public ResponseEntity<ApiResponse<List<ProductoResponse>>> buscar(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<ProductoResponse> resultado = productoService.buscar(q, page, size);

        ApiResponse<List<ProductoResponse>> response = ApiResponse.<List<ProductoResponse>>builder()
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

    @PostMapping("/liquidacion")
    @Operation(summary = "Marcar productos en liquidación")
    public ResponseEntity<ApiResponse<Integer>> marcarLiquidacion(
            @Valid @RequestBody LiquidacionRequest request) {
        int afectados = productoService.marcarLiquidacion(request);
        return ResponseEntity.ok(ApiResponse.ok(afectados + " productos en liquidación", afectados));
    }

    @GetMapping("/{id}/imagenes")
    @Operation(summary = "Listar imágenes de un producto")
    public ResponseEntity<ApiResponse<List<ImagenResponse>>> listarImagenes(@PathVariable Long id) {
        List<ImagenResponse> response = productoService.listarImagenes(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/imagenes")
    @Operation(summary = "Agregar imagen a un producto")
    public ResponseEntity<ApiResponse<ImagenResponse>> agregarImagen(
            @PathVariable Long id,
            @RequestBody ImagenResponse request) {
        ImagenResponse response = productoService.agregarImagen(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Imagen agregada", response));
    }

    @DeleteMapping("/{productoId}/imagenes/{imagenId}")
    @Operation(summary = "Eliminar imagen de un producto")
    public ResponseEntity<ApiResponse<Void>> eliminarImagen(
            @PathVariable Long productoId,
            @PathVariable Long imagenId) {
        productoService.eliminarImagen(productoId, imagenId);
        return ResponseEntity.ok(ApiResponse.ok("Imagen eliminada", null));
    }
}
