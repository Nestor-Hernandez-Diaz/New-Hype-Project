package com.newhype.backend.service;

import com.newhype.backend.dto.reporte.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.repository.*;
import com.newhype.backend.security.TenantContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportesService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final OrdenCompraRepository ordenCompraRepository;
    private final SesionCajaRepository sesionCajaRepository;
    private final StockAlmacenRepository stockAlmacenRepository;
    private final ProductoRepository productoRepository;
    private final NotaCreditoRepository notaCreditoRepository;
    private final EntidadComercialRepository entidadComercialRepository;
    private final AlmacenRepository almacenRepository;
    private final UsuarioRepository usuarioRepository;
    private final CajaRegistradoraRepository cajaRegistradoraRepository;

    public ReportesService(VentaRepository ventaRepository,
                           DetalleVentaRepository detalleVentaRepository,
                           OrdenCompraRepository ordenCompraRepository,
                           SesionCajaRepository sesionCajaRepository,
                           StockAlmacenRepository stockAlmacenRepository,
                           ProductoRepository productoRepository,
                           NotaCreditoRepository notaCreditoRepository,
                           EntidadComercialRepository entidadComercialRepository,
                           AlmacenRepository almacenRepository,
                           UsuarioRepository usuarioRepository,
                           CajaRegistradoraRepository cajaRegistradoraRepository) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.ordenCompraRepository = ordenCompraRepository;
        this.sesionCajaRepository = sesionCajaRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.productoRepository = productoRepository;
        this.notaCreditoRepository = notaCreditoRepository;
        this.entidadComercialRepository = entidadComercialRepository;
        this.almacenRepository = almacenRepository;
        this.usuarioRepository = usuarioRepository;
        this.cajaRegistradoraRepository = cajaRegistradoraRepository;
    }

    // ═══════════════════════════════════════════════════════════════
    //  1. GET /reportes/resumen — Dashboard ejecutivo
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ResumenDashboardResponse resumen() {
        Long tenantId = TenantContext.getCurrentTenantId();
        LocalDateTime hoyInicio = LocalDate.now().atStartOfDay();
        LocalDateTime hoyFin = LocalDate.now().atTime(LocalTime.MAX);
        LocalDateTime mesInicio = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        // Ventas hoy
        List<Venta> ventasHoy = ventaRepository.findAll().stream()
                .filter(v -> v.getTenantId().equals(tenantId)
                        && v.getEstado() == Venta.EstadoVenta.COMPLETADA
                        && v.getFechaEmision() != null
                        && !v.getFechaEmision().isBefore(hoyInicio)
                        && !v.getFechaEmision().isAfter(hoyFin))
                .collect(Collectors.toList());
        BigDecimal totalVentasHoy = ventasHoy.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Ventas mes
        List<Venta> ventasMes = ventaRepository.findAll().stream()
                .filter(v -> v.getTenantId().equals(tenantId)
                        && v.getEstado() == Venta.EstadoVenta.COMPLETADA
                        && v.getFechaEmision() != null
                        && !v.getFechaEmision().isBefore(mesInicio))
                .collect(Collectors.toList());
        BigDecimal totalVentasMes = ventasMes.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Stock bajo
        List<StockAlmacen> stocks = stockAlmacenRepository.findByTenantId(tenantId);
        long stockBajo = stocks.stream()
                .filter(s -> s.getCantidad() != null && s.getStockMinimo() != null
                        && s.getCantidad() <= s.getStockMinimo() && s.getStockMinimo() > 0)
                .count();

        // Compras pendientes
        long comprasPendientes = ordenCompraRepository.countByTenantIdAndEstado(
                tenantId, OrdenCompra.EstadoOrdenCompra.PENDIENTE);

        // Notas crédito mes
        List<NotaCredito> ncMes = notaCreditoRepository.findAll().stream()
                .filter(nc -> nc.getTenantId().equals(tenantId)
                        && nc.getEstado() == NotaCredito.EstadoNotaCredito.APLICADA
                        && nc.getCreatedAt() != null
                        && !nc.getCreatedAt().isBefore(mesInicio))
                .collect(Collectors.toList());
        BigDecimal totalNcMes = ncMes.stream()
                .map(NotaCredito::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Productos activos
        long productosActivos = productoRepository.findAll().stream()
                .filter(p -> p.getTenantId().equals(tenantId) && Boolean.TRUE.equals(p.getEstado()))
                .count();

        // Clientes
        long clientes = entidadComercialRepository.findAll().stream()
                .filter(e -> e.getTenantId().equals(tenantId))
                .count();

        return ResumenDashboardResponse.builder()
                .ventasHoy(ventasHoy.size())
                .totalVentasHoy(totalVentasHoy)
                .ventasMes(ventasMes.size())
                .totalVentasMes(totalVentasMes)
                .productosStockBajo(stockBajo)
                .comprasPendientes(comprasPendientes)
                .notasCreditoMes(ncMes.size())
                .totalNotasCreditoMes(totalNcMes)
                .productosActivos(productosActivos)
                .clientesRegistrados(clientes)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  2. GET /reportes/ventas — Reporte de ventas con filtros
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ReporteVentasResponse reporteVentas(String fechaDesde, String fechaHasta,
                                                Long usuarioId, Long clienteId,
                                                String tipoComprobante) {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime desde = fechaDesde != null
                ? LocalDate.parse(fechaDesde).atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime hasta = fechaHasta != null
                ? LocalDate.parse(fechaHasta).atTime(LocalTime.MAX) : LocalDateTime.now();

        List<Venta> ventas = ventaRepository.findAll().stream()
                .filter(v -> v.getTenantId().equals(tenantId)
                        && v.getEstado() == Venta.EstadoVenta.COMPLETADA
                        && v.getFechaEmision() != null
                        && !v.getFechaEmision().isBefore(desde)
                        && !v.getFechaEmision().isAfter(hasta))
                .filter(v -> usuarioId == null || usuarioId.equals(v.getUsuarioId()))
                .filter(v -> clienteId == null || clienteId.equals(v.getClienteId()))
                .filter(v -> tipoComprobante == null || v.getTipoComprobante().name().equals(tipoComprobante))
                .collect(Collectors.toList());

        BigDecimal montoTotal = ventas.stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal montoIgv = ventas.stream().map(Venta::getIgv).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal montoDesc = ventas.stream().map(Venta::getDescuento).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal ticketPromedio = ventas.isEmpty() ? BigDecimal.ZERO
                : montoTotal.divide(BigDecimal.valueOf(ventas.size()), 2, RoundingMode.HALF_UP);

        // Agrupar por día
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, List<Venta>> porDia = ventas.stream()
                .collect(Collectors.groupingBy(v -> v.getFechaEmision().format(fmt),
                        TreeMap::new, Collectors.toList()));

        List<ReporteVentasResponse.VentaPorDia> ventasPorDia = porDia.entrySet().stream()
                .map(e -> ReporteVentasResponse.VentaPorDia.builder()
                        .fecha(e.getKey())
                        .cantidad(e.getValue().size())
                        .total(e.getValue().stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .collect(Collectors.toList());

        // Agrupar por tipo comprobante
        Map<String, List<Venta>> porTipo = ventas.stream()
                .collect(Collectors.groupingBy(v -> v.getTipoComprobante().name()));

        List<ReporteVentasResponse.VentaPorTipo> ventasPorTipo = porTipo.entrySet().stream()
                .map(e -> ReporteVentasResponse.VentaPorTipo.builder()
                        .tipoComprobante(e.getKey())
                        .cantidad(e.getValue().size())
                        .total(e.getValue().stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .collect(Collectors.toList());

        return ReporteVentasResponse.builder()
                .totalVentas(ventas.size())
                .montoTotal(montoTotal)
                .montoIgv(montoIgv)
                .montoDescuentos(montoDesc)
                .ticketPromedio(ticketPromedio)
                .ventasPorDia(ventasPorDia)
                .ventasPorTipo(ventasPorTipo)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  3. GET /reportes/inventario — Estado del inventario
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ReporteInventarioResponse reporteInventario(Long almacenId, Long categoriaId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        List<StockAlmacen> stocks = almacenId != null
                ? stockAlmacenRepository.findByTenantIdAndAlmacenId(tenantId, almacenId)
                : stockAlmacenRepository.findByTenantId(tenantId);

        // Join with products for categoriaId filter and valorizacion
        Map<Long, Producto> productosMap = productoRepository.findAll().stream()
                .filter(p -> p.getTenantId().equals(tenantId))
                .collect(Collectors.toMap(Producto::getId, p -> p));

        if (categoriaId != null) {
            stocks = stocks.stream()
                    .filter(s -> {
                        Producto p = productosMap.get(s.getProductoId());
                        return p != null && categoriaId.equals(p.getCategoriaId());
                    })
                    .collect(Collectors.toList());
        }

        long conStock = stocks.stream().filter(s -> s.getCantidad() != null && s.getCantidad() > 0).count();
        long sinStock = stocks.stream().filter(s -> s.getCantidad() == null || s.getCantidad() == 0).count();
        long stockBajo = stocks.stream()
                .filter(s -> s.getCantidad() != null && s.getStockMinimo() != null
                        && s.getCantidad() <= s.getStockMinimo() && s.getStockMinimo() > 0 && s.getCantidad() > 0)
                .count();

        BigDecimal valorizacion = stocks.stream()
                .map(s -> {
                    Producto p = productosMap.get(s.getProductoId());
                    if (p != null && p.getPrecioCosto() != null && s.getCantidad() != null) {
                        return p.getPrecioCosto().multiply(BigDecimal.valueOf(s.getCantidad()));
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Group by almacen
        Map<Long, Almacen> almacenesMap = almacenRepository.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(Almacen::getId, a -> a));

        Map<Long, List<StockAlmacen>> porAlmacen = stocks.stream()
                .collect(Collectors.groupingBy(StockAlmacen::getAlmacenId));

        List<ReporteInventarioResponse.InventarioPorAlmacen> porAlmacenList = porAlmacen.entrySet().stream()
                .map(e -> {
                    Almacen alm = almacenesMap.get(e.getKey());
                    List<StockAlmacen> items = e.getValue();
                    long sb = items.stream()
                            .filter(s -> s.getCantidad() != null && s.getStockMinimo() != null
                                    && s.getCantidad() <= s.getStockMinimo() && s.getStockMinimo() > 0)
                            .count();
                    BigDecimal val = items.stream()
                            .map(s -> {
                                Producto p = productosMap.get(s.getProductoId());
                                if (p != null && p.getPrecioCosto() != null && s.getCantidad() != null) {
                                    return p.getPrecioCosto().multiply(BigDecimal.valueOf(s.getCantidad()));
                                }
                                return BigDecimal.ZERO;
                            })
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return ReporteInventarioResponse.InventarioPorAlmacen.builder()
                            .almacenId(e.getKey())
                            .almacenNombre(alm != null ? alm.getNombre() : "Almacén " + e.getKey())
                            .totalItems(items.size())
                            .stockBajo(sb)
                            .valorizacion(val)
                            .build();
                })
                .collect(Collectors.toList());

        return ReporteInventarioResponse.builder()
                .totalProductos(stocks.size())
                .productosConStock(conStock)
                .productosStockBajo(stockBajo)
                .productosSinStock(sinStock)
                .valorizacionTotal(valorizacion)
                .porAlmacen(porAlmacenList)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  4. GET /reportes/compras — Compras por proveedor
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ReporteComprasResponse reporteCompras(String fechaDesde, String fechaHasta,
                                                  Long proveedorId, String estado) {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime desde = fechaDesde != null
                ? LocalDate.parse(fechaDesde).atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime hasta = fechaHasta != null
                ? LocalDate.parse(fechaHasta).atTime(LocalTime.MAX) : LocalDateTime.now();

        List<OrdenCompra> ordenes = ordenCompraRepository.findAll().stream()
                .filter(o -> o.getTenantId().equals(tenantId)
                        && o.getCreatedAt() != null
                        && !o.getCreatedAt().isBefore(desde)
                        && !o.getCreatedAt().isAfter(hasta))
                .filter(o -> proveedorId == null || proveedorId.equals(o.getProveedorId()))
                .filter(o -> estado == null || o.getEstado().name().equals(estado))
                .collect(Collectors.toList());

        BigDecimal montoTotal = ordenes.stream().map(OrdenCompra::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        long pendientes = ordenes.stream()
                .filter(o -> o.getEstado() == OrdenCompra.EstadoOrdenCompra.PENDIENTE).count();
        long completadas = ordenes.stream()
                .filter(o -> o.getEstado() == OrdenCompra.EstadoOrdenCompra.COMPLETADA).count();

        // Group by proveedor
        Map<Long, EntidadComercial> proveedoresMap = entidadComercialRepository.findAll().stream()
                .filter(e -> e.getTenantId().equals(tenantId))
                .collect(Collectors.toMap(EntidadComercial::getId, e -> e));

        Map<Long, List<OrdenCompra>> porProveedor = ordenes.stream()
                .collect(Collectors.groupingBy(OrdenCompra::getProveedorId));

        List<ReporteComprasResponse.CompraPorProveedor> porProveedorList = porProveedor.entrySet().stream()
                .map(e -> {
                    EntidadComercial prov = proveedoresMap.get(e.getKey());
                    List<OrdenCompra> ocs = e.getValue();
                    BigDecimal monto = ocs.stream().map(OrdenCompra::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return ReporteComprasResponse.CompraPorProveedor.builder()
                            .proveedorId(e.getKey())
                            .proveedorNombre(prov != null ? prov.getRazonSocial() : "Proveedor " + e.getKey())
                            .cantidadOrdenes(ocs.size())
                            .montoTotal(monto)
                            .build();
                })
                .sorted((a, b) -> b.getMontoTotal().compareTo(a.getMontoTotal()))
                .collect(Collectors.toList());

        return ReporteComprasResponse.builder()
                .totalOrdenes(ordenes.size())
                .montoTotal(montoTotal)
                .ordenesPendientes(pendientes)
                .ordenesCompletadas(completadas)
                .porProveedor(porProveedorList)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  5. GET /reportes/financiero — Balance ingresos/egresos
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ReporteFinancieroResponse reporteFinanciero(String fechaDesde, String fechaHasta) {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime desde = fechaDesde != null
                ? LocalDate.parse(fechaDesde).atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime hasta = fechaHasta != null
                ? LocalDate.parse(fechaHasta).atTime(LocalTime.MAX) : LocalDateTime.now();

        // Ingresos: ventas completadas
        List<Venta> ventas = ventaRepository.findAll().stream()
                .filter(v -> v.getTenantId().equals(tenantId)
                        && v.getEstado() == Venta.EstadoVenta.COMPLETADA
                        && v.getFechaEmision() != null
                        && !v.getFechaEmision().isBefore(desde)
                        && !v.getFechaEmision().isAfter(hasta))
                .collect(Collectors.toList());
        BigDecimal totalIngresos = ventas.stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Egresos: compras completadas
        List<OrdenCompra> compras = ordenCompraRepository.findAll().stream()
                .filter(o -> o.getTenantId().equals(tenantId)
                        && o.getEstado() == OrdenCompra.EstadoOrdenCompra.COMPLETADA
                        && o.getCreatedAt() != null
                        && !o.getCreatedAt().isBefore(desde)
                        && !o.getCreatedAt().isAfter(hasta))
                .collect(Collectors.toList());
        BigDecimal totalEgresos = compras.stream().map(OrdenCompra::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Devoluciones
        List<NotaCredito> ncs = notaCreditoRepository.findAll().stream()
                .filter(nc -> nc.getTenantId().equals(tenantId)
                        && nc.getEstado() == NotaCredito.EstadoNotaCredito.APLICADA
                        && nc.getCreatedAt() != null
                        && !nc.getCreatedAt().isBefore(desde)
                        && !nc.getCreatedAt().isAfter(hasta))
                .collect(Collectors.toList());
        BigDecimal totalDevoluciones = ncs.stream().map(NotaCredito::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balanceNeto = totalIngresos.subtract(totalEgresos).subtract(totalDevoluciones);

        return ReporteFinancieroResponse.builder()
                .totalIngresos(totalIngresos)
                .totalVentas(ventas.size())
                .totalEgresos(totalEgresos)
                .totalCompras(compras.size())
                .totalDevoluciones(totalDevoluciones)
                .totalNotasCredito(ncs.size())
                .balanceNeto(balanceNeto)
                .margenBruto(totalIngresos.compareTo(BigDecimal.ZERO) > 0
                        ? balanceNeto.divide(totalIngresos, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                        : BigDecimal.ZERO)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  6. GET /reportes/caja — Sesiones de caja
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ReporteCajaResponse reporteCaja(String fechaDesde, String fechaHasta,
                                            Long cajaId, Long usuarioId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime desde = fechaDesde != null
                ? LocalDate.parse(fechaDesde).atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime hasta = fechaHasta != null
                ? LocalDate.parse(fechaHasta).atTime(LocalTime.MAX) : LocalDateTime.now();

        List<SesionCaja> sesiones = sesionCajaRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .filter(s -> s.getCreatedAt() != null
                        && !s.getCreatedAt().isBefore(desde)
                        && !s.getCreatedAt().isAfter(hasta))
                .filter(s -> cajaId == null || cajaId.equals(s.getCajaRegistradoraId()))
                .filter(s -> usuarioId == null || usuarioId.equals(s.getUsuarioId()))
                .collect(Collectors.toList());

        Map<Long, Usuario> userMap = usuarioRepository.findAll().stream()
                .filter(u -> u.getTenantId().equals(tenantId))
                .collect(Collectors.toMap(Usuario::getId, u -> u));

        Map<Long, CajaRegistradora> cajaMap = cajaRegistradoraRepository.findByTenantId(tenantId).stream()
                .collect(Collectors.toMap(CajaRegistradora::getId, c -> c));

        BigDecimal totalVentas = sesiones.stream()
                .map(s -> s.getTotalVentas() != null ? s.getTotalVentas() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDifs = sesiones.stream()
                .map(s -> s.getDiferencia() != null ? s.getDiferencia() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        List<ReporteCajaResponse.SesionCajaResumen> sesionResumenes = sesiones.stream()
                .map(s -> {
                    Usuario user = userMap.get(s.getUsuarioId());
                    CajaRegistradora caja = cajaMap.get(s.getCajaRegistradoraId());
                    return ReporteCajaResponse.SesionCajaResumen.builder()
                            .sesionId(s.getId())
                            .cajaId(s.getCajaRegistradoraId())
                            .cajaNombre(caja != null ? caja.getNombre() : null)
                            .usuarioId(s.getUsuarioId())
                            .usuarioNombre(user != null ? user.getNombre() + " " + user.getApellido() : null)
                            .fechaApertura(s.getFechaApertura() != null ? s.getFechaApertura().format(fmt) : null)
                            .fechaCierre(s.getFechaCierre() != null ? s.getFechaCierre().format(fmt) : null)
                            .montoApertura(s.getMontoApertura())
                            .montoCierre(s.getMontoCierre())
                            .totalVentas(s.getTotalVentas())
                            .diferencia(s.getDiferencia())
                            .estado(s.getEstado() != null ? s.getEstado().name() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return ReporteCajaResponse.builder()
                .totalSesiones(sesiones.size())
                .totalVentas(totalVentas)
                .totalDiferencias(totalDifs)
                .sesiones(sesionResumenes)
                .build();
    }

    // ═══════════════════════════════════════════════════════════════
    //  7. GET /reportes/productos-mas-vendidos — Top N
    // ═══════════════════════════════════════════════════════════════
    @Transactional(readOnly = true)
    public ProductosMasVendidosResponse productosMasVendidos(String fechaDesde, String fechaHasta,
                                                              Long categoriaId, int top) {
        Long tenantId = TenantContext.getCurrentTenantId();

        LocalDateTime desde = fechaDesde != null
                ? LocalDate.parse(fechaDesde).atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime hasta = fechaHasta != null
                ? LocalDate.parse(fechaHasta).atTime(LocalTime.MAX) : LocalDateTime.now();

        // Get completed ventas in range
        List<Long> ventaIds = ventaRepository.findAll().stream()
                .filter(v -> v.getTenantId().equals(tenantId)
                        && v.getEstado() == Venta.EstadoVenta.COMPLETADA
                        && v.getFechaEmision() != null
                        && !v.getFechaEmision().isBefore(desde)
                        && !v.getFechaEmision().isAfter(hasta))
                .map(Venta::getId)
                .collect(Collectors.toList());

        if (ventaIds.isEmpty()) {
            return ProductosMasVendidosResponse.builder()
                    .totalProductosVendidos(0)
                    .productos(Collections.emptyList())
                    .build();
        }

        // Aggregate detalles by productoId
        List<DetalleVenta> detalles = detalleVentaRepository.findAll().stream()
                .filter(d -> ventaIds.contains(d.getVentaId()))
                .collect(Collectors.toList());

        Map<Long, Producto> productoMap = productoRepository.findAll().stream()
                .filter(p -> p.getTenantId().equals(tenantId))
                .collect(Collectors.toMap(Producto::getId, p -> p));

        // Filter by categoriaId if provided
        if (categoriaId != null) {
            detalles = detalles.stream()
                    .filter(d -> {
                        Producto p = productoMap.get(d.getProductoId());
                        return p != null && categoriaId.equals(p.getCategoriaId());
                    })
                    .collect(Collectors.toList());
        }

        Map<Long, List<DetalleVenta>> porProducto = detalles.stream()
                .collect(Collectors.groupingBy(DetalleVenta::getProductoId));

        List<ProductosMasVendidosResponse.ProductoVendido> vendidos = porProducto.entrySet().stream()
                .map(e -> {
                    Producto p = productoMap.get(e.getKey());
                    List<DetalleVenta> dets = e.getValue();
                    long cantidadTotal = dets.stream().mapToLong(d -> d.getCantidad() != null ? d.getCantidad() : 0).sum();
                    BigDecimal montoTotal = dets.stream()
                            .map(d -> d.getSubtotal() != null ? d.getSubtotal() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return ProductosMasVendidosResponse.ProductoVendido.builder()
                            .productoId(e.getKey())
                            .sku(p != null ? p.getSku() : null)
                            .nombre(p != null ? p.getNombre() : dets.get(0).getNombreProducto())
                            .categoriaNombre(p != null && p.getCategoria() != null ? p.getCategoria().getNombre() : null)
                            .cantidadVendida(cantidadTotal)
                            .montoTotal(montoTotal)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getCantidadVendida(), a.getCantidadVendida()))
                .limit(top)
                .collect(Collectors.toList());

        long totalVendidos = detalles.stream().mapToLong(d -> d.getCantidad() != null ? d.getCantidad() : 0).sum();

        return ProductosMasVendidosResponse.builder()
                .totalProductosVendidos(totalVendidos)
                .productos(vendidos)
                .build();
    }
}
