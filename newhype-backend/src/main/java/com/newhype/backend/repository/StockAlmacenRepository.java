package com.newhype.backend.repository;

import com.newhype.backend.entity.StockAlmacen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockAlmacenRepository extends JpaRepository<StockAlmacen, Long> {

    List<StockAlmacen> findByTenantId(Long tenantId);

    List<StockAlmacen> findByTenantIdAndAlmacenId(Long tenantId, Long almacenId);

    Optional<StockAlmacen> findByTenantIdAndProductoIdAndAlmacenId(Long tenantId, Long productoId, Long almacenId);

    @Query("SELECT COALESCE(SUM(s.cantidad), 0) FROM StockAlmacen s WHERE s.tenantId = :tenantId AND s.productoId = :productoId")
    Integer sumStockByProducto(@Param("tenantId") Long tenantId, @Param("productoId") Long productoId);

    long countByTenantIdAndAlmacenId(Long tenantId, Long almacenId);
}
