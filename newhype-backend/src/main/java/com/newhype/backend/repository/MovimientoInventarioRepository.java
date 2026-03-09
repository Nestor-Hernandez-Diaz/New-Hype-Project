package com.newhype.backend.repository;

import com.newhype.backend.entity.MovimientoInventario;
import com.newhype.backend.entity.MovimientoInventario.TipoMovimiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    // Queries WITH productoId
    Page<MovimientoInventario> findByTenantIdAndProductoIdOrderByCreatedAtDesc(
            Long tenantId, Long productoId, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndProductoIdAndAlmacenIdOrderByCreatedAtDesc(
            Long tenantId, Long productoId, Long almacenId, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndProductoIdAndTipoInOrderByCreatedAtDesc(
            Long tenantId, Long productoId, List<TipoMovimiento> tipos, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndProductoIdAndAlmacenIdAndTipoInOrderByCreatedAtDesc(
            Long tenantId, Long productoId, Long almacenId, List<TipoMovimiento> tipos, Pageable pageable);

    // Queries WITHOUT productoId (all movements)
    Page<MovimientoInventario> findByTenantIdOrderByCreatedAtDesc(
            Long tenantId, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndAlmacenIdOrderByCreatedAtDesc(
            Long tenantId, Long almacenId, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndTipoInOrderByCreatedAtDesc(
            Long tenantId, List<TipoMovimiento> tipos, Pageable pageable);

    Page<MovimientoInventario> findByTenantIdAndAlmacenIdAndTipoInOrderByCreatedAtDesc(
            Long tenantId, Long almacenId, List<TipoMovimiento> tipos, Pageable pageable);

    long countByTenantIdAndAlmacenId(Long tenantId, Long almacenId);
}
