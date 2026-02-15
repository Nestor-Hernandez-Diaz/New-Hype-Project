package com.newhype.backend.service;

import com.newhype.backend.dto.auth.AuthResponse;
import com.newhype.backend.dto.auth.UserInfoResponse;
import com.newhype.backend.dto.storefront.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import com.newhype.backend.security.JwtUtil;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StorefrontService {

    private final ClienteTiendaRepository clienteTiendaRepository;
    private final ProductoRepository productoRepository;
    private final StockAlmacenRepository stockAlmacenRepository;
    private final CategoriaRepository categoriaRepository;
    private final AlmacenRepository almacenRepository;
    private final PedidoTiendaRepository pedidoTiendaRepository;
    private final DetallePedidoTiendaRepository detallePedidoTiendaRepository;
    private final ImagenProductoRepository imagenProductoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public StorefrontService(ClienteTiendaRepository clienteTiendaRepository,
                             ProductoRepository productoRepository,
                             StockAlmacenRepository stockAlmacenRepository,
                             CategoriaRepository categoriaRepository,
                             AlmacenRepository almacenRepository,
                             PedidoTiendaRepository pedidoTiendaRepository,
                             DetallePedidoTiendaRepository detallePedidoTiendaRepository,
                             ImagenProductoRepository imagenProductoRepository,
                             PasswordEncoder passwordEncoder,
                             JwtUtil jwtUtil) {
        this.clienteTiendaRepository = clienteTiendaRepository;
        this.productoRepository = productoRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.categoriaRepository = categoriaRepository;
        this.almacenRepository = almacenRepository;
        this.pedidoTiendaRepository = pedidoTiendaRepository;
        this.detallePedidoTiendaRepository = detallePedidoTiendaRepository;
        this.imagenProductoRepository = imagenProductoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ═══════════════════════════════════════════════════════════════
    //  1. POST /storefront/auth/register — Registro cliente B2C
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public AuthResponse register(StorefrontRegisterRequest request) {
        Long tenantId = request.getTenantId();

        if (clienteTiendaRepository.existsByTenantIdAndEmail(tenantId, request.getEmail())) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        ClienteTienda cliente = ClienteTienda.builder()
                .tenantId(tenantId)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .telefono(request.getTelefono())
                .build();
        cliente = clienteTiendaRepository.save(cliente);

        String accessToken = jwtUtil.generateAccessToken(cliente.getId(), tenantId, "CLIENTE");
        String refreshToken = jwtUtil.generateRefreshToken(cliente.getId(), tenantId, "storefront");

        UserInfoResponse userInfo = UserInfoResponse.builder()
                .id(cliente.getId())
                .email(cliente.getEmail())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .rol("CLIENTE")
                .tenantId(tenantId)
                .scope("storefront")
                .build();

        return AuthResponse.of(accessToken, refreshToken, jwtUtil.getJwtExpirationMs(), "storefront", userInfo);
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. GET /storefront/perfil — Ver perfil del cliente
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public PerfilClienteResponse obtenerPerfil() {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        ClienteTienda cliente = clienteTiendaRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        return PerfilClienteResponse.builder()
                .id(cliente.getId())
                .email(cliente.getEmail())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .telefono(cliente.getTelefono())
                .direccion(cliente.getDireccion())
                .ultimoAcceso(cliente.getUltimoAcceso())
                .createdAt(cliente.getCreatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. PUT /storefront/perfil — Actualizar perfil
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public PerfilClienteResponse actualizarPerfil(ActualizarPerfilRequest request) {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        ClienteTienda cliente = clienteTiendaRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        if (request.getNombre() != null) cliente.setNombre(request.getNombre());
        if (request.getApellido() != null) cliente.setApellido(request.getApellido());
        if (request.getTelefono() != null) cliente.setTelefono(request.getTelefono());
        if (request.getDireccion() != null) cliente.setDireccion(request.getDireccion());

        cliente = clienteTiendaRepository.save(cliente);

        return PerfilClienteResponse.builder()
                .id(cliente.getId())
                .email(cliente.getEmail())
                .nombre(cliente.getNombre())
                .apellido(cliente.getApellido())
                .telefono(cliente.getTelefono())
                .direccion(cliente.getDireccion())
                .ultimoAcceso(cliente.getUltimoAcceso())
                .createdAt(cliente.getCreatedAt())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. GET /storefront/productos — Catálogo público
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public Page<ProductoStorefrontResponse> listarProductos(Long tenantId,
                                                             Long categoriaId,
                                                             Long marcaId,
                                                             String q,
                                                             int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Producto> productos;
        if (q != null && !q.isBlank()) {
            productos = productoRepository.buscar(tenantId, q, pageable);
        } else {
            productos = productoRepository.findByTenantIdAndEstadoTrue(tenantId, pageable);
        }

        // Build catalog lookups
        Map<Long, Categoria> catMap = categoriaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Categoria::getId, c -> c));

        return productos.map(p -> {
            // Filter by categoriaId / marcaId in-memory if needed
            if (categoriaId != null && !categoriaId.equals(p.getCategoriaId())) return null;
            if (marcaId != null && !marcaId.equals(p.getMarcaId())) return null;

            Categoria cat = catMap.get(p.getCategoriaId());
            BigDecimal precioLiq = null;
            if (Boolean.TRUE.equals(p.getEnLiquidacion()) && p.getPorcentajeLiquidacion() != null) {
                precioLiq = p.getPrecioVenta().subtract(
                        p.getPrecioVenta().multiply(p.getPorcentajeLiquidacion()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            }

            // Check stock availability
            List<StockAlmacen> stockList = stockAlmacenRepository.findByTenantId(tenantId).stream()
                    .filter(s -> s.getProductoId().equals(p.getId()) && s.getCantidad() != null && s.getCantidad() > 0)
                    .collect(Collectors.toList());

            return ProductoStorefrontResponse.builder()
                    .id(p.getId())
                    .sku(p.getSku())
                    .nombre(p.getNombre())
                    .slug(p.getSlug())
                    .descripcion(p.getDescripcion())
                    .categoriaNombre(cat != null ? cat.getNombre() : null)
                    .categoriaSlug(cat != null ? cat.getSlug() : null)
                    .imagenUrl(p.getImagenUrl())
                    .precioVenta(p.getPrecioVenta())
                    .enLiquidacion(p.getEnLiquidacion())
                    .porcentajeLiquidacion(p.getPorcentajeLiquidacion())
                    .precioLiquidacion(precioLiq)
                    .disponible(!stockList.isEmpty())
                    .build();
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. GET /storefront/productos/{slug} — Detalle por slug
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ProductoStorefrontResponse obtenerProductoPorSlug(Long tenantId, String slug) {
        Producto p = productoRepository.findAll().stream()
                .filter(prod -> prod.getTenantId().equals(tenantId)
                        && Boolean.TRUE.equals(prod.getEstado())
                        && slug.equals(prod.getSlug()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        Map<Long, Categoria> catMap = categoriaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Categoria::getId, c -> c));
        Categoria cat = catMap.get(p.getCategoriaId());

        BigDecimal precioLiq = null;
        if (Boolean.TRUE.equals(p.getEnLiquidacion()) && p.getPorcentajeLiquidacion() != null) {
            precioLiq = p.getPrecioVenta().subtract(
                    p.getPrecioVenta().multiply(p.getPorcentajeLiquidacion()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        }

        List<StockAlmacen> stockList = stockAlmacenRepository.findByTenantId(tenantId).stream()
                .filter(s -> s.getProductoId().equals(p.getId()) && s.getCantidad() != null && s.getCantidad() > 0)
                .collect(Collectors.toList());

        // Get product images
        List<String> imagenes = Collections.emptyList();
        try {
            imagenes = imagenProductoRepository.findByProductoIdOrderByOrdenAsc(p.getId()).stream()
                    .map(img -> img.getUrl())
                    .collect(Collectors.toList());
        } catch (Exception ignored) {}

        return ProductoStorefrontResponse.builder()
                .id(p.getId())
                .sku(p.getSku())
                .nombre(p.getNombre())
                .slug(p.getSlug())
                .descripcion(p.getDescripcion())
                .categoriaNombre(cat != null ? cat.getNombre() : null)
                .categoriaSlug(cat != null ? cat.getSlug() : null)
                .imagenUrl(p.getImagenUrl())
                .precioVenta(p.getPrecioVenta())
                .enLiquidacion(p.getEnLiquidacion())
                .porcentajeLiquidacion(p.getPorcentajeLiquidacion())
                .precioLiquidacion(precioLiq)
                .disponible(!stockList.isEmpty())
                .imagenes(imagenes)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  6. GET /storefront/categorias — Categorías activas
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<CategoriaStorefrontResponse> listarCategorias(Long tenantId) {
        return categoriaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .map(c -> CategoriaStorefrontResponse.builder()
                        .id(c.getId())
                        .nombre(c.getNombre())
                        .slug(c.getSlug())
                        .descripcion(c.getDescripcion())
                        .build())
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    //  7. POST /storefront/pedidos — Crear pedido online
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public PedidoResponse crearPedido(CrearPedidoRequest request) {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        // Get default almacen
        Almacen almacen = almacenRepository.findByTenantId(tenantId).stream()
                .filter(a -> Boolean.TRUE.equals(a.getEstado()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No hay almacén activo en la tienda"));

        // Generate codigo
        long count = pedidoTiendaRepository.countByTenantId(tenantId);
        String codigo = "PED-" + String.format("%06d", count + 1);

        PedidoTienda pedido = PedidoTienda.builder()
                .tenantId(tenantId)
                .codigo(codigo)
                .clienteTiendaId(userId)
                .almacenId(almacen.getId())
                .direccionEnvio(request.getDireccionEnvio())
                .instrucciones(request.getInstrucciones())
                .build();
        pedido = pedidoTiendaRepository.save(pedido);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CrearPedidoRequest.ItemPedido item : request.getItems()) {
            Producto producto = productoRepository.findByIdAndTenantId(item.getProductoId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + item.getProductoId()));

            if (!Boolean.TRUE.equals(producto.getEstado())) {
                throw new IllegalArgumentException("Producto no disponible: " + producto.getNombre());
            }

            BigDecimal precio = producto.getPrecioVenta();
            if (Boolean.TRUE.equals(producto.getEnLiquidacion()) && producto.getPorcentajeLiquidacion() != null) {
                precio = precio.subtract(
                        precio.multiply(producto.getPorcentajeLiquidacion()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            }

            BigDecimal lineSubtotal = precio.multiply(BigDecimal.valueOf(item.getCantidad()));

            DetallePedidoTienda detalle = DetallePedidoTienda.builder()
                    .pedidoTiendaId(pedido.getId())
                    .productoId(producto.getId())
                    .nombreProducto(producto.getNombre())
                    .cantidad(item.getCantidad())
                    .precioUnitario(precio)
                    .subtotal(lineSubtotal)
                    .build();
            detallePedidoTiendaRepository.save(detalle);

            subtotal = subtotal.add(lineSubtotal);
        }

        // Calculate IGV (18%)
        BigDecimal igv = subtotal.multiply(BigDecimal.valueOf(0.18)).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(igv);

        pedido.setSubtotal(subtotal);
        pedido.setIgv(igv);
        pedido.setTotal(total);
        pedido = pedidoTiendaRepository.save(pedido);

        return toPedidoResponse(pedido);
    }

    // ═══════════════════════════════════════════════════════════════
    //  8. GET /storefront/pedidos — Mis pedidos
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public Page<PedidoResponse> misPedidos(int page, int size) {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        Page<PedidoTienda> pedidos = pedidoTiendaRepository
                .findByTenantIdAndClienteTiendaIdOrderByCreatedAtDesc(
                        tenantId, userId, PageRequest.of(page, size));

        return pedidos.map(this::toPedidoResponse);
    }

    // ═══════════════════════════════════════════════════════════════
    //  9. GET /storefront/pedidos/{id} — Detalle de mi pedido
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedido(Long pedidoId) {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        PedidoTienda pedido = pedidoTiendaRepository
                .findByIdAndTenantIdAndClienteTiendaId(pedidoId, tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        return toPedidoResponse(pedido);
    }

    // ═══════════════════════════════════════════════════════════════
    //  10. PATCH /storefront/pedidos/{id}/cancelar — Cancelar pedido
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public PedidoResponse cancelarPedido(Long pedidoId) {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        PedidoTienda pedido = pedidoTiendaRepository
                .findByIdAndTenantIdAndClienteTiendaId(pedidoId, tenantId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        // Solo se puede cancelar si está en PENDIENTE o CONFIRMADO
        if (pedido.getEstado() != PedidoTienda.EstadoPedido.PENDIENTE
                && pedido.getEstado() != PedidoTienda.EstadoPedido.CONFIRMADO) {
            throw new IllegalStateException("Solo se puede cancelar pedidos en estado PENDIENTE o CONFIRMADO. Estado actual: " + pedido.getEstado());
        }

        pedido.setEstado(PedidoTienda.EstadoPedido.CANCELADO);
        pedido = pedidoTiendaRepository.save(pedido);

        return toPedidoResponse(pedido);
    }

    // ── Helper ──
    private PedidoResponse toPedidoResponse(PedidoTienda pedido) {
        List<DetallePedidoTienda> detalles = detallePedidoTiendaRepository
                .findByPedidoTiendaId(pedido.getId());

        List<PedidoResponse.DetallePedidoResponse> detalleResponses = detalles.stream()
                .map(d -> PedidoResponse.DetallePedidoResponse.builder()
                        .productoId(d.getProductoId())
                        .nombreProducto(d.getNombreProducto())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .descuento(d.getDescuento())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        return PedidoResponse.builder()
                .id(pedido.getId())
                .codigo(pedido.getCodigo())
                .estado(pedido.getEstado() != null ? pedido.getEstado().name() : null)
                .subtotal(pedido.getSubtotal())
                .igv(pedido.getIgv())
                .descuento(pedido.getDescuento())
                .total(pedido.getTotal())
                .direccionEnvio(pedido.getDireccionEnvio())
                .instrucciones(pedido.getInstrucciones())
                .createdAt(pedido.getCreatedAt())
                .updatedAt(pedido.getUpdatedAt())
                .detalles(detalleResponses)
                .build();
    }
}
