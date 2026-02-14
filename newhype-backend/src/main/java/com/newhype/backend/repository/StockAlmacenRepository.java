package com.newhype.backend.repository;

import com.newhype.backend.entity.StockAlmacen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockAlmacenRepository extends JpaRepository<StockAlmacen, Long> {

    List<StockAlmacen> findByTenantId(Long tenantId);

    List<StockAlmacen> findByTenantIdAndAlmacenId(Long tenantId, Long almacenId);

    Optional<StockAlmacen> findByTenantIdAndProductoIdAndAlmacenId(Long tenantId, Long productoId, Long almacenId);
}
