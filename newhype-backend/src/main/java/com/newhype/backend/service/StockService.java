package com.newhype.backend.service;

import com.newhype.backend.dto.stock.KardexResponse;
import com.newhype.backend.dto.stock.StockResponse;
import com.newhype.backend.entity.MovimientoInventario;
import com.newhype.backend.entity.StockAlmacen;
import com.newhype.backend.repository.MovimientoInventarioRepository;
import com.newhype.backend.repository.StockAlmacenRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockService {

    private final StockAlmacenRepository stockAlmacenRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    public StockService(StockAlmacenRepository stockAlmacenRepository,
                        MovimientoInventarioRepository movimientoInventarioRepository) {
        this.stockAlmacenRepository = stockAlmacenRepository;
        this.movimientoInventarioRepository = movimientoInventarioRepository;
    }

    @Transactional(readOnly = true)
    public List<StockResponse> consultarStock(Long almacenId) {
        Long tenantId = TenantContext.getCurrentTenantId();

        List<StockAlmacen> stocks;
        if (almacenId != null) {
            stocks = stockAlmacenRepository.findByTenantIdAndAlmacenId(tenantId, almacenId);
        } else {
            stocks = stockAlmacenRepository.findByTenantId(tenantId);
        }

        return stocks.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<KardexResponse> getKardex(Long productoId, Long almacenId, int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Pageable pageable = PageRequest.of(page, size);

        Page<MovimientoInventario> movimientos;
        if (almacenId != null) {
            movimientos = movimientoInventarioRepository
                    .findByTenantIdAndProductoIdAndAlmacenIdOrderByCreatedAtDesc(tenantId, productoId, almacenId, pageable);
        } else {
            movimientos = movimientoInventarioRepository
                    .findByTenantIdAndProductoIdOrderByCreatedAtDesc(tenantId, productoId, pageable);
        }

        return movimientos.map(this::toKardexResponse);
    }

    @Transactional(readOnly = true)
    public List<StockResponse> getAlertas() {
        Long tenantId = TenantContext.getCurrentTenantId();
        List<StockAlmacen> stocks = stockAlmacenRepository.findByTenantId(tenantId);

        return stocks.stream()
                .filter(s -> s.getCantidad() != null && s.getStockMinimo() != null
                        && s.getCantidad() <= s.getStockMinimo())
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private StockResponse toResponse(StockAlmacen s) {
        return StockResponse.builder()
                .id(s.getId())
                .productoId(s.getProductoId())
                .productoNombre(s.getProducto() != null ? s.getProducto().getNombre() : null)
                .productoSku(s.getProducto() != null ? s.getProducto().getSku() : null)
                .almacenId(s.getAlmacenId())
                .almacenNombre(s.getAlmacen() != null ? s.getAlmacen().getNombre() : null)
                .cantidad(s.getCantidad())
                .stockMinimo(s.getStockMinimo())
                .stockBajo(s.getCantidad() != null && s.getStockMinimo() != null
                        && s.getCantidad() <= s.getStockMinimo())
                .build();
    }

    private KardexResponse toKardexResponse(MovimientoInventario m) {
        return KardexResponse.builder()
                .id(m.getId())
                .tipo(m.getTipo().name())
                .cantidad(m.getCantidad())
                .stockAntes(m.getStockAntes())
                .stockDespues(m.getStockDespues())
                .documentoReferencia(m.getDocumentoReferencia())
                .almacenId(m.getAlmacenId())
                .usuarioId(m.getUsuarioId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
