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
import java.util.Map;

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
            @RequestParam(required = false) Long generoId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ProductoStorefrontResponse> result = storefrontService.listarProductos(
                tenantId, categoriaId, marcaId, generoId, q, page, size);
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

    // ═══════════════════════════════════════════════════════════════
    //  FASE 1.1: GET /storefront/catalogos — Catálogos públicos
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/catalogos")
    @Operation(summary = "Catálogos públicos: tallas, colores, marcas, materiales, géneros (no requiere auth)")
    public ResponseEntity<ApiResponse<CatalogosStorefrontResponse>> obtenerCatalogos(
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerCatalogos(tenantId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 1.2: GET /storefront/empresa — Datos empresa públicos
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/empresa")
    @Operation(summary = "Datos de empresa públicos: contacto, dirección, política devoluciones (no requiere auth)")
    public ResponseEntity<ApiResponse<EmpresaStorefrontResponse>> obtenerEmpresa(
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerEmpresa(tenantId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 1.3: PUT /storefront/perfil/password — Cambiar password
    // ═══════════════════════════════════════════════════════════════
    @PutMapping("/perfil/password")
    @Operation(summary = "Cambiar contraseña del cliente autenticado")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(
            @Valid @RequestBody CambiarPasswordStorefrontRequest request) {
        storefrontService.cambiarPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada correctamente", null));
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 3.1: GET /storefront/productos/por-ids — Buscar por IDs
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/productos/por-ids")
    @Operation(summary = "Obtener productos por lista de IDs (no requiere auth)")
    public ResponseEntity<ApiResponse<List<ProductoStorefrontResponse>>> obtenerProductosPorIds(
            @RequestParam Long tenantId,
            @RequestParam List<Long> ids) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerProductosPorIds(tenantId, ids)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 3.2: GET /storefront/metodos-pago — Métodos de pago
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/metodos-pago")
    @Operation(summary = "Métodos de pago activos (no requiere auth)")
    public ResponseEntity<ApiResponse<List<MetodoPagoStorefrontResponse>>> obtenerMetodosPago(
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerMetodosPago(tenantId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 3.3: GET /storefront/ubigeo — Ubigeo público
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/ubigeo/departamentos")
    @Operation(summary = "Lista de departamentos (no requiere auth)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obtenerDepartamentos() {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerDepartamentos()));
    }

    @GetMapping("/ubigeo/provincias")
    @Operation(summary = "Provincias por departamento (no requiere auth)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obtenerProvincias(
            @RequestParam Long departamentoId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerProvincias(departamentoId)));
    }

    @GetMapping("/ubigeo/distritos")
    @Operation(summary = "Distritos por provincia (no requiere auth)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obtenerDistritos(
            @RequestParam Long provinciaId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerDistritos(provinciaId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  GET /storefront/almacenes — Almacenes para retiro en tienda
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/almacenes")
    @Operation(summary = "Almacenes activos para retiro en tienda (no requiere auth)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> obtenerAlmacenes(
            @RequestParam Long tenantId) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.obtenerAlmacenes(tenantId)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ADMIN: GET /storefront/admin/pedidos — Listar todos los pedidos
    // ═══════════════════════════════════════════════════════════════
    @GetMapping("/admin/pedidos")
    @Operation(summary = "Admin: Listar todos los pedidos del tenant")
    public ResponseEntity<ApiResponse<Page<PedidoResponse>>> listarPedidosAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(storefrontService.listarPedidosAdmin(page, size)));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ADMIN: PATCH /storefront/admin/pedidos/{id}/estado — Cambiar estado
    // ═══════════════════════════════════════════════════════════════
    @PatchMapping("/admin/pedidos/{id}/estado")
    @Operation(summary = "Admin: Cambiar estado de pedido (fulfillment)")
    public ResponseEntity<ApiResponse<PedidoResponse>> cambiarEstadoPedido(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado",
                storefrontService.cambiarEstadoPedido(id, body.get("estado"))));
    }
}
