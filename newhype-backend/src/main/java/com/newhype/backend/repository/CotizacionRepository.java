package com.newhype.backend.repository;

import com.newhype.backend.entity.Cotizacion;
import com.newhype.backend.entity.Cotizacion.EstadoCotizacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface CotizacionRepository extends JpaRepository<Cotizacion, Long> {

    Optional<Cotizacion> findByIdAndTenantId(Long id, Long tenantId);

    @Query(value = "SELECT c FROM Cotizacion c LEFT JOIN FETCH c.cliente WHERE c.tenantId = :tenantId " +
           "AND (:estado IS NULL OR c.estado = :estado) " +
           "AND (:fechaDesde IS NULL OR c.fechaEmision >= :fechaDesde) " +
           "AND (:clienteId IS NULL OR c.clienteId = :clienteId) " +
           "ORDER BY c.fechaEmision DESC",
           countQuery = "SELECT COUNT(c) FROM Cotizacion c WHERE c.tenantId = :tenantId " +
           "AND (:estado IS NULL OR c.estado = :estado) " +
           "AND (:fechaDesde IS NULL OR c.fechaEmision >= :fechaDesde) " +
           "AND (:clienteId IS NULL OR c.clienteId = :clienteId)")
    Page<Cotizacion> buscar(
            @Param("tenantId") Long tenantId,
            @Param("estado") EstadoCotizacion estado,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("clienteId") Long clienteId,
            Pageable pageable);

    long countByTenantId(Long tenantId);
}
