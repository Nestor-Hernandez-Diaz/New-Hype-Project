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
import java.util.*;
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
    private final MarcaRepository marcaRepository;
    private final MaterialRepository materialRepository;
    private final GeneroRepository generoRepository;
    private final TallaRepository tallaRepository;
    private final ColorRepository colorRepository;
    private final UnidadMedidaRepository unidadMedidaRepository;
    private final ConfiguracionEmpresaRepository configuracionEmpresaRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final DepartamentoRepository departamentoRepository;
    private final ProvinciaRepository provinciaRepository;
    private final DistritoRepository distritoRepository;
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
                             MarcaRepository marcaRepository,
                             MaterialRepository materialRepository,
                             GeneroRepository generoRepository,
                             TallaRepository tallaRepository,
                             ColorRepository colorRepository,
                             UnidadMedidaRepository unidadMedidaRepository,
                             ConfiguracionEmpresaRepository configuracionEmpresaRepository,
                             MetodoPagoRepository metodoPagoRepository,
                             DepartamentoRepository departamentoRepository,
                             ProvinciaRepository provinciaRepository,
                             DistritoRepository distritoRepository,
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
        this.marcaRepository = marcaRepository;
        this.materialRepository = materialRepository;
        this.generoRepository = generoRepository;
        this.tallaRepository = tallaRepository;
        this.colorRepository = colorRepository;
        this.unidadMedidaRepository = unidadMedidaRepository;
        this.configuracionEmpresaRepository = configuracionEmpresaRepository;
        this.metodoPagoRepository = metodoPagoRepository;
        this.departamentoRepository = departamentoRepository;
        this.provinciaRepository = provinciaRepository;
        this.distritoRepository = distritoRepository;
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
                                                             Long generoId,
                                                             String q,
                                                             int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // Get ALL active products (unpaginated) so we can filter in-memory first
        List<Producto> allProducts;
        if (q != null && !q.isBlank()) {
            allProducts = productoRepository.buscar(tenantId, q, Pageable.unpaged()).getContent();
        } else {
            allProducts = productoRepository.findByTenantIdAndEstadoTrue(tenantId, Pageable.unpaged()).getContent();
        }

        // Apply filters in-memory BEFORE pagination
        List<Producto> filtered = allProducts.stream()
                .filter(p -> categoriaId == null || categoriaId.equals(p.getCategoriaId()))
                .filter(p -> marcaId == null || marcaId.equals(p.getMarcaId()))
                .filter(p -> generoId == null || generoId.equals(p.getGeneroId()))
                .collect(Collectors.toList());

        // Pre-build sibling map (products sharing the same slug) for variant aggregation
        Map<String, List<Producto>> slugSiblingMap = allProducts.stream()
                .filter(pr -> pr.getSlug() != null)
                .collect(Collectors.groupingBy(Producto::getSlug));

        // Pre-fetch all stock for this tenant
        List<StockAlmacen> allStockList = stockAlmacenRepository.findByTenantId(tenantId);

        // Deduplicate: show only one representative product per slug
        java.util.Set<String> seenSlugs = new java.util.LinkedHashSet<>();
        List<Producto> deduped = filtered.stream()
                .filter(pr -> pr.getSlug() == null || seenSlugs.add(pr.getSlug()))
                .collect(Collectors.toList());

        // Manual pagination on deduplicated list
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), deduped.size());
        List<Producto> pageContent = start >= deduped.size()
                ? Collections.emptyList()
                : deduped.subList(start, end);
        Page<Producto> productos = new org.springframework.data.domain.PageImpl<>(
                pageContent, pageable, deduped.size());

        // Build catalog lookups
        Map<Long, Categoria> catMap = categoriaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Categoria::getId, c -> c));
        Map<Long, Marca> marcaMap = marcaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Marca::getId, m -> m));
        Map<Long, Material> materialMap = materialRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Material::getId, m -> m));
        Map<Long, Genero> generoMap = generoRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Genero::getId, g -> g));
        Map<Long, Talla> tallaMap = tallaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Talla::getId, t -> t));
        Map<Long, Color> colorMap = colorRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Color::getId, c -> c));
        Map<Long, UnidadMedida> unidadMap = unidadMedidaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(UnidadMedida::getId, u -> u));

        return productos.map(p -> {
            List<Producto> siblings = p.getSlug() != null ? slugSiblingMap.getOrDefault(p.getSlug(), List.of(p)) : List.of(p);
            return buildProductoResponse(p, catMap, marcaMap, materialMap, generoMap, tallaMap, colorMap, unidadMap, allStockList, siblings, false);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. GET /storefront/productos/{slug} — Detalle por slug
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ProductoStorefrontResponse obtenerProductoPorSlug(Long tenantId, String slug) {
        // Find all products with this slug (siblings = variants)
        List<Producto> siblings = productoRepository.findByTenantIdAndSlugAndEstadoTrue(tenantId, slug);
        if (siblings.isEmpty()) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }
        Producto p = siblings.get(0); // Representative product

        // Build catalog lookups
        Map<Long, Categoria> catMap = categoriaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Categoria::getId, c -> c));
        Map<Long, Marca> marcaMap = marcaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Marca::getId, m -> m));
        Map<Long, Material> materialMap = materialRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Material::getId, m -> m));
        Map<Long, Genero> generoMap = generoRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Genero::getId, g -> g));
        Map<Long, Talla> tallaMap = tallaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Talla::getId, t -> t));
        Map<Long, Color> colorMap = colorRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Color::getId, c -> c));
        Map<Long, UnidadMedida> unidadMap = unidadMedidaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(UnidadMedida::getId, u -> u));

        List<StockAlmacen> allStock = stockAlmacenRepository.findByTenantId(tenantId);

        return buildProductoResponse(p, catMap, marcaMap, materialMap, generoMap, tallaMap, colorMap, unidadMap, allStock, siblings, true);
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

            // FASE 2.1: Validar stock disponible
            int stockDisponible = stockAlmacenRepository.findByTenantId(tenantId).stream()
                    .filter(s -> s.getProductoId().equals(producto.getId()) && s.getCantidad() != null)
                    .mapToInt(StockAlmacen::getCantidad)
                    .sum();

            if (stockDisponible < item.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para '" + producto.getNombre() + "'. " +
                        "Disponible: " + stockDisponible + ", Solicitado: " + item.getCantidad());
            }

            // Descontar stock del almacen principal
            StockAlmacen stockPrincipal = stockAlmacenRepository
                    .findByTenantIdAndProductoIdAndAlmacenId(tenantId, producto.getId(), almacen.getId())
                    .orElse(null);

            if (stockPrincipal != null && stockPrincipal.getCantidad() >= item.getCantidad()) {
                stockPrincipal.setCantidad(stockPrincipal.getCantidad() - item.getCantidad());
                stockAlmacenRepository.save(stockPrincipal);
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

    // ═══════════════════════════════════════════════════════════════
    //  FASE 1.1: GET /storefront/catalogos — Catálogos públicos
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public CatalogosStorefrontResponse obtenerCatalogos(Long tenantId) {
        List<CatalogosStorefrontResponse.ItemCatalogo> tallas =
                tallaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                        .map(t -> CatalogosStorefrontResponse.ItemCatalogo.builder()
                                .id(t.getId()).codigo(t.getCodigo()).nombre(t.getDescripcion()).build())
                        .collect(Collectors.toList());

        List<CatalogosStorefrontResponse.ItemColor> colores =
                colorRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                        .map(c -> CatalogosStorefrontResponse.ItemColor.builder()
                                .id(c.getId()).codigo(c.getCodigo()).nombre(c.getNombre())
                                .codigoHex(c.getCodigoHex()).build())
                        .collect(Collectors.toList());

        List<CatalogosStorefrontResponse.ItemCatalogo> marcas =
                marcaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                        .map(m -> CatalogosStorefrontResponse.ItemCatalogo.builder()
                                .id(m.getId()).codigo(m.getCodigo()).nombre(m.getNombre()).build())
                        .collect(Collectors.toList());

        List<CatalogosStorefrontResponse.ItemCatalogo> materiales =
                materialRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                        .map(m -> CatalogosStorefrontResponse.ItemCatalogo.builder()
                                .id(m.getId()).codigo(m.getCodigo()).nombre(m.getDescripcion()).build())
                        .collect(Collectors.toList());

        List<CatalogosStorefrontResponse.ItemCatalogo> generos =
                generoRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                        .map(g -> CatalogosStorefrontResponse.ItemCatalogo.builder()
                                .id(g.getId()).codigo(g.getCodigo()).nombre(g.getDescripcion()).build())
                        .collect(Collectors.toList());

        return CatalogosStorefrontResponse.builder()
                .tallas(tallas).colores(colores).marcas(marcas)
                .materiales(materiales).generos(generos)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 1.2: GET /storefront/empresa — Datos empresa públicos
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public EmpresaStorefrontResponse obtenerEmpresa(Long tenantId) {
        ConfiguracionEmpresa emp = configuracionEmpresaRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración de empresa no encontrada"));

        return EmpresaStorefrontResponse.builder()
                .nombreComercial(emp.getNombreComercial())
                .razonSocial(emp.getRazonSocial())
                .direccion(emp.getDireccion())
                .telefono(emp.getTelefono())
                .email(emp.getEmail())
                .website(emp.getWebsite())
                .logoUrl(emp.getLogoUrl())
                .departamento(emp.getDepartamento())
                .provincia(emp.getProvincia())
                .distrito(emp.getDistrito())
                .diasDevolucionBoleta(emp.getDiasDevolucionBoleta())
                .diasDevolucionFactura(emp.getDiasDevolucionFactura())
                .diasVigenciaVale(emp.getDiasVigenciaVale())
                .requiereEtiquetasOriginales(emp.getRequiereEtiquetasOriginales())
                .requiereProductoSinUso(emp.getRequiereProductoSinUso())
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 1.3: PUT /storefront/perfil/password — Cambiar password
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public void cambiarPassword(CambiarPasswordStorefrontRequest request) {
        Long userId = TenantContext.getCurrentUserId();
        Long tenantId = TenantContext.getCurrentTenantId();

        ClienteTienda cliente = clienteTiendaRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));

        if (!passwordEncoder.matches(request.getPasswordActual(), cliente.getPasswordHash())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        cliente.setPasswordHash(passwordEncoder.encode(request.getPasswordNueva()));
        clienteTiendaRepository.save(cliente);
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 3.1: GET /storefront/productos/por-ids — Buscar por IDs
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<ProductoStorefrontResponse> obtenerProductosPorIds(Long tenantId, List<Long> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();

        // Reutilizamos el listado general con filtro por IDs
        List<Producto> allProducts = productoRepository.findByTenantIdAndEstadoTrue(tenantId, Pageable.unpaged()).getContent();
        Set<Long> idSet = new HashSet<>(ids);
        List<Producto> filtered = allProducts.stream()
                .filter(p -> idSet.contains(p.getId()))
                .collect(Collectors.toList());

        if (filtered.isEmpty()) return Collections.emptyList();

        // Build catalog lookups
        Map<Long, Categoria> catMap = categoriaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Categoria::getId, c -> c));
        Map<Long, Marca> marcaMap = marcaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Marca::getId, m -> m));
        Map<Long, Material> materialMap = materialRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Material::getId, m -> m));
        Map<Long, Genero> generoMap = generoRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Genero::getId, g -> g));
        Map<Long, Talla> tallaMap = tallaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Talla::getId, t -> t));
        Map<Long, Color> colorMap = colorRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(Color::getId, c -> c));
        Map<Long, UnidadMedida> unidadMap = unidadMedidaRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .collect(Collectors.toMap(UnidadMedida::getId, u -> u));

        List<StockAlmacen> allStock = stockAlmacenRepository.findByTenantId(tenantId);

        // Build sibling map for variant aggregation
        Map<String, List<Producto>> slugMap = allProducts.stream()
                .filter(pr -> pr.getSlug() != null)
                .collect(Collectors.groupingBy(Producto::getSlug));

        return filtered.stream().map(p -> {
            List<Producto> siblings = p.getSlug() != null ? slugMap.getOrDefault(p.getSlug(), List.of(p)) : List.of(p);
            return buildProductoResponse(p, catMap, marcaMap, materialMap, generoMap, tallaMap, colorMap, unidadMap, allStock, siblings, false);
        }).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 3.2: GET /storefront/metodos-pago — Métodos de pago
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<MetodoPagoStorefrontResponse> obtenerMetodosPago(Long tenantId) {
        return metodoPagoRepository.findByTenantIdAndEstadoTrue(tenantId).stream()
                .map(mp -> MetodoPagoStorefrontResponse.builder()
                        .id(mp.getId())
                        .codigo(mp.getCodigo())
                        .nombre(mp.getNombre())
                        .tipo(mp.getTipo())
                        .requiereReferencia(mp.getRequiereReferencia())
                        .build())
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════════
    //  FASE 3.3: GET /storefront/ubigeo — Ubigeo público
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDepartamentos() {
        return departamentoRepository.findAllByOrderByNombreAsc().stream()
                .map(d -> { Map<String, Object> m = new LinkedHashMap<>(); m.put("id", d.getId()); m.put("codigo", d.getCodigo()); m.put("nombre", d.getNombre()); return m; })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerProvincias(Long departamentoId) {
        return provinciaRepository.findByDepartamentoIdOrderByNombreAsc(departamentoId).stream()
                .map(p -> { Map<String, Object> m = new LinkedHashMap<>(); m.put("id", p.getId()); m.put("codigo", p.getCodigo()); m.put("nombre", p.getNombre()); m.put("parentId", p.getDepartamentoId()); return m; })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDistritos(Long provinciaId) {
        return distritoRepository.findByProvinciaIdOrderByNombreAsc(provinciaId).stream()
                .map(d -> { Map<String, Object> m = new LinkedHashMap<>(); m.put("id", d.getId()); m.put("codigo", d.getCodigo()); m.put("nombre", d.getNombre()); m.put("parentId", d.getProvinciaId()); return m; })
                .collect(Collectors.toList());
    }

    // ── Helper: Build product response ──
    private ProductoStorefrontResponse buildProductoResponse(
            Producto p,
            Map<Long, Categoria> catMap, Map<Long, Marca> marcaMap,
            Map<Long, Material> materialMap, Map<Long, Genero> generoMap,
            Map<Long, Talla> tallaMap, Map<Long, Color> colorMap,
            Map<Long, UnidadMedida> unidadMap, List<StockAlmacen> allStock,
            List<Producto> siblings, boolean includeVariantes) {

        Categoria cat = catMap.get(p.getCategoriaId());
        Marca marca = marcaMap.get(p.getMarcaId());
        Material material = materialMap.get(p.getMaterialId());
        Genero genero = generoMap.get(p.getGeneroId());
        Talla talla = tallaMap.get(p.getTallaId());
        Color color = colorMap.get(p.getColorId());
        UnidadMedida unidad = unidadMap.get(p.getUnidadMedidaId());

        BigDecimal precioLiq = null;
        if (Boolean.TRUE.equals(p.getEnLiquidacion()) && p.getPorcentajeLiquidacion() != null) {
            precioLiq = p.getPrecioVenta().subtract(
                    p.getPrecioVenta().multiply(p.getPorcentajeLiquidacion()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
        }

        List<StockAlmacen> stockList = allStock.stream()
                .filter(s -> s.getProductoId().equals(p.getId()) && s.getCantidad() != null && s.getCantidad() > 0)
                .collect(Collectors.toList());
        int totalStock = stockList.stream().mapToInt(StockAlmacen::getCantidad).sum();

        List<String> imagenes = Collections.emptyList();
        try {
            imagenes = imagenProductoRepository.findByProductoIdOrderByOrdenAsc(p.getId()).stream()
                    .map(img -> img.getUrl()).collect(Collectors.toList());
        } catch (Exception ignored) {}

        // Resolve imagenUrl: prefer imagenes_producto, then entity field
        String resolvedImagenUrl = p.getImagenUrl();
        if ((resolvedImagenUrl == null || resolvedImagenUrl.isBlank()) && !imagenes.isEmpty()) {
            resolvedImagenUrl = imagenes.get(0);
        }

        // Build tallasDisponibles and coloresDisponibles from siblings (products sharing same slug)
        List<Producto> variantSources = (siblings != null && !siblings.isEmpty()) ? siblings : List.of(p);
        List<Long> tallasDisp = variantSources.stream()
                .map(Producto::getTallaId).filter(id -> id != null)
                .distinct().sorted().collect(Collectors.toList());
        List<Long> coloresDisp = variantSources.stream()
                .map(Producto::getColorId).filter(id -> id != null)
                .distinct().sorted().collect(Collectors.toList());

        // Sum stock from all siblings for total availability
        int totalStockAllVariants = totalStock;
        if (siblings != null && siblings.size() > 1) {
            totalStockAllVariants = allStock.stream()
                    .filter(s -> siblings.stream().anyMatch(sib -> sib.getId().equals(s.getProductoId()))
                            && s.getCantidad() != null && s.getCantidad() > 0)
                    .mapToInt(StockAlmacen::getCantidad).sum();
        }

        // Build per-variant details (only on product detail page)
        List<ProductoStorefrontResponse.VarianteInfo> variantes = null;
        if (includeVariantes) {
            variantes = new ArrayList<>();
            for (Producto sibling : variantSources) {
                Talla sibTalla = tallaMap.get(sibling.getTallaId());
                Color sibColor = colorMap.get(sibling.getColorId());

                int sibStock = allStock.stream()
                        .filter(s -> s.getProductoId().equals(sibling.getId())
                                && s.getCantidad() != null && s.getCantidad() > 0)
                        .mapToInt(StockAlmacen::getCantidad).sum();

                List<String> sibImagenes = Collections.emptyList();
                try {
                    sibImagenes = imagenProductoRepository.findByProductoIdOrderByOrdenAsc(sibling.getId()).stream()
                            .map(img -> img.getUrl()).collect(Collectors.toList());
                } catch (Exception ignored) {}

                String sibImagenUrl = sibling.getImagenUrl();
                if ((sibImagenUrl == null || sibImagenUrl.isBlank()) && !sibImagenes.isEmpty()) {
                    sibImagenUrl = sibImagenes.get(0);
                }

                variantes.add(ProductoStorefrontResponse.VarianteInfo.builder()
                        .id(sibling.getId())
                        .sku(sibling.getSku())
                        .tallaId(sibling.getTallaId())
                        .tallaNombre(sibTalla != null ? sibTalla.getCodigo() : null)
                        .colorId(sibling.getColorId())
                        .colorNombre(sibColor != null ? sibColor.getNombre() : null)
                        .colorHex(sibColor != null ? sibColor.getCodigoHex() : null)
                        .stock(sibStock)
                        .disponible(sibStock > 0)
                        .imagenUrl(sibImagenUrl)
                        .imagenes(sibImagenes.isEmpty() ? null : sibImagenes)
                        .precioVenta(sibling.getPrecioVenta())
                        .build());
            }
        }

        return ProductoStorefrontResponse.builder()
                .id(p.getId()).sku(p.getSku()).nombre(p.getNombre()).slug(p.getSlug())
                .descripcion(p.getDescripcion())
                .categoriaId(p.getCategoriaId())
                .categoriaNombre(cat != null ? cat.getNombre() : null)
                .categoriaSlug(cat != null ? cat.getSlug() : null)
                .marcaId(p.getMarcaId()).marcaNombre(marca != null ? marca.getNombre() : null)
                .materialId(p.getMaterialId()).materialNombre(material != null ? material.getDescripcion() : null)
                .generoId(p.getGeneroId()).generoNombre(genero != null ? genero.getDescripcion() : null)
                .tallaId(p.getTallaId()).tallaNombre(talla != null ? talla.getCodigo() : null)
                .colorId(p.getColorId()).colorNombre(color != null ? color.getNombre() : null)
                .unidadMedidaId(p.getUnidadMedidaId()).unidadNombre(unidad != null ? unidad.getNombre() : null)
                .imagenUrl(resolvedImagenUrl).precioVenta(p.getPrecioVenta())
                .enLiquidacion(p.getEnLiquidacion()).porcentajeLiquidacion(p.getPorcentajeLiquidacion())
                .precioLiquidacion(precioLiq)
                .disponible(totalStockAllVariants > 0).stockTotal(totalStockAllVariants)
                .imagenes(imagenes).tallasDisponibles(tallasDisp).coloresDisponibles(coloresDisp)
                .variantes(variantes)
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .build();
    }
}
