package com.newhype.backend.repository;

import com.newhype.backend.entity.RecepcionCompra;
import com.newhype.backend.entity.RecepcionCompra.EstadoRecepcion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RecepcionCompraRepository extends JpaRepository<RecepcionCompra, Long> {

    Optional<RecepcionCompra> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT r FROM RecepcionCompra r WHERE r.tenantId = :tenantId " +
           "AND (:ordenCompraId IS NULL OR r.ordenCompraId = :ordenCompraId) " +
           "AND (:estado IS NULL OR r.estado = :estado) " +
           "ORDER BY r.createdAt DESC")
    Page<RecepcionCompra> buscar(@Param("tenantId") Long tenantId,
                                 @Param("ordenCompraId") Long ordenCompraId,
                                 @Param("estado") EstadoRecepcion estado,
                                 Pageable pageable);

    long countByTenantIdAndOrdenCompraId(Long tenantId, Long ordenCompraId);
}
