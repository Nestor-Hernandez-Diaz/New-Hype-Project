package com.newhype.backend.repository;

import com.newhype.backend.entity.Venta;
import com.newhype.backend.entity.Venta.EstadoVenta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT v FROM Venta v WHERE v.tenantId = :tenantId " +
           "AND (:estado IS NULL OR v.estado = :estado) " +
           "AND (:fechaDesde IS NULL OR v.fechaEmision >= :fechaDesde) " +
           "AND (:clienteId IS NULL OR v.clienteId = :clienteId) " +
           "ORDER BY v.fechaEmision DESC")
    Page<Venta> buscar(
            @Param("tenantId") Long tenantId,
            @Param("estado") EstadoVenta estado,
            @Param("fechaDesde") LocalDateTime fechaDesde,
            @Param("clienteId") Long clienteId,
            Pageable pageable);

    long countByTenantId(Long tenantId);
}
