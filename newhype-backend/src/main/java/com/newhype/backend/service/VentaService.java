package com.newhype.backend.service;

import com.newhype.backend.dto.notacredito.DetalleNotaCreditoResponse;
import com.newhype.backend.dto.notacredito.NotaCreditoResponse;
import com.newhype.backend.dto.venta.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.entity.MovimientoInventario.TipoMovimiento;
import com.newhype.backend.entity.Venta.EstadoVenta;
import com.newhype.backend.entity.Venta.TipoComprobante;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import com.newhype.backend.entity.ConfiguracionEmpresa;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final PagoVentaRepository pagoVentaRepository;
    private final ProductoRepository productoRepository;
    private final StockAlmacenRepository stockAlmacenRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final SesionCajaRepository sesionCajaRepository;
    private final ConfiguracionEmpresaRepository configuracionEmpresaRepository;
    private final NotaCreditoRepository notaCreditoRepository;
    private final DetalleNotaCreditoRepository detalleNotaCreditoRepository;

    public VentaService(VentaRepository ventaRepository,
                        DetalleVentaRepository detalleVentaRepository,
                        PagoVentaRepository pagoVentaRepository,
                        ProductoRepository productoRepository,
                        StockAlmacenRepository stockAlmacenRepository,
                        MovimientoInventarioRepository movimientoInventarioRepository,
                        SesionCajaRepository sesionCajaRepository,
                        ConfiguracionEmpresaRepository configuracionEmpresaRepository,
                        NotaCreditoRepository notaCreditoRepository,
                        DetalleNotaCreditoRepository detalleNotaCreditoRepository) {
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.pagoVentaRepository = pagoVentaRepository;
        this.productoRepository = productoRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.sesionCajaRepository = sesionCajaRepository;
        this.configuracionEmpresaRepository = configuracionEmpresaRepository;
        this.notaCreditoRepository = notaCreditoRepository;
        this.detalleNotaCreditoRepository = detalleNotaCreditoRepository;
    }

    @Transactional
    public VentaResponse crear(CrearVentaRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        // Generar código de venta
        long count = ventaRepository.countByTenantId(tenantId) + 1;
        String codigoVenta = String.format("VEN-%05d", count);

        TipoComprobante tipoComprobante = TipoComprobante.BOLETA;
        if (request.getTipoComprobante() != null) {
            tipoComprobante = TipoComprobante.valueOf(request.getTipoComprobante().toUpperCase().replace(" ", "_"));
        }

        Venta venta = Venta.builder()
                .tenantId(tenantId)
                .codigoVenta(codigoVenta)
                .sesionCajaId(request.getSesionCajaId())
                .clienteId(request.getClienteId())
                .almacenId(request.getAlmacenId())
                .usuarioId(usuarioId)
                .fechaEmision(LocalDateTime.now())
                .tipoComprobante(tipoComprobante)
                .serie(request.getSerie())
                .numero(request.getNumero())
                .observaciones(request.getObservaciones())
                .build();

        venta = ventaRepository.save(venta);

        // Crear detalles y calcular totales
        BigDecimal subtotalNeto = BigDecimal.ZERO;
        BigDecimal totalDescuento = BigDecimal.ZERO;

        for (CrearVentaRequest.ItemVenta item : request.getItems()) {
            Producto producto = productoRepository.findByIdAndTenantId(item.getProductoId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", item.getProductoId()));

            BigDecimal descuentoItem = item.getDescuento() != null ? item.getDescuento() : BigDecimal.ZERO;
            BigDecimal subtotalItem = item.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidad()))
                    .subtract(descuentoItem);

            DetalleVenta detalle = DetalleVenta.builder()
                    .ventaId(venta.getId())
                    .productoId(item.getProductoId())
                    .nombreProducto(producto.getNombre())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .descuento(descuentoItem)
                    .subtotal(subtotalItem)
                    .build();

            detalleVentaRepository.save(detalle);

            subtotalNeto = subtotalNeto.add(subtotalItem);
            totalDescuento = totalDescuento.add(descuentoItem);
        }

        // IGV: respetar configuración de empresa y flag incluyeIGV
        boolean aplicarIgv = true;
        BigDecimal igvPorcentaje = new BigDecimal("18");

        ConfiguracionEmpresa configEmpresa = configuracionEmpresaRepository.findByTenantId(tenantId).orElse(null);
        if (configEmpresa != null) {
            if (configEmpresa.getIgvActivo() != null && !configEmpresa.getIgvActivo()) {
                aplicarIgv = false;
            }
            if (configEmpresa.getIgvPorcentaje() != null) {
                igvPorcentaje = configEmpresa.getIgvPorcentaje();
            }
        }
        if (request.getIncluyeIGV() != null && !request.getIncluyeIGV()) {
            aplicarIgv = false;
        }

        BigDecimal igv = aplicarIgv
                ? subtotalNeto.multiply(igvPorcentaje).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal total = subtotalNeto.add(igv);

        venta.setSubtotal(subtotalNeto);
        venta.setIgv(igv);
        venta.setDescuento(totalDescuento);
        venta.setTotal(total);
        venta.setIncluyeIgv(aplicarIgv);

        venta = ventaRepository.save(venta);
        return toResponseCompleto(venta);
    }

    @Transactional(readOnly = true)
    public Page<VentaResponse> listar(String estado, String fechaDesde, Long clienteId, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();

        EstadoVenta estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            estadoEnum = EstadoVenta.valueOf(estado);
        }

        LocalDateTime fechaDesdeDateTime = null;
        if (fechaDesde != null && !fechaDesde.isBlank()) {
            fechaDesdeDateTime = LocalDateTime.parse(fechaDesde + "T00:00:00");
        }

        return ventaRepository.buscar(tenantId, estadoEnum, fechaDesdeDateTime, clienteId, pageable)
                .map(this::toResponseBasico);
    }

    @Transactional(readOnly = true)
    public VentaResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Venta venta = ventaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id));
        return toResponseCompleto(venta);
    }

    @Transactional
    public VentaResponse cambiarEstado(Long id, CambiarEstadoVentaRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Venta venta = ventaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id));

        EstadoVenta nuevoEstado = EstadoVenta.valueOf(request.getEstado());

        // Validar transiciones
        if (venta.getEstado() == EstadoVenta.COMPLETADA) {
            throw new IllegalArgumentException("No se puede cambiar el estado de una venta completada. Use notas de crédito.");
        }
        if (venta.getEstado() == EstadoVenta.CANCELADA) {
            throw new IllegalArgumentException("No se puede cambiar el estado de una venta cancelada");
        }
        if (venta.getEstado() == EstadoVenta.PENDIENTE && nuevoEstado == EstadoVenta.COMPLETADA) {
            throw new IllegalArgumentException("Use el endpoint confirmar-pago para completar la venta");
        }

        venta.setEstado(nuevoEstado);
        venta = ventaRepository.save(venta);
        return toResponseBasico(venta);
    }

    @Transactional
    public VentaResponse confirmarPago(Long id, ConfirmarPagoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        Venta venta = ventaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id));

        if (venta.getEstado() != EstadoVenta.PENDIENTE) {
            throw new IllegalArgumentException("Solo se puede confirmar pago de ventas pendientes");
        }

        // 1. Guardar pagos
        int orden = 1;
        for (ConfirmarPagoRequest.PagoItem pagoItem : request.getPagos()) {
            PagoVenta pago = PagoVenta.builder()
                    .ventaId(venta.getId())
                    .metodoPagoId(pagoItem.getMetodoPagoId())
                    .monto(pagoItem.getMonto())
                    .referencia(pagoItem.getReferencia())
                    .orden(orden++)
                    .build();
            pagoVentaRepository.save(pago);
        }

        // 2. Descontar stock y registrar kardex por cada detalle
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(venta.getId());

        for (DetalleVenta dv : detalles) {
            StockAlmacen sa = stockAlmacenRepository
                    .findByTenantIdAndProductoIdAndAlmacenId(tenantId, dv.getProductoId(), venta.getAlmacenId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Sin registro de stock para producto " + dv.getNombreProducto() + " en el almacén"));

            if (sa.getCantidad() < dv.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente para " + dv.getNombreProducto() +
                        ". Disponible: " + sa.getCantidad() + ", Requerido: " + dv.getCantidad());
            }

            int stockAntes = sa.getCantidad();
            sa.setCantidad(sa.getCantidad() - dv.getCantidad());
            stockAlmacenRepository.save(sa);

            // Registrar movimiento de inventario (kardex)
            MovimientoInventario mov = MovimientoInventario.builder()
                    .tenantId(tenantId)
                    .productoId(dv.getProductoId())
                    .almacenId(venta.getAlmacenId())
                    .tipo(TipoMovimiento.SALIDA)
                    .cantidad(dv.getCantidad())
                    .stockAntes(stockAntes)
                    .stockDespues(sa.getCantidad())
                    .documentoReferencia(venta.getCodigoVenta())
                    .usuarioId(usuarioId)
                    .build();
            movimientoInventarioRepository.save(mov);
        }

        // 3. Actualizar venta
        venta.setEstado(EstadoVenta.COMPLETADA);
        venta.setFechaPago(LocalDateTime.now());
        venta.setMontoRecibido(request.getMontoRecibido());
        venta.setMontoCambio(request.getMontoRecibido().subtract(venta.getTotal()));

        // 4. Actualizar total ventas en sesión de caja
        BigDecimal totalVenta = venta.getTotal();
        if (venta.getSesionCajaId() != null) {
            sesionCajaRepository.findByIdAndTenantId(venta.getSesionCajaId(), tenantId)
                    .ifPresent(sesion -> {
                        BigDecimal totalVentas = sesion.getTotalVentas() != null
                                ? sesion.getTotalVentas() : BigDecimal.ZERO;
                        sesion.setTotalVentas(totalVentas.add(totalVenta));
                        sesionCajaRepository.save(sesion);
                    });
        }

        venta = ventaRepository.save(venta);
        return toResponseCompleto(venta);
    }

    @Transactional
    public void eliminar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Venta venta = ventaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id));

        if (venta.getEstado() != EstadoVenta.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden eliminar ventas pendientes");
        }

        detalleVentaRepository.findByVentaId(id).forEach(detalleVentaRepository::delete);
        pagoVentaRepository.findByVentaId(id).forEach(pagoVentaRepository::delete);
        ventaRepository.delete(venta);
    }

    // ── Mappers ──

    private VentaResponse toResponseBasico(Venta v) {
        Long tenantId = TenantContext.getCurrentTenantId();

        VentaResponse.VentaResponseBuilder builder = VentaResponse.builder()
                .id(v.getId())
                .codigoVenta(v.getCodigoVenta())
                .sesionCajaId(v.getSesionCajaId())
                .clienteId(v.getClienteId())
                .clienteNombre(v.getCliente() != null ?
                        (v.getCliente().getRazonSocial() != null ? v.getCliente().getRazonSocial() :
                                v.getCliente().getNombres() + " " + v.getCliente().getApellidos()) : null)
                .clienteTipoDocumento(v.getCliente() != null ? v.getCliente().getTipoDocumento() : null)
                .clienteNumeroDocumento(v.getCliente() != null ? v.getCliente().getNumeroDocumento() : null)
                .clienteDireccion(v.getCliente() != null ? v.getCliente().getDireccion() : null)
                .almacenId(v.getAlmacenId())
                .almacenNombre(v.getAlmacen() != null ? v.getAlmacen().getNombre() : null)
                .usuarioId(v.getUsuarioId())
                .fechaEmision(v.getFechaEmision())
                .tipoComprobante(v.getTipoComprobante() != null ? v.getTipoComprobante().name() : null)
                .serie(v.getSerie())
                .numero(v.getNumero())
                .subtotal(v.getSubtotal())
                .igv(v.getIgv())
                .descuento(v.getDescuento())
                .total(v.getTotal())
                .montoRecibido(v.getMontoRecibido())
                .montoCambio(v.getMontoCambio())
                .estado(v.getEstado() != null ? v.getEstado().name() : null)
                .fechaPago(v.getFechaPago())
                .observaciones(v.getObservaciones())
                .incluyeIgv(v.getIncluyeIgv())
                .createdAt(v.getCreatedAt());

        // Agregar info de Notas de Crédito
        List<NotaCredito> ncs = notaCreditoRepository.findByVentaOrigenIdAndTenantId(v.getId(), tenantId);
        if (!ncs.isEmpty()) {
            BigDecimal montoTotalNC = ncs.stream()
                    .map(nc -> nc.getTotal() != null ? nc.getTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            builder.tieneNotaCredito(true)
                   .montoNotaCredito(montoTotalNC);
        }

        return builder.build();
    }

    private VentaResponse toResponseCompleto(Venta v) {
        VentaResponse response = toResponseBasico(v);
        Long tenantId = TenantContext.getCurrentTenantId();

        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaId(v.getId());
        response.setDetalles(detalles.stream().map(this::toDetalleResponse).collect(Collectors.toList()));

        List<PagoVenta> pagos = pagoVentaRepository.findByVentaId(v.getId());
        response.setPagos(pagos.stream().map(this::toPagoResponse).collect(Collectors.toList()));

        // Agregar Notas de Crédito completas con detalles
        List<NotaCredito> ncs = notaCreditoRepository.findByVentaOrigenIdAndTenantId(v.getId(), tenantId);
        if (!ncs.isEmpty()) {
            List<NotaCreditoResponse> ncResponses = ncs.stream().map(nc -> {
                List<DetalleNotaCredito> ncDetalles = detalleNotaCreditoRepository.findByNotaCreditoId(nc.getId());
                List<DetalleNotaCreditoResponse> detResp = ncDetalles.stream().map(d -> {
                    // Resolver nombre del producto
                    String nombreProd = productoRepository.findById(d.getProductoId())
                            .map(Producto::getNombre).orElse("Producto #" + d.getProductoId());
                    return DetalleNotaCreditoResponse.builder()
                            .id(d.getId())
                            .productoId(d.getProductoId())
                            .detalleVentaId(d.getDetalleVentaId())
                            .nombreProducto(nombreProd)
                            .cantidad(d.getCantidad())
                            .precioUnitario(d.getPrecioUnitario())
                            .subtotal(d.getSubtotal())
                            .build();
                }).collect(Collectors.toList());

                return NotaCreditoResponse.builder()
                        .id(nc.getId())
                        .codigo(nc.getCodigo())
                        .ventaOrigenId(nc.getVentaOrigenId())
                        .serie(nc.getSerie())
                        .numero(nc.getNumero())
                        .motivoSunat(nc.getMotivoSunat())
                        .tipo(nc.getTipo() != null ? nc.getTipo().name() : null)
                        .descripcion(nc.getDescripcion())
                        .subtotal(nc.getSubtotal())
                        .igv(nc.getIgv())
                        .total(nc.getTotal())
                        .metodoDevolucion(nc.getMetodoDevolucion() != null ? nc.getMetodoDevolucion().name() : null)
                        .fechaReembolso(nc.getFechaReembolso())
                        .usuarioId(nc.getUsuarioId())
                        .estado(nc.getEstado() != null ? nc.getEstado().name() : null)
                        .detalles(detResp)
                        .createdAt(nc.getCreatedAt())
                        .build();
            }).collect(Collectors.toList());
            response.setNotasCredito(ncResponses);
        }

        return response;
    }

    private DetalleVentaResponse toDetalleResponse(DetalleVenta dv) {
        String codigoProducto = null;
        if (dv.getProductoId() != null) {
            codigoProducto = productoRepository.findById(dv.getProductoId())
                    .map(Producto::getSku)
                    .orElse(null);
        }
        return DetalleVentaResponse.builder()
                .id(dv.getId())
                .productoId(dv.getProductoId())
                .nombreProducto(dv.getNombreProducto())
                .codigoProducto(codigoProducto)
                .cantidad(dv.getCantidad())
                .precioUnitario(dv.getPrecioUnitario())
                .descuento(dv.getDescuento())
                .subtotal(dv.getSubtotal())
                .build();
    }

    private PagoVentaResponse toPagoResponse(PagoVenta p) {
        return PagoVentaResponse.builder()
                .id(p.getId())
                .metodoPagoId(p.getMetodoPagoId())
                .monto(p.getMonto())
                .referencia(p.getReferencia())
                .observaciones(p.getObservaciones())
                .orden(p.getOrden())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
