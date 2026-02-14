package com.newhype.backend.repository;

import com.newhype.backend.entity.PagoSuscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface PagoSuscripcionRepository extends JpaRepository<PagoSuscripcion, Long> {

    List<PagoSuscripcion> findByTenantIdOrderByFechaPagoDesc(Long tenantId);

    List<PagoSuscripcion> findBySuscripcionIdOrderByFechaPagoDesc(Long suscripcionId);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoSuscripcion p " +
           "WHERE p.estado = 'CONFIRMADO' AND p.fechaPago BETWEEN :desde AND :hasta")
    BigDecimal sumarIngresosPorPeriodo(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);

    @Query("SELECT COALESCE(SUM(p.monto), 0) FROM PagoSuscripcion p " +
           "WHERE p.estado = 'CONFIRMADO' AND p.fechaPago BETWEEN :desde AND :hasta " +
           "AND p.suscripcionId IN (SELECT s.id FROM Suscripcion s WHERE s.planId = :planId)")
    BigDecimal sumarIngresosPorPlan(@Param("planId") Long planId,
                                     @Param("desde") LocalDateTime desde,
                                     @Param("hasta") LocalDateTime hasta);

    long countByEstado(PagoSuscripcion.EstadoPago estado);
}
