package com.newhype.backend.repository;

import com.newhype.backend.entity.NotaCredito;
import com.newhype.backend.entity.NotaCredito.EstadoNotaCredito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface NotaCreditoRepository extends JpaRepository<NotaCredito, Long> {

    Optional<NotaCredito> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT nc FROM NotaCredito nc WHERE nc.tenantId = :tenantId " +
           "AND (:ventaOrigenId IS NULL OR nc.ventaOrigenId = :ventaOrigenId) " +
           "AND (:estado IS NULL OR nc.estado = :estado) " +
           "ORDER BY nc.createdAt DESC")
    Page<NotaCredito> buscar(
            @Param("tenantId") Long tenantId,
            @Param("ventaOrigenId") Long ventaOrigenId,
            @Param("estado") EstadoNotaCredito estado,
            Pageable pageable);

    long countByTenantId(Long tenantId);
}
