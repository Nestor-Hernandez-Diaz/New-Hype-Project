package com.newhype.backend.service;

import com.newhype.backend.dto.compra.CrearRecepcionRequest;
import com.newhype.backend.dto.compra.DetalleRecepcionResponse;
import com.newhype.backend.dto.compra.RecepcionCompraResponse;
import com.newhype.backend.entity.*;
import com.newhype.backend.entity.MovimientoInventario.TipoMovimiento;
import com.newhype.backend.entity.OrdenCompra.EstadoOrdenCompra;
import com.newhype.backend.entity.RecepcionCompra.EstadoRecepcion;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
import com.newhype.backend.repository.EntidadComercialRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecepcionCompraService {

    private final RecepcionCompraRepository recepcionCompraRepository;
    private final DetalleRecepcionCompraRepository detalleRecepcionCompraRepository;
    private final OrdenCompraRepository ordenCompraRepository;
    private final DetalleOrdenCompraRepository detalleOrdenCompraRepository;
    private final StockAlmacenRepository stockAlmacenRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final ProductoRepository productoRepository;
    private final AlmacenRepository almacenRepository;
    private final EntidadComercialRepository entidadComercialRepository;

    public RecepcionCompraService(RecepcionCompraRepository recepcionCompraRepository,
                                  DetalleRecepcionCompraRepository detalleRecepcionCompraRepository,
                                  OrdenCompraRepository ordenCompraRepository,
                                  DetalleOrdenCompraRepository detalleOrdenCompraRepository,
                                  StockAlmacenRepository stockAlmacenRepository,
                                  MovimientoInventarioRepository movimientoInventarioRepository,
                                  ProductoRepository productoRepository,
                                  AlmacenRepository almacenRepository,
                                  EntidadComercialRepository entidadComercialRepository) {
        this.recepcionCompraRepository = recepcionCompraRepository;
        this.detalleRecepcionCompraRepository = detalleRecepcionCompraRepository;
        this.ordenCompraRepository = ordenCompraRepository;
        this.detalleOrdenCompraRepository = detalleOrdenCompraRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.productoRepository = productoRepository;
        this.almacenRepository = almacenRepository;
        this.entidadComercialRepository = entidadComercialRepository;
    }

    @Transactional
    public RecepcionCompraResponse crear(CrearRecepcionRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        OrdenCompra oc = ordenCompraRepository.findByIdAndTenantId(request.getOrdenCompraId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("OrdenCompra", request.getOrdenCompraId()));

        if (oc.getEstado() != EstadoOrdenCompra.CONFIRMADA &&
            oc.getEstado() != EstadoOrdenCompra.EN_RECEPCION &&
            oc.getEstado() != EstadoOrdenCompra.PARCIAL) {
            throw new IllegalArgumentException(
                    "Solo se pueden recibir OC en estado CONFIRMADA, EN_RECEPCION o PARCIAL. Estado actual: " + oc.getEstado());
        }

        // Generar código único basado en total de recepciones del tenant (no por OC)
        long countRec = recepcionCompraRepository.countByTenantId(tenantId);
        String codigo = String.format("REC-%05d", countRec + 1);

        RecepcionCompra rec = RecepcionCompra.builder()
                .tenantId(tenantId)
                .codigo(codigo)
                .ordenCompraId(oc.getId())
                .almacenId(oc.getAlmacenDestinoId())
                .recibidoPorId(usuarioId)
                .fechaRecepcion(LocalDateTime.now())
                .guiaRemision(request.getGuiaRemision())
                .observaciones(request.getObservaciones())
                .build();
        rec = recepcionCompraRepository.save(rec);

        for (CrearRecepcionRequest.ItemRecepcion item : request.getItems()) {
            // Validate detail belongs to this OC
            DetalleOrdenCompra doc = detalleOrdenCompraRepository.findById(item.getDetalleOrdenCompraId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "DetalleOrdenCompra no encontrado: " + item.getDetalleOrdenCompraId()));

            if (!doc.getOrdenCompraId().equals(oc.getId())) {
                throw new IllegalArgumentException(
                        "El detalle " + doc.getId() + " no pertenece a la OC " + oc.getCodigo());
            }

            // Validate quantity doesn't exceed remaining
            int yaRecibido = doc.getCantidadRecibida() != null ? doc.getCantidadRecibida() : 0;
            int restante = doc.getCantidadOrdenada() - yaRecibido;
            if (item.getCantidadRecibida() > restante) {
                throw new IllegalArgumentException(
                        "Cantidad recibida (" + item.getCantidadRecibida() + ") excede lo restante (" + restante + ") para producto " + item.getProductoId());
            }

            int rechazada = item.getCantidadRechazada() != null ? item.getCantidadRechazada() : 0;

            DetalleRecepcionCompra drc = DetalleRecepcionCompra.builder()
                    .recepcionId(rec.getId())
                    .detalleOrdenCompraId(item.getDetalleOrdenCompraId())
                    .productoId(item.getProductoId())
                    .cantidadRecibida(item.getCantidadRecibida())
                    .cantidadAceptada(item.getCantidadAceptada())
                    .cantidadRechazada(rechazada)
                    .motivoRechazo(item.getMotivoRechazo())
                    .observaciones(item.getObservaciones())
                    .build();
            detalleRecepcionCompraRepository.save(drc);

            // Update cantidadRecibida on OC detail
            doc.setCantidadRecibida(yaRecibido + item.getCantidadRecibida());
            detalleOrdenCompraRepository.save(doc);
        }

        // Update OC estado to EN_RECEPCION if it was CONFIRMADA
        if (oc.getEstado() == EstadoOrdenCompra.CONFIRMADA) {
            oc.setEstado(EstadoOrdenCompra.EN_RECEPCION);
            ordenCompraRepository.save(oc);
        }

        return toResponseCompleto(rec);
    }

    @Transactional(readOnly = true)
    public Page<RecepcionCompraResponse> listar(Long ordenCompraId, String estado, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();
        EstadoRecepcion estadoEnum = null;
        if (estado != null && !estado.isEmpty()) {
            estadoEnum = EstadoRecepcion.valueOf(estado);
        }
        return recepcionCompraRepository.buscar(tenantId, ordenCompraId, estadoEnum, pageable)
                .map(this::toResponseBasico);
    }

    @Transactional(readOnly = true)
    public RecepcionCompraResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        RecepcionCompra rec = recepcionCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("RecepcionCompra", id));
        return toResponseCompleto(rec);
    }

    @Transactional
    public RecepcionCompraResponse confirmar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        RecepcionCompra rec = recepcionCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("RecepcionCompra", id));

        if (rec.getEstado() != EstadoRecepcion.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden confirmar recepciones pendientes");
        }

        List<DetalleRecepcionCompra> detalles = detalleRecepcionCompraRepository.findByRecepcionId(rec.getId());

        // Increment stock for each accepted item
        for (DetalleRecepcionCompra drc : detalles) {
            if (drc.getCantidadAceptada() > 0) {
                StockAlmacen sa = stockAlmacenRepository
                        .findByTenantIdAndProductoIdAndAlmacenId(tenantId, drc.getProductoId(), rec.getAlmacenId())
                        .orElse(null);

                if (sa == null) {
                    sa = StockAlmacen.builder()
                            .tenantId(tenantId)
                            .productoId(drc.getProductoId())
                            .almacenId(rec.getAlmacenId())
                            .cantidad(0)
                            .stockMinimo(0)
                            .build();
                    sa = stockAlmacenRepository.save(sa);
                }

                int stockAntes = sa.getCantidad();
                sa.setCantidad(sa.getCantidad() + drc.getCantidadAceptada());
                stockAlmacenRepository.save(sa);

                // Kardex ENTRADA
                movimientoInventarioRepository.save(MovimientoInventario.builder()
                        .tenantId(tenantId)
                        .productoId(drc.getProductoId())
                        .almacenId(rec.getAlmacenId())
                        .tipo(TipoMovimiento.ENTRADA)
                        .cantidad(drc.getCantidadAceptada())
                        .stockAntes(stockAntes)
                        .stockDespues(sa.getCantidad())
                        .documentoReferencia(rec.getCodigo())
                        .usuarioId(usuarioId)
                        .build());
            }
        }

        rec.setEstado(EstadoRecepcion.CONFIRMADA);
        rec = recepcionCompraRepository.save(rec);

        // Check if OC is fully received
        OrdenCompra oc = ordenCompraRepository.findById(rec.getOrdenCompraId()).orElse(null);
        if (oc != null) {
            List<DetalleOrdenCompra> detallesOC = detalleOrdenCompraRepository.findByOrdenCompraId(oc.getId());
            boolean todosRecibidos = detallesOC.stream().allMatch(d ->
                    d.getCantidadRecibida() != null && d.getCantidadRecibida() >= d.getCantidadOrdenada());

            if (todosRecibidos) {
                oc.setEstado(EstadoOrdenCompra.COMPLETADA);
            } else {
                boolean algunoRecibido = detallesOC.stream().anyMatch(d ->
                        d.getCantidadRecibida() != null && d.getCantidadRecibida() > 0);
                if (algunoRecibido) {
                    oc.setEstado(EstadoOrdenCompra.PARCIAL);
                }
            }
            ordenCompraRepository.save(oc);

            // Check if this was a complete reception
            boolean esCompleta = detallesOC.stream().allMatch(d ->
                    d.getCantidadRecibida() != null && d.getCantidadRecibida() >= d.getCantidadOrdenada());
            rec.setEsRecepcionCompleta(esCompleta);
            rec = recepcionCompraRepository.save(rec);
        }

        return toResponseCompleto(rec);
    }

    @Transactional
    public RecepcionCompraResponse anular(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();

        RecepcionCompra rec = recepcionCompraRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("RecepcionCompra", id));

        if (rec.getEstado() != EstadoRecepcion.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden anular recepciones pendientes");
        }

        // Revert cantidadRecibida on OC details
        List<DetalleRecepcionCompra> detalles = detalleRecepcionCompraRepository.findByRecepcionId(rec.getId());
        for (DetalleRecepcionCompra drc : detalles) {
            DetalleOrdenCompra doc = detalleOrdenCompraRepository.findById(drc.getDetalleOrdenCompraId()).orElse(null);
            if (doc != null) {
                int recibidaActual = doc.getCantidadRecibida() != null ? doc.getCantidadRecibida() : 0;
                doc.setCantidadRecibida(Math.max(0, recibidaActual - drc.getCantidadRecibida()));
                detalleOrdenCompraRepository.save(doc);
            }
        }

        rec.setEstado(EstadoRecepcion.CANCELADA);
        rec = recepcionCompraRepository.save(rec);

        return toResponseCompleto(rec);
    }

    @Transactional(readOnly = true)
    public String generarHtmlRecepcion(Long id) {
        RecepcionCompraResponse rec = obtenerPorId(id);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'>");
        sb.append("<title>Recepción ").append(rec.getCodigo()).append("</title>");
        sb.append("<style>body{font-family:Arial,sans-serif;max-width:700px;margin:20px auto;font-size:13px;}");
        sb.append("table{width:100%;border-collapse:collapse;margin:10px 0;}");
        sb.append("th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;}");
        sb.append("th{background:#f5f5f5;} .right{text-align:right;} .bold{font-weight:bold;}");
        sb.append("h2{text-align:center;} .estado{display:inline-block;padding:4px 12px;border-radius:4px;font-weight:bold;}");
        sb.append(".PENDIENTE{background:#fff3cd;color:#856404;} .CONFIRMADA{background:#d4edda;color:#155724;} .CANCELADA{background:#f8d7da;color:#721c24;}");
        sb.append("</style></head><body>");

        sb.append("<h2>RECEPCIÓN DE COMPRA</h2>");
        sb.append("<p class='bold'>").append(rec.getCodigo()).append("</p>");

        // Info general
        sb.append("<table>");
        sb.append("<tr><td>Orden de Compra:</td><td>").append(rec.getOrdenCompraCodigo() != null ? rec.getOrdenCompraCodigo() : "N/A").append("</td>");
        sb.append("<td>Fecha Recepción:</td><td>").append(rec.getFechaRecepcion() != null ? rec.getFechaRecepcion().format(fmt) : "").append("</td></tr>");
        sb.append("<tr><td>Proveedor:</td><td>").append(rec.getProveedorNombre() != null ? rec.getProveedorNombre() : "N/A").append("</td>");
        sb.append("<td>Almacén:</td><td>").append(rec.getAlmacenNombre() != null ? rec.getAlmacenNombre() : "N/A").append("</td></tr>");
        sb.append("<tr><td>Estado:</td><td><span class='estado ").append(rec.getEstado()).append("'>").append(rec.getEstado()).append("</span></td>");
        sb.append("<td>Guía Remisión:</td><td>").append(rec.getGuiaRemision() != null ? rec.getGuiaRemision() : "-").append("</td></tr>");
        if (rec.getObservaciones() != null && !rec.getObservaciones().isEmpty()) {
            sb.append("<tr><td>Observaciones:</td><td colspan='3'>").append(rec.getObservaciones()).append("</td></tr>");
        }
        sb.append("</table>");

        // Detalle de productos
        sb.append("<table>");
        sb.append("<tr><th>Producto</th><th class='right'>Ordenada</th><th class='right'>Recibida</th><th class='right'>Aceptada</th><th class='right'>Rechazada</th><th>Observaciones</th></tr>");
        if (rec.getDetalles() != null) {
            for (DetalleRecepcionResponse d : rec.getDetalles()) {
                sb.append("<tr>");
                sb.append("<td>").append(d.getProductoNombre() != null ? d.getProductoNombre() : "ID " + d.getProductoId()).append("</td>");
                sb.append("<td class='right'>").append(d.getCantidadOrdenada() != null ? d.getCantidadOrdenada() : "-").append("</td>");
                sb.append("<td class='right'>").append(d.getCantidadRecibida()).append("</td>");
                sb.append("<td class='right'>").append(d.getCantidadAceptada()).append("</td>");
                sb.append("<td class='right'>").append(d.getCantidadRechazada() != null ? d.getCantidadRechazada() : 0).append("</td>");
                sb.append("<td>").append(d.getObservaciones() != null ? d.getObservaciones() : "-").append("</td>");
                sb.append("</tr>");
            }
        }
        sb.append("</table>");

        // Resumen
        sb.append("<table>");
        sb.append("<tr><td class='bold'>Total Items:</td><td>").append(rec.getCantidadItems() != null ? rec.getCantidadItems() : 0).append("</td></tr>");
        sb.append("<tr><td class='bold'>Recepción Completa:</td><td>").append(Boolean.TRUE.equals(rec.getEsRecepcionCompleta()) ? "Sí" : "No").append("</td></tr>");
        sb.append("</table>");

        sb.append("<div style='text-align:center;margin-top:20px;font-size:10px;'>New Hype ERP - Módulo de Compras</div>");
        sb.append("</body></html>");

        return sb.toString();
    }

    private RecepcionCompraResponse toResponseBasico(RecepcionCompra rec) {
        OrdenCompra oc = ordenCompraRepository.findById(rec.getOrdenCompraId()).orElse(null);
        Almacen almacen = almacenRepository.findById(rec.getAlmacenId()).orElse(null);

        // Obtener nombre del proveedor desde la OC
        String proveedorNombre = null;
        if (oc != null && oc.getProveedorId() != null) {
            EntidadComercial proveedor = entidadComercialRepository.findById(oc.getProveedorId()).orElse(null);
            if (proveedor != null) {
                if (proveedor.getRazonSocial() != null && !proveedor.getRazonSocial().isEmpty()) {
                    proveedorNombre = proveedor.getRazonSocial();
                } else {
                    String nombres = proveedor.getNombres() != null ? proveedor.getNombres() : "";
                    String apellidos = proveedor.getApellidos() != null ? proveedor.getApellidos() : "";
                    proveedorNombre = (nombres + " " + apellidos).trim();
                }
            }
        }

        // Contar items de la recepción
        int cantidadItems = detalleRecepcionCompraRepository.findByRecepcionId(rec.getId()).size();

        return RecepcionCompraResponse.builder()
                .id(rec.getId())
                .codigo(rec.getCodigo())
                .ordenCompraId(rec.getOrdenCompraId())
                .ordenCompraCodigo(oc != null ? oc.getCodigo() : null)
                .almacenId(rec.getAlmacenId())
                .almacenNombre(almacen != null ? almacen.getNombre() : null)
                .recibidoPorId(rec.getRecibidoPorId())
                .fechaRecepcion(rec.getFechaRecepcion())
                .guiaRemision(rec.getGuiaRemision())
                .esRecepcionCompleta(rec.getEsRecepcionCompleta())
                .estado(rec.getEstado().name())
                .observaciones(rec.getObservaciones())
                .cantidadItems(cantidadItems)
                .proveedorNombre(proveedorNombre)
                .ordenCompraEstado(oc != null ? oc.getEstado().name() : null)
                .createdAt(rec.getCreatedAt())
                .build();
    }

    private RecepcionCompraResponse toResponseCompleto(RecepcionCompra rec) {
        RecepcionCompraResponse response = toResponseBasico(rec);
        List<DetalleRecepcionCompra> detalles = detalleRecepcionCompraRepository.findByRecepcionId(rec.getId());
        response.setDetalles(detalles.stream().map(d -> {
            Producto prod = productoRepository.findById(d.getProductoId()).orElse(null);

            // Obtener datos de la orden de compra para este item
            Integer cantidadOrdenada = null;
            Integer cantidadRecibidaOC = null;
            Integer cantidadPendiente = null;
            DetalleOrdenCompra doc = detalleOrdenCompraRepository.findById(d.getDetalleOrdenCompraId()).orElse(null);
            if (doc != null) {
                cantidadOrdenada = doc.getCantidadOrdenada();
                cantidadRecibidaOC = doc.getCantidadRecibida() != null ? doc.getCantidadRecibida() : 0;
                cantidadPendiente = cantidadOrdenada - cantidadRecibidaOC;
            }

            return DetalleRecepcionResponse.builder()
                    .id(d.getId())
                    .detalleOrdenCompraId(d.getDetalleOrdenCompraId())
                    .productoId(d.getProductoId())
                    .productoNombre(prod != null ? prod.getNombre() : null)
                    .cantidadRecibida(d.getCantidadRecibida())
                    .cantidadAceptada(d.getCantidadAceptada())
                    .cantidadRechazada(d.getCantidadRechazada())
                    .motivoRechazo(d.getMotivoRechazo())
                    .observaciones(d.getObservaciones())
                    .cantidadOrdenada(cantidadOrdenada)
                    .cantidadRecibidaOC(cantidadRecibidaOC)
                    .cantidadPendiente(cantidadPendiente)
                    .build();
        }).collect(Collectors.toList()));
        return response;
    }
}
