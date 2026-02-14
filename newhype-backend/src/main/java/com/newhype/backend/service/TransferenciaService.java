package com.newhype.backend.service;

import com.newhype.backend.dto.transferencia.CrearTransferenciaRequest;
import com.newhype.backend.dto.transferencia.DetalleTransferenciaResponse;
import com.newhype.backend.dto.transferencia.TransferenciaResponse;
import com.newhype.backend.entity.*;
import com.newhype.backend.entity.MovimientoInventario.TipoMovimiento;
import com.newhype.backend.entity.Transferencia.EstadoTransferencia;
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
public class TransferenciaService {

    private final TransferenciaRepository transferenciaRepository;
    private final DetalleTransferenciaRepository detalleTransferenciaRepository;
    private final StockAlmacenRepository stockAlmacenRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final ProductoRepository productoRepository;

    public TransferenciaService(TransferenciaRepository transferenciaRepository,
                                DetalleTransferenciaRepository detalleTransferenciaRepository,
                                StockAlmacenRepository stockAlmacenRepository,
                                MovimientoInventarioRepository movimientoInventarioRepository,
                                ProductoRepository productoRepository) {
        this.transferenciaRepository = transferenciaRepository;
        this.detalleTransferenciaRepository = detalleTransferenciaRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
        this.productoRepository = productoRepository;
    }

    @Transactional
    public TransferenciaResponse crear(CrearTransferenciaRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        if (request.getAlmacenOrigenId().equals(request.getAlmacenDestinoId())) {
            throw new IllegalArgumentException("Almacén origen y destino deben ser diferentes");
        }

        // Generate code
        long count = transferenciaRepository.countByTenantId(tenantId);
        String codigo = String.format("TRF-%05d", count + 1);

        Transferencia t = Transferencia.builder()
                .tenantId(tenantId)
                .codigo(codigo)
                .almacenOrigenId(request.getAlmacenOrigenId())
                .almacenDestinoId(request.getAlmacenDestinoId())
                .motivo(request.getMotivo())
                .solicitadoPorId(usuarioId)
                .observaciones(request.getObservaciones())
                .build();
        t = transferenciaRepository.save(t);

        for (CrearTransferenciaRequest.ItemTransferencia item : request.getItems()) {
            DetalleTransferencia dt = DetalleTransferencia.builder()
                    .transferenciaId(t.getId())
                    .productoId(item.getProductoId())
                    .cantidad(item.getCantidad())
                    .build();
            detalleTransferenciaRepository.save(dt);
        }

        return toResponseCompleto(t);
    }

    @Transactional(readOnly = true)
    public Page<TransferenciaResponse> listar(String estado, Long almacenOrigenId, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();
        EstadoTransferencia estadoEnum = null;
        if (estado != null && !estado.isEmpty()) {
            estadoEnum = EstadoTransferencia.valueOf(estado);
        }
        return transferenciaRepository.buscar(tenantId, estadoEnum, almacenOrigenId, pageable)
                .map(this::toResponseBasico);
    }

