package com.newhype.backend.service;

import com.newhype.backend.dto.compra.*;
import com.newhype.backend.entity.DetalleOrdenCompra;
import com.newhype.backend.entity.OrdenCompra;
import com.newhype.backend.entity.OrdenCompra.EstadoOrdenCompra;
import com.newhype.backend.entity.Producto;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.DetalleOrdenCompraRepository;
import com.newhype.backend.repository.OrdenCompraRepository;
import com.newhype.backend.repository.ProductoRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrdenCompraService {

    private static final BigDecimal IGV_RATE = new BigDecimal("0.18");

    private final OrdenCompraRepository ordenCompraRepository;
    private final DetalleOrdenCompraRepository detalleOrdenCompraRepository;
    private final ProductoRepository productoRepository;

    public OrdenCompraService(OrdenCompraRepository ordenCompraRepository,
                              DetalleOrdenCompraRepository detalleOrdenCompraRepository,
                              ProductoRepository productoRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.detalleOrdenCompraRepository = detalleOrdenCompraRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public OrdenCompraResponse crear(CrearOrdenCompraRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        long count = ordenCompraRepository.countByTenantId(tenantId);
        String codigo = String.format("OC-%05d", count + 1);

        OrdenCompra oc = OrdenCompra.builder()
                .tenantId(tenantId)
                .codigo(codigo)
                .proveedorId(request.getProveedorId())
                .almacenDestinoId(request.getAlmacenDestinoId())
                .usuarioId(usuarioId)
                .fechaEmision(LocalDate.now())
                .fechaEntregaEstimada(request.getFechaEntregaEstimada())
                .condicionesPago(request.getCondicionesPago())
                .formaPago(request.getFormaPago())
                .observaciones(request.getObservaciones())
                .build();
        oc = ordenCompraRepository.save(oc);

        BigDecimal subtotalOC = BigDecimal.ZERO;
        BigDecimal descuentoOC = BigDecimal.ZERO;

        for (CrearOrdenCompraRequest.ItemOrdenCompra item : request.getItems()) {
            BigDecimal desc = item.getDescuento() != null ? item.getDescuento() : BigDecimal.ZERO;
            BigDecimal subtotalItem = item.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidadOrdenada()))
                    .subtract(desc);
            BigDecimal igvItem = subtotalItem.multiply(IGV_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalItem = subtotalItem.add(igvItem);

            DetalleOrdenCompra detalle = DetalleOrdenCompra.builder()
                    .ordenCompraId(oc.getId())
                    .productoId(item.getProductoId())
                    .cantidadOrdenada(item.getCantidadOrdenada())
                    .precioUnitario(item.getPrecioUnitario())
                    .descuento(desc)
                    .subtotal(subtotalItem)
                    .igv(igvItem)
                    .total(totalItem)
                    .observaciones(item.getObservaciones())
                    .build();
            detalleOrdenCompraRepository.save(detalle);

            subtotalOC = subtotalOC.add(subtotalItem);
            descuentoOC = descuentoOC.add(desc);
        }

        BigDecimal igvOC = subtotalOC.multiply(IGV_RATE).setScale(2, RoundingMode.HALF_UP);
        oc.setSubtotal(subtotalOC);
        oc.setDescuento(descuentoOC);
        oc.setIgv(igvOC);
        oc.setTotal(subtotalOC.add(igvOC));
        oc = ordenCompraRepository.save(oc);

        return toResponseCompleto(oc);
    }

    @Transactional(readOnly = true)
    public Page<OrdenCompraResponse> listar(String estado, Long proveedorId, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();
        EstadoOrdenCompra estadoEnum = null;
        if (estado != null && !estado.isEmpty()) {
            estadoEnum = EstadoOrdenCompra.valueOf(estado);
        }
        return ordenCompraRepository.buscar(tenantId, estadoEnum, proveedorId, pageable)
                .map(this::toResponseBasico);
    }

    @Transactional(readOnly = true)
    public OrdenCompraResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        OrdenCompra oc = ordenCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenCompra", id));
        return toResponseCompleto(oc);
    }

    @Transactional
    public OrdenCompraResponse actualizar(Long id, CrearOrdenCompraRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        OrdenCompra oc = ordenCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenCompra", id));

        if (oc.getEstado() != EstadoOrdenCompra.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden actualizar OC pendientes");
        }

        oc.setProveedorId(request.getProveedorId());
        oc.setAlmacenDestinoId(request.getAlmacenDestinoId());
        oc.setFechaEntregaEstimada(request.getFechaEntregaEstimada());
        oc.setCondicionesPago(request.getCondicionesPago());
        oc.setFormaPago(request.getFormaPago());
        oc.setObservaciones(request.getObservaciones());

        // Delete old details and recreate
        detalleOrdenCompraRepository.deleteByOrdenCompraId(oc.getId());

        BigDecimal subtotalOC = BigDecimal.ZERO;
        BigDecimal descuentoOC = BigDecimal.ZERO;

        for (CrearOrdenCompraRequest.ItemOrdenCompra item : request.getItems()) {
            BigDecimal desc = item.getDescuento() != null ? item.getDescuento() : BigDecimal.ZERO;
            BigDecimal subtotalItem = item.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidadOrdenada()))
                    .subtract(desc);
            BigDecimal igvItem = subtotalItem.multiply(IGV_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal totalItem = subtotalItem.add(igvItem);

            detalleOrdenCompraRepository.save(DetalleOrdenCompra.builder()
                    .ordenCompraId(oc.getId())
                    .productoId(item.getProductoId())
                    .cantidadOrdenada(item.getCantidadOrdenada())
                    .precioUnitario(item.getPrecioUnitario())
                    .descuento(desc)
                    .subtotal(subtotalItem)
                    .igv(igvItem)
                    .total(totalItem)
                    .observaciones(item.getObservaciones())
                    .build());

            subtotalOC = subtotalOC.add(subtotalItem);
            descuentoOC = descuentoOC.add(desc);
        }

        BigDecimal igvOC = subtotalOC.multiply(IGV_RATE).setScale(2, RoundingMode.HALF_UP);
        oc.setSubtotal(subtotalOC);
        oc.setDescuento(descuentoOC);
        oc.setIgv(igvOC);
        oc.setTotal(subtotalOC.add(igvOC));
        oc = ordenCompraRepository.save(oc);

        return toResponseCompleto(oc);
    }

    @Transactional
    public OrdenCompraResponse cambiarEstado(Long id, String nuevoEstado) {
        Long tenantId = TenantContext.getCurrentTenantId();
        OrdenCompra oc = ordenCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenCompra", id));

        EstadoOrdenCompra nuevo = EstadoOrdenCompra.valueOf(nuevoEstado);
        validarTransicion(oc.getEstado(), nuevo);

        oc.setEstado(nuevo);
        oc = ordenCompraRepository.save(oc);
        return toResponseBasico(oc);
    }

    @Transactional
    public void eliminar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        OrdenCompra oc = ordenCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenCompra", id));

        if (oc.getEstado() == EstadoOrdenCompra.COMPLETADA || oc.getEstado() == EstadoOrdenCompra.PARCIAL) {
            throw new IllegalArgumentException("No se puede eliminar una OC con recepciones");
        }

        oc.setEstado(EstadoOrdenCompra.CANCELADA);
        ordenCompraRepository.save(oc);
    }

    @Transactional(readOnly = true)
    public String generarHtmlOC(Long id) {
        OrdenCompraResponse oc = obtenerPorId(id);

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<title>OC ").append(oc.getCodigo()).append("</title>");
        sb.append("<style>body{font-family:Arial,sans-serif;max-width:700px;margin:20px auto;font-size:13px;}");
        sb.append("table{width:100%;border-collapse:collapse;margin:10px 0;}");
        sb.append("th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;}");
        sb.append("th{background:#f5f5f5;} .right{text-align:right;} .bold{font-weight:bold;}");
        sb.append("h2{text-align:center;}</style></head><body>");

        sb.append("<h2>ORDEN DE COMPRA</h2>");
        sb.append("<p class='bold'>").append(oc.getCodigo()).append("</p>");
        sb.append("<table><tr><td>Proveedor:</td><td>").append(oc.getProveedorNombre() != null ? oc.getProveedorNombre() : oc.getProveedorId()).append("</td>");
        sb.append("<td>Fecha:</td><td>").append(oc.getFechaEmision()).append("</td></tr>");
        sb.append("<tr><td>Almacén destino:</td><td>").append(oc.getAlmacenDestinoNombre() != null ? oc.getAlmacenDestinoNombre() : oc.getAlmacenDestinoId()).append("</td>");
        sb.append("<td>Estado:</td><td>").append(oc.getEstado()).append("</td></tr>");
        if (oc.getCondicionesPago() != null) {
            sb.append("<tr><td>Condiciones:</td><td colspan='3'>").append(oc.getCondicionesPago()).append("</td></tr>");
        }
        sb.append("</table>");

        sb.append("<table><tr><th>Producto</th><th class='right'>Cant.</th><th class='right'>P.U.</th><th class='right'>Desc.</th><th class='right'>Subtotal</th><th class='right'>IGV</th><th class='right'>Total</th></tr>");
        if (oc.getDetalles() != null) {
            for (DetalleOrdenCompraResponse d : oc.getDetalles()) {
                sb.append("<tr><td>").append(d.getProductoNombre() != null ? d.getProductoNombre() : "ID " + d.getProductoId()).append("</td>");
                sb.append("<td class='right'>").append(d.getCantidadOrdenada()).append("</td>");
                sb.append("<td class='right'>").append(d.getPrecioUnitario()).append("</td>");
                sb.append("<td class='right'>").append(d.getDescuento()).append("</td>");
                sb.append("<td class='right'>").append(d.getSubtotal()).append("</td>");
                sb.append("<td class='right'>").append(d.getIgv()).append("</td>");
                sb.append("<td class='right'>").append(d.getTotal()).append("</td></tr>");
            }
        }
        sb.append("</table>");

        sb.append("<table><tr><td>Subtotal:</td><td class='right'>S/ ").append(oc.getSubtotal()).append("</td></tr>");
        sb.append("<tr><td>IGV (18%):</td><td class='right'>S/ ").append(oc.getIgv()).append("</td></tr>");
        sb.append("<tr class='bold'><td>TOTAL:</td><td class='right'>S/ ").append(oc.getTotal()).append("</td></tr></table>");

        sb.append("</body></html>");
        return sb.toString();
    }

    @Transactional(readOnly = true)
    public ComprasEstadisticasResponse estadisticas() {
        Long tenantId = TenantContext.getCurrentTenantId();
        return ComprasEstadisticasResponse.builder()
                .totalOrdenes(ordenCompraRepository.countByTenantId(tenantId))
                .pendientes(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.PENDIENTE))
                .enviadas(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.ENVIADA))
                .confirmadas(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.CONFIRMADA))
                .enRecepcion(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.EN_RECEPCION))
                .parciales(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.PARCIAL))
                .completadas(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.COMPLETADA))
                .canceladas(ordenCompraRepository.countByTenantIdAndEstado(tenantId, EstadoOrdenCompra.CANCELADA))
                .montoTotalCompletadas(ordenCompraRepository.sumTotalByTenantIdAndEstado(tenantId, EstadoOrdenCompra.COMPLETADA))
                .montoTotalPendientes(ordenCompraRepository.sumTotalByTenantIdAndEstado(tenantId, EstadoOrdenCompra.PENDIENTE))
                .build();
    }

    private void validarTransicion(EstadoOrdenCompra actual, EstadoOrdenCompra nuevo) {
        Set<EstadoOrdenCompra> permitidos;
        switch (actual) {
            case PENDIENTE -> permitidos = Set.of(EstadoOrdenCompra.ENVIADA, EstadoOrdenCompra.CANCELADA);
            case ENVIADA -> permitidos = Set.of(EstadoOrdenCompra.CONFIRMADA, EstadoOrdenCompra.CANCELADA);
            case CONFIRMADA -> permitidos = Set.of(EstadoOrdenCompra.EN_RECEPCION, EstadoOrdenCompra.CANCELADA);
            case EN_RECEPCION -> permitidos = Set.of(EstadoOrdenCompra.PARCIAL, EstadoOrdenCompra.COMPLETADA);
            case PARCIAL -> permitidos = Set.of(EstadoOrdenCompra.COMPLETADA);
            default -> throw new IllegalArgumentException("No se puede cambiar estado desde " + actual);
        }
        if (!permitidos.contains(nuevo)) {
            throw new IllegalArgumentException("Transición inválida: " + actual + " → " + nuevo);
        }
    }

    private OrdenCompraResponse toResponseBasico(OrdenCompra oc) {
        return OrdenCompraResponse.builder()
                .id(oc.getId())
                .codigo(oc.getCodigo())
                .proveedorId(oc.getProveedorId())
                .proveedorNombre(oc.getProveedor() != null ?
                        (oc.getProveedor().getRazonSocial() != null ? oc.getProveedor().getRazonSocial() :
                                oc.getProveedor().getNombres() + " " + oc.getProveedor().getApellidos()) : null)
                .almacenDestinoId(oc.getAlmacenDestinoId())
                .almacenDestinoNombre(oc.getAlmacenDestino() != null ? oc.getAlmacenDestino().getNombre() : null)
                .usuarioId(oc.getUsuarioId())
                .fechaEmision(oc.getFechaEmision())
                .fechaEntregaEstimada(oc.getFechaEntregaEstimada())
                .condicionesPago(oc.getCondicionesPago())
                .formaPago(oc.getFormaPago())
                .moneda(oc.getMoneda())
                .subtotal(oc.getSubtotal())
                .descuento(oc.getDescuento())
                .igv(oc.getIgv())
                .total(oc.getTotal())
                .estado(oc.getEstado().name())
                .observaciones(oc.getObservaciones())
                .createdAt(oc.getCreatedAt())
                .build();
    }

    private OrdenCompraResponse toResponseCompleto(OrdenCompra oc) {
        OrdenCompraResponse response = toResponseBasico(oc);
        List<DetalleOrdenCompra> detalles = detalleOrdenCompraRepository.findByOrdenCompraId(oc.getId());
        response.setDetalles(detalles.stream().map(d -> {
            Producto prod = productoRepository.findById(d.getProductoId()).orElse(null);
            return DetalleOrdenCompraResponse.builder()
                    .id(d.getId())
                    .productoId(d.getProductoId())
                    .productoNombre(prod != null ? prod.getNombre() : null)
                    .cantidadOrdenada(d.getCantidadOrdenada())
                    .cantidadRecibida(d.getCantidadRecibida())
                    .precioUnitario(d.getPrecioUnitario())
                    .descuento(d.getDescuento())
                    .subtotal(d.getSubtotal())
                    .igv(d.getIgv())
                    .total(d.getTotal())
                    .observaciones(d.getObservaciones())
                    .build();
        }).collect(Collectors.toList()));
        return response;
    }
}
