package com.newhype.backend.controller;

import com.newhype.backend.dto.ApiResponse;
import com.newhype.backend.dto.auth.AuthResponse;
import com.newhype.backend.dto.storefront.*;
import com.newhype.backend.service.StorefrontService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/storefront")
@Tag(name = "Storefront", description = "Tienda online B2C para clientes finales")
public class StorefrontController {

    private final StorefrontService storefrontService;

    public StorefrontController(StorefrontService storefrontService) {
        this.storefrontService = storefrontService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  1. POST /storefront/auth/register — Registro cliente B2C
    // ═══════════════════════════════════════════════════════════════
    @PostMapping("/auth/register")
    @Operation(summary = "Registrar nuevo cliente B2C")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody StorefrontRegisterRequest request) {
        AuthResponse response = storefrontService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registro exitoso", response));
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. GET /storefront/perfil — Ver perfil del cliente
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/perfil")
    @Operation(summary = "Ver perfil del cliente autenticado")
    public ResponseEntity<ApiResponse<PerfilClienteResponse>> obtenerPerfil() {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerPerfil()));
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. PUT /storefront/perfil — Actualizar perfil
    // ═══════════════════════════════════════════════════════════════
    @PutMapping("/perfil")
    @Operation(summary = "Actualizar perfil del cliente autenticado")
    public ResponseEntity<ApiResponse<PerfilClienteResponse>> actualizarPerfil(
            @Valid @RequestBody ActualizarPerfilRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Perfil actualizado", storefrontService.actualizarPerfil(request)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. GET /storefront/productos — Catálogo público
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/productos")
    @Operation(summary = "Catálogo público de productos (no requiere auth)")
    public ResponseEntity<ApiResponse<Page<ProductoStorefrontResponse>>> listarProductos(
            @RequestParam Long tenantId,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long marcaId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProductoStorefrontResponse> result = storefrontService.listarProductos(
                tenantId, categoriaId, marcaId, q, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. GET /storefront/productos/{slug} — Detalle por slug
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/productos/{slug}")
    @Operation(summary = "Detalle de producto por slug (no requiere auth)")
    public ResponseEntity<ApiResponse<ProductoStorefrontResponse>> obtenerProducto(
            @RequestParam Long tenantId,
            @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerProductoPorSlug(tenantId, slug)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  6. GET /storefront/categorias — Categorías activas
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/categorias")
    @Operation(summary = "Categorías activas (no requiere auth)")
    public ResponseEntity<ApiResponse<List<CategoriaStorefrontResponse>>> listarCategorias(
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.listarCategorias(tenantId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  7. POST /storefront/pedidos — Crear pedido online
    // ═══════════════════════════════════════════════════════════════
    @PostMapping("/pedidos")
    @Operation(summary = "Crear pedido online (requiere auth storefront)")
    public ResponseEntity<ApiResponse<PedidoResponse>> crearPedido(
            @Valid @RequestBody CrearPedidoRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido creado", storefrontService.crearPedido(request)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  8. GET /storefront/pedidos — Mis pedidos
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/pedidos")
    @Operation(summary = "Listar mis pedidos (requiere auth storefront)")
    public ResponseEntity<ApiResponse<Page<PedidoResponse>>> misPedidos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.misPedidos(page, size)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  9. GET /storefront/pedidos/{id} — Detalle de mi pedido
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/pedidos/{id}")
    @Operation(summary = "Detalle de un pedido (requiere auth storefront)")
    public ResponseEntity<ApiResponse<PedidoResponse>> obtenerPedido(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerPedido(id)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  10. PATCH /storefront/pedidos/{id}/cancelar — Cancelar pedido
    // ═══════════════════════════════════════════════════════════════
    @PatchMapping("/pedidos/{id}/cancelar")
    @Operation(summary = "Cancelar pedido (solo PENDIENTE o CONFIRMADO)")
    public ResponseEntity<ApiResponse<PedidoResponse>> cancelarPedido(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido cancelado", storefrontService.cancelarPedido(id)));
    }
}
