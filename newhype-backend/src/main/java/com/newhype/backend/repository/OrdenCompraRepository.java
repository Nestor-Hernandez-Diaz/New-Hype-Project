package com.newhype.backend.repository;

import com.newhype.backend.entity.OrdenCompra;
import com.newhype.backend.entity.OrdenCompra.EstadoOrdenCompra;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {

    Optional<OrdenCompra> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT o FROM OrdenCompra o WHERE o.tenantId = :tenantId " +
           "AND (:estado IS NULL OR o.estado = :estado) " +
           "AND (:proveedorId IS NULL OR o.proveedorId = :proveedorId) " +
           "ORDER BY o.createdAt DESC")
    Page<OrdenCompra> buscar(@Param("tenantId") Long tenantId,
                             @Param("estado") EstadoOrdenCompra estado,
                             @Param("proveedorId") Long proveedorId,
                             Pageable pageable);

    long countByTenantId(Long tenantId);

    long countByTenantIdAndEstado(Long tenantId, EstadoOrdenCompra estado);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM OrdenCompra o WHERE o.tenantId = :tenantId AND o.estado = :estado")
    java.math.BigDecimal sumTotalByTenantIdAndEstado(@Param("tenantId") Long tenantId,
                                                      @Param("estado") EstadoOrdenCompra estado);
}
