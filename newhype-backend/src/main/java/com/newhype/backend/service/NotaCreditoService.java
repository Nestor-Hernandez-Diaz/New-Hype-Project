package com.newhype.backend.service;

import com.newhype.backend.dto.notacredito.*;
import com.newhype.backend.entity.*;
import com.newhype.backend.entity.MovimientoInventario.TipoMovimiento;
import com.newhype.backend.entity.NotaCredito.EstadoNotaCredito;
import com.newhype.backend.entity.NotaCredito.MetodoDevolucion;
import com.newhype.backend.entity.NotaCredito.TipoNotaCredito;
import com.newhype.backend.entity.Venta.EstadoVenta;
import com.newhype.backend.exception.ResourceNotFoundException;
import com.newhype.backend.repository.*;
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
public class NotaCreditoService {

    private final NotaCreditoRepository notaCreditoRepository;
    private final DetalleNotaCreditoRepository detalleNotaCreditoRepository;
    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;
    private final StockAlmacenRepository stockAlmacenRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public NotaCreditoService(NotaCreditoRepository notaCreditoRepository,
                              DetalleNotaCreditoRepository detalleNotaCreditoRepository,
                              VentaRepository ventaRepository,
                              DetalleVentaRepository detalleVentaRepository,
                              StockAlmacenRepository stockAlmacenRepository,
                              MovimientoInventarioRepository movimientoInventarioRepository) {
        this.notaCreditoRepository = notaCreditoRepository;
        this.detalleNotaCreditoRepository = detalleNotaCreditoRepository;
        this.ventaRepository = ventaRepository;
        this.detalleVentaRepository = detalleVentaRepository;
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
    }

