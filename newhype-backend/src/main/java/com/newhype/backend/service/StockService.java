package com.newhype.backend.service;

import com.newhype.backend.dto.inventario.AjusteInventarioRequest;
import com.newhype.backend.dto.stock.KardexResponse;
import com.newhype.backend.dto.stock.StockResponse;
import com.newhype.backend.entity.MovimientoInventario;
import com.newhype.backend.entity.MovimientoInventario.TipoMovimiento;
import com.newhype.backend.entity.StockAlmacen;
import com.newhype.backend.repository.MovimientoInventarioRepository;
import com.newhype.backend.repository.StockAlmacenRepository;
import com.newhype.backend.security.TenantContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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

    @Transactional
    public KardexResponse ajusteInventario(AjusteInventarioRequest request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        Long usuarioId = TenantContext.getCurrentUserId();

        TipoMovimiento tipo;
        try {
            tipo = TipoMovimiento.valueOf(request.getTipo());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo debe ser AJUSTE_INGRESO o AJUSTE_EGRESO");
        }

        if (tipo != TipoMovimiento.AJUSTE_INGRESO && tipo != TipoMovimiento.AJUSTE_EGRESO) {
            throw new IllegalArgumentException("Tipo debe ser AJUSTE_INGRESO o AJUSTE_EGRESO");
        }

        StockAlmacen sa = stockAlmacenRepository
                .findByTenantIdAndProductoIdAndAlmacenId(tenantId, request.getProductoId(), request.getAlmacenId())
                .orElse(null);

        if (sa == null && tipo == TipoMovimiento.AJUSTE_INGRESO) {
            sa = StockAlmacen.builder()
                    .tenantId(tenantId)
                    .productoId(request.getProductoId())
                    .almacenId(request.getAlmacenId())
                    .cantidad(0)
                    .stockMinimo(0)
                    .build();
            sa = stockAlmacenRepository.save(sa);
        } else if (sa == null) {
            throw new IllegalArgumentException("No existe stock para este producto en el almacén indicado");
        }

        int stockAntes = sa.getCantidad();

        if (tipo == TipoMovimiento.AJUSTE_INGRESO) {
            sa.setCantidad(sa.getCantidad() + request.getCantidad());
        } else {
            if (sa.getCantidad() < request.getCantidad()) {
                throw new IllegalArgumentException(
                        "Stock insuficiente. Disponible: " + sa.getCantidad() + ", Ajuste: " + request.getCantidad());
            }
            sa.setCantidad(sa.getCantidad() - request.getCantidad());
        }

        stockAlmacenRepository.save(sa);

        MovimientoInventario mov = MovimientoInventario.builder()
                .tenantId(tenantId)
                .productoId(request.getProductoId())
                .almacenId(request.getAlmacenId())
                .tipo(tipo)
                .cantidad(request.getCantidad())
                .stockAntes(stockAntes)
                .stockDespues(sa.getCantidad())
                .documentoReferencia(request.getDocumentoReferencia())
                .usuarioId(usuarioId)
                .build();
        mov = movimientoInventarioRepository.save(mov);

        return toKardexResponse(mov);
    }

    @Transactional(readOnly = true)
    public List<List<String>> exportarStockCsv(Long almacenId) {
        List<StockResponse> stocks = consultarStock(almacenId);
        List<List<String>> rows = new ArrayList<>();
        rows.add(List.of("Producto ID", "SKU", "Producto", "Almacén ID", "Almacén", "Cantidad", "Stock Mínimo", "Stock Bajo"));
        for (StockResponse s : stocks) {
            rows.add(List.of(
                    String.valueOf(s.getProductoId()),
                    s.getProductoSku() != null ? s.getProductoSku() : "",
                    s.getProductoNombre() != null ? s.getProductoNombre() : "",
                    String.valueOf(s.getAlmacenId()),
                    s.getAlmacenNombre() != null ? s.getAlmacenNombre() : "",
                    String.valueOf(s.getCantidad()),
                    String.valueOf(s.getStockMinimo()),
                    s.getStockBajo() != null && s.getStockBajo() ? "SI" : "NO"
            ));
        }
        return rows;
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
