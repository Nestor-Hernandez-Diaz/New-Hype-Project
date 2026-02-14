package com.newhype.backend.repository;

import com.newhype.backend.entity.MovimientoInventario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    Page<MovimientoInventario> findByTenantIdAndProductoIdOrderByCreatedAtDesc(
            Long tenantId, Long productoId, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndProductoIdAndAlmacenIdOrderByCreatedAtDesc(
            Long tenantId, Long productoId, Long almacenId, Pageable pageable);
}