    @Transactional
    public NotaCreditoResponse crear(CrearNotaCreditoRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        // Validar venta origen
        Venta venta = ventaRepository.findByIdAndTenantId(request.getVentaOrigenId(), tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", request.getVentaOrigenId()));

        if (venta.getEstado() != EstadoVenta.COMPLETADA) {
            throw new IllegalArgumentException("Solo se pueden emitir notas de crédito para ventas completadas");
        }

        // Generar código
        long count = notaCreditoRepository.countByTenantId(tenantId) + 1;
        String codigo = String.format("NC-%05d", count);

        MetodoDevolucion metodoDevolucion = MetodoDevolucion.VALE;
        if (request.getMetodoDevolucion() != null) {
            metodoDevolucion = MetodoDevolucion.valueOf(request.getMetodoDevolucion());
        }

        NotaCredito nc = NotaCredito.builder()
                .tenantId(tenantId)
                .codigo(codigo)
                .ventaOrigenId(request.getVentaOrigenId())
                .serie(request.getSerie())
                .numero(request.getNumero())
                .motivoSunat(request.getMotivoSunat())
                .tipo(TipoNotaCredito.valueOf(request.getTipo()))
                .descripcion(request.getDescripcion())
                .metodoDevolucion(metodoDevolucion)
                .usuarioId(usuarioId)
                .build();

        nc = notaCreditoRepository.save(nc);

        // Procesar items y devolver stock
        BigDecimal subtotalTotal = BigDecimal.ZERO;

        for (CrearNotaCreditoRequest.ItemDevolucion item : request.getItems()) {
            // Validar detalle de venta original
            DetalleVenta dvOriginal = detalleVentaRepository.findById(item.getDetalleVentaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Detalle de venta", item.getDetalleVentaId()));

            if (!dvOriginal.getVentaId().equals(venta.getId())) {
                throw new IllegalArgumentException("El detalle " + item.getDetalleVentaId() +
                        " no pertenece a la venta " + venta.getId());
            }

            if (item.getCantidad() > dvOriginal.getCantidad()) {
                throw new IllegalArgumentException("La cantidad a devolver (" + item.getCantidad() +
                        ") supera la cantidad vendida (" + dvOriginal.getCantidad() + ")");
            }

            BigDecimal subtotalItem = dvOriginal.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleNotaCredito detalle = DetalleNotaCredito.builder()
                    .notaCreditoId(nc.getId())
                    .productoId(item.getProductoId())
                    .detalleVentaId(item.getDetalleVentaId())
                    .cantidad(item.getCantidad())
                    .precioUnitario(dvOriginal.getPrecioUnitario())
                    .subtotal(subtotalItem)
                    .build();
            detalleNotaCreditoRepository.save(detalle);

            subtotalTotal = subtotalTotal.add(subtotalItem);

            // Devolver stock
            StockAlmacen sa = stockAlmacenRepository
                    .findByTenantIdAndProductoIdAndAlmacenId(tenantId, item.getProductoId(), venta.getAlmacenId())
                    .orElse(null);

            int stockAntes;
            if (sa == null) {
                sa = StockAlmacen.builder()
                        .tenantId(tenantId)
                        .productoId(item.getProductoId())
                        .almacenId(venta.getAlmacenId())
                        .cantidad(0)
                        .stockMinimo(0)
                        .build();
                stockAntes = 0;
            } else {
                stockAntes = sa.getCantidad();
            }

            sa.setCantidad(sa.getCantidad() + item.getCantidad());
            stockAlmacenRepository.save(sa);

            // Kardex de entrada
            MovimientoInventario mov = MovimientoInventario.builder()
                    .tenantId(tenantId)
                    .productoId(item.getProductoId())
                    .almacenId(venta.getAlmacenId())
                    .tipo(TipoMovimiento.ENTRADA)
                    .cantidad(item.getCantidad())
                    .stockAntes(stockAntes)
                    .stockDespues(sa.getCantidad())
                    .documentoReferencia(codigo)
                    .usuarioId(usuarioId)
                    .build();
            movimientoInventarioRepository.save(mov);
        }

        // Calcular totales
        BigDecimal igv = subtotalTotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        nc.setSubtotal(subtotalTotal);
        nc.setIgv(igv);
        nc.setTotal(subtotalTotal.add(igv));
        nc.setEstado(EstadoNotaCredito.APLICADA);
        nc.setFechaReembolso(LocalDateTime.now());

        nc = notaCreditoRepository.save(nc);
        return toResponseCompleto(nc);
    }

    @Transactional(readOnly = true)
    public Page<NotaCreditoResponse> listar(Long ventaOrigenId, String estado, Pageable pageable) {
        Long tenantId = TenantContext.getCurrentTenantId();

        EstadoNotaCredito estadoEnum = null;
        if (estado != null && !estado.isBlank()) {
            estadoEnum = EstadoNotaCredito.valueOf(estado);
        }

        return notaCreditoRepository.buscar(tenantId, ventaOrigenId, estadoEnum, pageable)
                .map(this::toResponseBasico);
    }

    @Transactional(readOnly = true)
    public NotaCreditoResponse obtenerPorId(Long id) {
        Long tenantId = TenantContext.getCurrentTenantId();
        NotaCredito nc = notaCreditoRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("Nota de crédito", id));
        return toResponseCompleto(nc);
    }

    private NotaCreditoResponse toResponseBasico(NotaCredito nc) {
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
                .createdAt(nc.getCreatedAt())
                .build();
    }

    private NotaCreditoResponse toResponseCompleto(NotaCredito nc) {
        NotaCreditoResponse response = toResponseBasico(nc);
        List<DetalleNotaCredito> detalles = detalleNotaCreditoRepository.findByNotaCreditoId(nc.getId());
        response.setDetalles(detalles.stream().map(this::toDetalleResponse).collect(Collectors.toList()));
        return response;
    }

    private DetalleNotaCreditoResponse toDetalleResponse(DetalleNotaCredito d) {
        return DetalleNotaCreditoResponse.builder()
                .id(d.getId())
                .productoId(d.getProductoId())
                .detalleVentaId(d.getDetalleVentaId())
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotal(d.getSubtotal())
                .build();
    }
}
