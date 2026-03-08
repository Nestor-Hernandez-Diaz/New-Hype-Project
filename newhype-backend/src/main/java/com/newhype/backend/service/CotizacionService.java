package com.newhype.backend.service;

import com.newhype.backend.dto.cotizacion.*;
import com.newhype.backend.dto.venta.CrearVentaRequest;
import com.newhype.backend.dto.venta.VentaResponse;
import com.newhype.backend.entity.Cotizacion;
import com.newhype.backend.entity.Cotizacion.EstadoCotizacion;
import com.newhype.backend.entity.DetalleCotizacion;
import com.newhype.backend.entity.Producto;
import com.newhype.backend.entity.ConfiguracionEmpresa;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.CotizacionRepository;
import com.newhype.backend.repository.DetalleCotizacionRepository;
import com.newhype.backend.repository.ProductoRepository;
import com.newhype.backend.repository.ConfiguracionEmpresaRepository;
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
public class CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final DetalleCotizacionRepository detalleCotizacionRepository;
    private final ProductoRepository productoRepository;
    private final ConfiguracionEmpresaRepository configuracionEmpresaRepository;
    private final VentaService ventaService;

    public CotizacionService(CotizacionRepository cotizacionRepository,
                             DetalleCotizacionRepository detalleCotizacionRepository,
                             ProductoRepository productoRepository,
                             ConfiguracionEmpresaRepository configuracionEmpresaRepository,
                             VentaService ventaService) {
        this.cotizacionRepository = cotizacionRepository;
        this.detalleCotizacionRepository = detalleCotizacionRepository;
        this.productoRepository = productoRepository;
        this.configuracionEmpresaRepository = configuracionEmpresaRepository;
        this.ventaService = ventaService;
    }

    @Transactional
    public CotizacionResponse crear(CrearCotizacionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        long count = cotizacionRepository.countByTenantId(tenantId) + 1;
        String codigoCotizacion = String.format("COT-%05d", count);

        int diasValidez = request.getDiasValidez() != null ? request.getDiasValidez() : 30;

        Cotizacion cotizacion = Cotizacion.builder()
                .tenantId(tenantId)
                .codigoCotizacion(codigoCotizacion)
                .clienteId(request.getClienteId())
                .almacenId(request.getAlmacenId())
                .usuarioId(usuarioId)
                .fechaEmision(LocalDateTime.now())
                .fechaVencimiento(LocalDateTime.now().plusDays(diasValidez))
                .diasValidez(diasValidez)
                .observaciones(request.getObservaciones())
                .build();

        cotizacion = cotizacionRepository.save(cotizacion);

        BigDecimal subtotalNeto = BigDecimal.ZERO;

        for (CrearCotizacionRequest.ItemCotizacion item : request.getItems()) {
            Producto producto = productoRepository.findByIdAndTenantId(item.getProductoId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", item.getProductoId()));

            BigDecimal subtotalItem = item.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleCotizacion detalle = DetalleCotizacion.builder()
                    .cotizacionId(cotizacion.getId())
                    .productoId(item.getProductoId())
                    .nombreProducto(producto.getNombre())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .subtotal(subtotalItem)
                    .build();

            detalleCotizacionRepository.save(detalle);
            subtotalNeto = subtotalNeto.add(subtotalItem);
        }

        BigDecimal igv = BigDecimal.ZERO;
        ConfiguracionEmpresa configEmpresa = configuracionEmpresaRepository.findByTenantId(tenantId).orElse(null);
        if (configEmpresa != null && configEmpresa.getIgvActivo() != null && configEmpresa.getIgvActivo()) {
            BigDecimal porcentaje = configEmpresa.getIgvPorcentaje() != null ? configEmpresa.getIgvPorcentaje() : new BigDecimal("18");
            igv = subtotalNeto.multiply(porcentaje).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }
        BigDecimal total = subtotalNeto.add(igv);

        cotizacion.setSubtotal(subtotalNeto);
        cotizacion.setIgv(igv);
        cotizacion.setTotal(total);

        cotizacion = cotizacionRepository.save(cotizacion);
        return toResponseCompleto(cotizacion);
    }

    @Transactional(readOnly = true)
    public Page<CotizacionResponse> listar(String estado, String fechaDesde, Long clienteId, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();

        EstadoCotizacion estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            estadoEnum = EstadoCotizacion.valueOf(estado.toUpperCase());
        }

        LocalDateTime fechaDesdeDateTime = null;
        if (fechaDesde != null && !fechaDesde.isBlank()) {
            fechaDesdeDateTime = LocalDateTime.parse(fechaDesde + "T00:00:00");
        }

        return cotizacionRepository.buscar(tenantId, estadoEnum, fechaDesdeDateTime, clienteId, pageable)
                .map(this::toResponseBasico);
    }

    @Transactional(readOnly = true)
    public CotizacionResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Cotizacion cotizacion = cotizacionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización", id));
        return toResponseCompleto(cotizacion);
    }

    @Transactional
    public CotizacionResponse actualizar(Long id, CrearCotizacionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Cotizacion cotizacion = cotizacionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización", id));

        if (cotizacion.getEstado() != EstadoCotizacion.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden editar cotizaciones pendientes");
        }

        cotizacion.setClienteId(request.getClienteId());
        cotizacion.setAlmacenId(request.getAlmacenId());
        cotizacion.setObservaciones(request.getObservaciones());

        if (request.getDiasValidez() != null) {
            cotizacion.setDiasValidez(request.getDiasValidez());
            cotizacion.setFechaVencimiento(cotizacion.getFechaEmision().plusDays(request.getDiasValidez()));
        }

        // Delete old details
        detalleCotizacionRepository.findByCotizacionId(id)
                .forEach(detalleCotizacionRepository::delete);

        // Recreate details
        BigDecimal subtotalNeto = BigDecimal.ZERO;

        for (CrearCotizacionRequest.ItemCotizacion item : request.getItems()) {
            Producto producto = productoRepository.findByIdAndTenantId(item.getProductoId(), tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Producto", item.getProductoId()));

            BigDecimal subtotalItem = item.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleCotizacion detalle = DetalleCotizacion.builder()
                    .cotizacionId(id)
                    .productoId(item.getProductoId())
                    .nombreProducto(producto.getNombre())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .subtotal(subtotalItem)
                    .build();

            detalleCotizacionRepository.save(detalle);
            subtotalNeto = subtotalNeto.add(subtotalItem);
        }

        BigDecimal igvActualizar = BigDecimal.ZERO;
        ConfiguracionEmpresa configActualizar = configuracionEmpresaRepository.findByTenantId(tenantId).orElse(null);
        if (configActualizar != null && configActualizar.getIgvActivo() != null && configActualizar.getIgvActivo()) {
            BigDecimal porcentaje = configActualizar.getIgvPorcentaje() != null ? configActualizar.getIgvPorcentaje() : new BigDecimal("18");
            igvActualizar = subtotalNeto.multiply(porcentaje).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        }
        BigDecimal totalActualizar = subtotalNeto.add(igvActualizar);

        cotizacion.setSubtotal(subtotalNeto);
        cotizacion.setIgv(igvActualizar);
        cotizacion.setTotal(totalActualizar);

        cotizacion = cotizacionRepository.save(cotizacion);
        return toResponseCompleto(cotizacion);
    }

    @Transactional
    public CotizacionResponse cambiarEstado(Long id, String nuevoEstado, String motivoRechazo) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Cotizacion cotizacion = cotizacionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización", id));

        EstadoCotizacion estadoNuevo = EstadoCotizacion.valueOf(nuevoEstado.toUpperCase());

        // Validate transitions
        EstadoCotizacion estadoActual = cotizacion.getEstado();
        if (estadoActual == EstadoCotizacion.CONVERTIDA) {
            throw new IllegalArgumentException("No se puede cambiar el estado de una cotización ya convertida a venta");
        }
        if (estadoActual == EstadoCotizacion.CANCELADA) {
            throw new IllegalArgumentException("No se puede cambiar el estado de una cotización cancelada");
        }

        cotizacion.setEstado(estadoNuevo);
        if (estadoNuevo == EstadoCotizacion.RECHAZADA && motivoRechazo != null) {
            cotizacion.setMotivoRechazo(motivoRechazo);
        }

        cotizacion = cotizacionRepository.save(cotizacion);
        return toResponseBasico(cotizacion);
    }

    @Transactional
    public VentaResponse convertirAVenta(Long id, ConvertirCotizacionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Cotizacion cotizacion = cotizacionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización", id));

        if (cotizacion.getEstado() != EstadoCotizacion.PENDIENTE &&
            cotizacion.getEstado() != EstadoCotizacion.ACEPTADA) {
            throw new IllegalArgumentException(
                    "Solo se pueden convertir cotizaciones en estado PENDIENTE o ACEPTADA. Estado actual: " + cotizacion.getEstado());
        }

        // Build CrearVentaRequest from cotizacion data
        List<DetalleCotizacion> detalles = detalleCotizacionRepository.findByCotizacionId(id);

        List<CrearVentaRequest.ItemVenta> items = detalles.stream()
                .map(d -> CrearVentaRequest.ItemVenta.builder()
                        .productoId(d.getProductoId())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .build())
                .collect(Collectors.toList());

        CrearVentaRequest ventaRequest = CrearVentaRequest.builder()
                .sesionCajaId(request.getSesionCajaId())
                .clienteId(cotizacion.getClienteId())
                .almacenId(cotizacion.getAlmacenId())
                .tipoComprobante(request.getTipoComprobante())
                .serie(request.getSerie())
                .numero(request.getNumero())
                .observaciones(request.getObservaciones() != null
                        ? request.getObservaciones()
                        : "Generada desde cotización " + cotizacion.getCodigoCotizacion())
                .items(items)
                .build();

        VentaResponse venta = ventaService.crear(ventaRequest);

        // Mark cotizacion as converted
        cotizacion.setEstado(EstadoCotizacion.CONVERTIDA);
        cotizacion.setIntentosConversion(cotizacion.getIntentosConversion() + 1);
        cotizacionRepository.save(cotizacion);

        return venta;
    }

    @Transactional
    public void eliminar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Cotizacion cotizacion = cotizacionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Cotización", id));

        if (cotizacion.getEstado() == EstadoCotizacion.CONVERTIDA) {
            throw new IllegalArgumentException("No se puede eliminar una cotización ya convertida a venta");
        }

        detalleCotizacionRepository.findByCotizacionId(id)
                .forEach(detalleCotizacionRepository::delete);
        cotizacionRepository.delete(cotizacion);
    }

    // -- Mappers --

    private CotizacionResponse toResponseBasico(Cotizacion c) {
        return CotizacionResponse.builder()
                .id(c.getId())
                .codigoCotizacion(c.getCodigoCotizacion())
                .clienteId(c.getClienteId())
                .clienteNombre(c.getCliente() != null ?
                        (c.getCliente().getRazonSocial() != null ? c.getCliente().getRazonSocial() :
                                c.getCliente().getNombres() + " " + c.getCliente().getApellidos()) : null)
                .almacenId(c.getAlmacenId())
                .almacenNombre(c.getAlmacen() != null ? c.getAlmacen().getNombre() : null)
                .usuarioId(c.getUsuarioId())
                .fechaEmision(c.getFechaEmision())
                .fechaVencimiento(c.getFechaVencimiento())
                .diasValidez(c.getDiasValidez())
                .subtotal(c.getSubtotal())
                .igv(c.getIgv())
                .total(c.getTotal())
                .estado(c.getEstado() != null ? c.getEstado().name() : null)
                .observaciones(c.getObservaciones())
                .motivoRechazo(c.getMotivoRechazo())
                .intentosConversion(c.getIntentosConversion())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private CotizacionResponse toResponseCompleto(Cotizacion c) {
        CotizacionResponse response = toResponseBasico(c);

        List<DetalleCotizacion> detalles = detalleCotizacionRepository.findByCotizacionId(c.getId());
        response.setDetalles(detalles.stream()
                .map(this::toDetalleResponse)
                .collect(Collectors.toList()));

        return response;
    }

    private DetalleCotizacionResponse toDetalleResponse(DetalleCotizacion d) {
        return DetalleCotizacionResponse.builder()
                .id(d.getId())
                .productoId(d.getProductoId())
                .nombreProducto(d.getNombreProducto())
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotal(d.getSubtotal())
                .build();
    }
}