    @Transactional(readOnly = true)
    public TransferenciaResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Transferencia t = transferenciaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Transferencia", id));
        return toResponseCompleto(t);
    }

    @Transactional
    public TransferenciaResponse aprobar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        Transferencia t = transferenciaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Transferencia", id));

        if (t.getEstado() != EstadoTransferencia.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden aprobar transferencias pendientes");
        }

        List<DetalleTransferencia> detalles = detalleTransferenciaRepository.findByTransferenciaId(t.getId());

        for (DetalleTransferencia dt : detalles) {
            // 1. Deduct from origin
            StockAlmacen saOrigen = stockAlmacenRepository
                    .findByTenantIdAndProductoIdAndAlmacenId(tenantId, dt.getProductoId(), t.getAlmacenOrigenId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Sin stock para producto " + dt.getProductoId() + " en almacén origen"));

            if (saOrigen.getCantidad() < dt.getCantidad()) {
                Producto prod = productoRepository.findById(dt.getProductoId()).orElse(null);
                String nombre = prod != null ? prod.getNombre() : "ID " + dt.getProductoId();
                throw new IllegalArgumentException(
                        "Stock insuficiente para " + nombre +
                        ". Disponible: " + saOrigen.getCantidad() + ", Requerido: " + dt.getCantidad());
            }

            int stockAntesOrigen = saOrigen.getCantidad();
            saOrigen.setCantidad(saOrigen.getCantidad() - dt.getCantidad());
            stockAlmacenRepository.save(saOrigen);

            // Kardex SALIDA in origin
            movimientoInventarioRepository.save(MovimientoInventario.builder()
                    .tenantId(tenantId)
                    .productoId(dt.getProductoId())
                    .almacenId(t.getAlmacenOrigenId())
                    .tipo(TipoMovimiento.SALIDA)
                    .cantidad(dt.getCantidad())
                    .stockAntes(stockAntesOrigen)
                    .stockDespues(saOrigen.getCantidad())
                    .documentoReferencia(t.getCodigo())
                    .usuarioId(usuarioId)
                    .build());

            // 2. Add to destination
            StockAlmacen saDestino = stockAlmacenRepository
                    .findByTenantIdAndProductoIdAndAlmacenId(tenantId, dt.getProductoId(), t.getAlmacenDestinoId())
                    .orElse(null);

            if (saDestino == null) {
                saDestino = StockAlmacen.builder()
                        .tenantId(tenantId)
                        .productoId(dt.getProductoId())
                        .almacenId(t.getAlmacenDestinoId())
                        .cantidad(0)
                        .stockMinimo(0)
                        .build();
                saDestino = stockAlmacenRepository.save(saDestino);
            }

            int stockAntesDestino = saDestino.getCantidad();
            saDestino.setCantidad(saDestino.getCantidad() + dt.getCantidad());
            stockAlmacenRepository.save(saDestino);

            // Kardex ENTRADA in destination
            movimientoInventarioRepository.save(MovimientoInventario.builder()
                    .tenantId(tenantId)
                    .productoId(dt.getProductoId())
                    .almacenId(t.getAlmacenDestinoId())
                    .tipo(TipoMovimiento.ENTRADA)
                    .cantidad(dt.getCantidad())
                    .stockAntes(stockAntesDestino)
                    .stockDespues(saDestino.getCantidad())
                    .documentoReferencia(t.getCodigo())
                    .usuarioId(usuarioId)
                    .build());
        }

        t.setEstado(EstadoTransferencia.APROBADA);
        t.setAprobadoPorId(usuarioId);
        t.setFechaAprobacion(LocalDateTime.now());
        t.setRecibidoPorId(usuarioId);
        t.setFechaRecepcion(LocalDateTime.now());
        t = transferenciaRepository.save(t);

        return toResponseCompleto(t);
    }

    @Transactional
    public TransferenciaResponse cancelar(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Transferencia t = transferenciaRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Transferencia", id));

        if (t.getEstado() != EstadoTransferencia.PENDIENTE) {
            throw new IllegalArgumentException("Solo se pueden cancelar transferencias pendientes");
        }

        t.setEstado(EstadoTransferencia.CANCELADA);
        t = transferenciaRepository.save(t);
        return toResponseBasico(t);
    }

    private TransferenciaResponse toResponseBasico(Transferencia t) {
        return TransferenciaResponse.builder()
                .id(t.getId())
                .codigo(t.getCodigo())
                .almacenOrigenId(t.getAlmacenOrigenId())
                .almacenOrigenNombre(t.getAlmacenOrigen() != null ? t.getAlmacenOrigen().getNombre() : null)
                .almacenDestinoId(t.getAlmacenDestinoId())
                .almacenDestinoNombre(t.getAlmacenDestino() != null ? t.getAlmacenDestino().getNombre() : null)
                .motivo(t.getMotivo())
                .solicitadoPorId(t.getSolicitadoPorId())
                .aprobadoPorId(t.getAprobadoPorId())
                .fechaAprobacion(t.getFechaAprobacion())
                .estado(t.getEstado().name())
                .observaciones(t.getObservaciones())
                .createdAt(t.getCreatedAt())
                .build();
    }

    private TransferenciaResponse toResponseCompleto(Transferencia t) {
        TransferenciaResponse response = toResponseBasico(t);
        List<DetalleTransferencia> detalles = detalleTransferenciaRepository.findByTransferenciaId(t.getId());
        response.setDetalles(detalles.stream().map(dt -> {
            Producto prod = productoRepository.findById(dt.getProductoId()).orElse(null);
            return DetalleTransferenciaResponse.builder()
                    .id(dt.getId())
                    .productoId(dt.getProductoId())
                    .productoNombre(prod != null ? prod.getNombre() : null)
                    .cantidad(dt.getCantidad())
                    .build();
        }).collect(Collectors.toList()));
        return response;
    }
}
