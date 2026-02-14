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
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    public RecepcionCompraService(RecepcionCompraRepository recepcionCompraRepository,
                                  DetalleRecepcionCompraRepository detalleRecepcionCompraRepository,
                                  OrdenCompraRepository ordenCompraRepository,
                                  DetalleOrdenCompraRepository detalleOrdenCompraRepository,
                                  StockAlmacenRepository stockAlmacenRepository,
                                  MovimientoInventarioRepository movimientoInventarioRepository,
                                  ProductoRepository productoRepository) {
        this.recepcionCompraRepository = recepcionCompraRepository;
        this.detalleRecepcionCompraRepository = detalleRecepcionCompraRepository;
        this.ordenCompraRepository = ordenCompraRepository;
        this.detalleOrdenCompraRepository = detalleOrdenCompraRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.productoRepository = productoRepository;
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

        long countRec = recepcionCompraRepository.countByTenantIdAndOrdenCompraId(tenantId, oc.getId());
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

    private RecepcionCompraResponse toResponseBasico(RecepcionCompra rec) {
        OrdenCompra oc = ordenCompraRepository.findById(rec.getOrdenCompraId()).orElse(null);
        return RecepcionCompraResponse.builder()
                .id(rec.getId())
                .codigo(rec.getCodigo())
                .ordenCompraId(rec.getOrdenCompraId())
                .ordenCompraCodigo(oc != null ? oc.getCodigo() : null)
                .almacenId(rec.getAlmacenId())
                .recibidoPorId(rec.getRecibidoPorId())
                .fechaRecepcion(rec.getFechaRecepcion())
                .guiaRemision(rec.getGuiaRemision())
                .esRecepcionCompleta(rec.getEsRecepcionCompleta())
                .estado(rec.getEstado().name())
                .observaciones(rec.getObservaciones())
                .createdAt(rec.getCreatedAt())
                .build();
    }

    private RecepcionCompraResponse toResponseCompleto(RecepcionCompra rec) {
        RecepcionCompraResponse response = toResponseBasico(rec);
        List<DetalleRecepcionCompra> detalles = detalleRecepcionCompraRepository.findByRecepcionId(rec.getId());
        response.setDetalles(detalles.stream().map(d -> {
            Producto prod = productoRepository.findById(d.getProductoId()).orElse(null);
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
                    .build();
        }).collect(Collectors.toList()));
        return response;
    }
}
