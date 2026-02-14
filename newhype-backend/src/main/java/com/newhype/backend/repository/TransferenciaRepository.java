package com.newhype.backend.repository;

import com.newhype.backend.entity.Transferencia;
import com.newhype.backend.entity.Transferencia.EstadoTransferencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TransferenciaRepository extends JpaRepository<Transferencia, Long> {

    Optional<Transferencia> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT t FROM Transferencia t WHERE t.tenantId = :tenantId " +
           "AND (:estado IS NULL OR t.estado = :estado) " +
           "AND (:almacenOrigenId IS NULL OR t.almacenOrigenId = :almacenOrigenId) " +
           "ORDER BY t.createdAt DESC")
    Page<Transferencia> buscar(@Param("tenantId") Long tenantId,
                               @Param("estado") EstadoTransferencia estado,
                               @Param("almacenOrigenId") Long almacenOrigenId,
                               Pageable pageable);

    long countByTenantId(Long tenantId);
}
